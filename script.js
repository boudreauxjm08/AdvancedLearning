/* ==========================================================================
   PATH — script.js
   This file holds the app logic. All of the content (survey questions, topic
   words, study themes, school subjects, local opportunities) lives in data.js,
   which is loaded first.

   Sections:
     1. STATE         - the one object that holds everything about the student,
                         plus save/load helpers (Firebase when logged in)
     2. NAVIGATION    - functions that show/hide the screens of the app
     3. SCREEN LOGIC  - topics, info, survey, study themes, theme page,
                         dashboard, and the courses & skills web
     4. LOGIN         - Firebase sign up, log in, and password reset
     5. STARTUP       - wires up the buttons and shows the first screen

   How PATH works: the student types three topics. PATH turns each topic into
   interests, finds study themes that overlap as many of them as possible, and
   uses the survey ("how do you like to learn?") plus course ratings to decide
   which themes and activities to highlight. The student always chooses.
   ========================================================================== */


/* ============================================================
   1. STATE
   ============================================================ */

const STORAGE_KEY = "pathAppState"; // fallback key, used only if Firebase isn't configured

// Everything the app remembers about the current student lives in this
// one object. Once a student is logged in, it's saved to their own
// document in Firestore after every change, so their roadmap and progress
// follow them to any device they log in from.
function defaultState() {
  return {
    studentInfo: { city: "", state: "", zip: "", level: "", grade: "" },
    quizAnswers: {},          // { questionIndex: [categoryKey, ...] }
    currentQuestionIndex: 0,
    categoryScores: null,     // filled in once the quiz is scored
    topics: ["", "", ""],     // the three topics the student typed
    selectedThemeId: null,    // the study theme they chose to explore
    stepStatus: {},           // { careerId: { stepId: "Not Started" | "In Progress" | "Completed" } }
    courses: {},              // { courseId: { status: "Not Taken" | "In Progress" | "Taken", rating: 0-5 or null } }
  };
}

let state = defaultState();

// Firestore doesn't allow "undefined" values, and it can't store an object
// keyed by things like question index 0 quite as loosely as plain JS --
// JSON round-tripping keeps the shape totally predictable either way.
function cloneState(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* ---- Local fallback (used only if firebase-config.js still has
        placeholder values, so the app still works out of the box) ---- */

function loadStateLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (err) {
    console.warn("Could not read saved PATH progress, starting fresh.", err);
    return defaultState();
  }
}

function saveStateLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Could not save PATH progress.", err);
  }
}

/* ---- Firestore-backed save/load, used once a student is logged in ---- */

let currentUser = null;       // the logged-in Firebase user, or null
let firebaseReady = false;    // true once firebase-config.js has real keys
let saveTimer = null;         // used to debounce rapid saves (e.g. quiz clicks)

function isFirebaseConfigured() {
  return (
    typeof firebaseConfig !== "undefined" &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "REPLACE_ME"
  );
}

async function loadStateForUser(uid) {
  try {
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists && doc.data().pathState) {
      return Object.assign(defaultState(), doc.data().pathState);
    }
    return defaultState();
  } catch (err) {
    console.warn("Could not load saved PATH progress from your account.", err);
    return defaultState();
  }
}

// Saving is debounced by ~500ms so that clicking through quiz answers
// quickly doesn't fire a network write on every single click.
function saveState() {
  if (!firebaseReady) {
    saveStateLocal();
    return;
  }
  if (!currentUser) return; // shouldn't happen -- every screen after login requires a user

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    db.collection("users")
      .doc(currentUser.uid)
      .set({ pathState: cloneState(state), updatedAt: new Date().toISOString() }, { merge: true })
      .catch((err) => console.warn("Could not save PATH progress to your account.", err));
  }, 500);
}

// Returns (creating if necessary) the status map for one career.
function getStepStatusMap(careerId) {
  if (!state.stepStatus[careerId]) state.stepStatus[careerId] = {};
  return state.stepStatus[careerId];
}

/* ---- Course tracking helpers ---- */

const COURSE_STATUS_CYCLE = { "Not Taken": "In Progress", "In Progress": "Taken", "Taken": "Not Taken" };
const COURSE_STATUS_LABELS = { "Not Taken": "Not taken", "In Progress": "In progress", "Taken": "Taken" };

// Ratings run from 0 to 5. These words show up as hover text and captions.
const RATING_LABELS = [
  "Really didn't like it",
  "Didn't like it",
  "Not a fan",
  "It was fine",
  "Liked it",
  "Loved it",
];

// Escapes text before it is placed into HTML so names like "Anatomy & Physiology" are safe.
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function courseName(courseId) {
  const found = COURSES.find((c) => c.id === courseId);
  return found ? found.name : courseId;
}

// Read a course's status/rating WITHOUT creating anything in the saved state.
function peekCourse(courseId) {
  const rec = state.courses && state.courses[courseId];
  if (!rec) return { status: "Not Taken", rating: null };
  return { status: rec.status || "Not Taken", rating: rec.rating === undefined ? null : rec.rating };
}

// Get (and create if needed) the saved record for a course so it can be changed.
function getCourseRecord(courseId) {
  if (!state.courses) state.courses = {};
  if (!state.courses[courseId]) state.courses[courseId] = { status: "Not Taken", rating: null };
  return state.courses[courseId];
}

// How much the student has "used" each subject. This sets bubble size on the web.
//   a course marked Taken = 3, In Progress = 1.5
//   every study thread finished (or started) adds a little to each subject the
//   theme uses, scaled by how important that subject is to the theme
function getCourseUsage() {
  const usage = {};
  COURSES.forEach((course) => {
    const rec = peekCourse(course.id);
    usage[course.id] = rec.status === "Taken" ? 3 : rec.status === "In Progress" ? 1.5 : 0;
  });

  getAllThemes().forEach((theme) => {
    const statuses = state.stepStatus[theme.id];
    if (!statuses) return;
    buildThreads(theme).forEach((thread) => {
      const factor = statuses[thread.id] === "Completed" ? 0.3 : statuses[thread.id] === "In Progress" ? 0.15 : 0;
      if (!factor) return;
      Object.entries(theme.subjects || {}).forEach(([courseId, weight]) => {
        if (usage[courseId] !== undefined) usage[courseId] += factor * weight;
      });
    });
  });

  return usage;
}


/* ============================================================
   2. NAVIGATION
   ============================================================ */

// The six stages shown as dots in the header trail.
const STAGES = [
  { screen: "welcome",   label: "Welcome" },
  { screen: "topics",    label: "Your topics" },
  { screen: "info",      label: "About you" },
  { screen: "quiz",      label: "How you learn" },
  { screen: "results",   label: "Study themes" },
  { screen: "detail",    label: "Your path" },
  { screen: "dashboard", label: "Progress" },
];

// Screens that are not one of the six main stages light up the closest stage instead.
const TRAIL_ALIAS = { courses: "results" };

function goToScreen(screenName) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.screen === screenName);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderTrail(screenName);

  // Each screen needs a little setup work whenever it becomes visible.
  if (screenName === "topics") fillTopicsForm();
  if (screenName === "info") fillInfoForm();
  if (screenName === "quiz") renderQuizQuestion();
  if (screenName === "results") renderResults();
  if (screenName === "detail") renderDetail();
  if (screenName === "dashboard") renderDashboard();
  if (screenName === "courses") renderCourses();
}

function renderTrail(activeScreen) {
  const trail = document.getElementById("trail");
  trail.innerHTML = "";
  const activeIndex = STAGES.findIndex((s) => s.screen === (TRAIL_ALIAS[activeScreen] || activeScreen));

  STAGES.forEach((stage, i) => {
    const dot = document.createElement("span");
    dot.className = "trail__dot";
    dot.title = stage.label;
    if (i < activeIndex) dot.classList.add("is-done");
    if (i === activeIndex) dot.classList.add("is-current");
    trail.appendChild(dot);

    if (i < STAGES.length - 1) {
      const seg = document.createElement("span");
      seg.className = "trail__seg";
      trail.appendChild(seg);
    }
  });
}


/* ============================================================
   4. SCREEN LOGIC
   ============================================================ */

/* ---------- Screen 2: student info ---------- */

function fillInfoForm() {
  const info = state.studentInfo;
  document.getElementById("input-city").value = info.city || "";
  document.getElementById("input-state").value = info.state || "";
  document.getElementById("input-zip").value = info.zip || "";
  document.getElementById("input-grade").value = info.grade || "";
  document.querySelectorAll('input[name="level"]').forEach((el) => {
    el.checked = el.value === info.level;
  });
}

document.getElementById("form-info").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  state.studentInfo = {
    city: form.city.value.trim(),
    state: form.state.value.trim(),
    zip: form.zip.value.trim(),
    level: form.level.value,
    grade: form.grade.value.trim(),
  };
  saveState();
  goToScreen("quiz");
});

/* ---------- Screen 3: interest assessment ---------- */

function renderQuizQuestion() {
  const i = state.currentQuestionIndex;
  const question = QUESTIONS[i];

  document.getElementById("quiz-step-label").textContent = `Question ${i + 1} of ${QUESTIONS.length}`;
  const pct = Math.round((i / QUESTIONS.length) * 100);
  document.getElementById("quiz-progress-fill").style.width = pct + "%";
  document.getElementById("quiz-progressbar").setAttribute("aria-valuenow", String(pct));

  document.getElementById("quiz-question-text").textContent = question.text;

  const optionsWrap = document.getElementById("quiz-options");
  optionsWrap.innerHTML = "";
  const selected = state.quizAnswers[i];

  question.options.forEach((opt, optIndex) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option";
    if (selected && optIndex === selected.optionIndex) btn.classList.add("is-selected");
    btn.textContent = opt.text;
    btn.addEventListener("click", () => {
      state.quizAnswers[i] = { optionIndex: optIndex, categories: opt.categories };
      saveState();
      renderQuizQuestion(); // re-render to show the selection & enable Next
    });
    optionsWrap.appendChild(btn);
  });

  document.getElementById("btn-quiz-next").disabled = !state.quizAnswers[i];
  document.getElementById("btn-quiz-next").textContent = i === QUESTIONS.length - 1 ? "See my results" : "Next";
  document.getElementById("btn-quiz-back").disabled = i === 0;
}

document.getElementById("btn-quiz-back").addEventListener("click", () => {
  if (state.currentQuestionIndex === 0) {
    goToScreen("info");
    return;
  }
  state.currentQuestionIndex -= 1;
  saveState();
  renderQuizQuestion();
});

document.getElementById("btn-quiz-next").addEventListener("click", () => {
  if (!state.quizAnswers[state.currentQuestionIndex]) return;

  if (state.currentQuestionIndex < QUESTIONS.length - 1) {
    state.currentQuestionIndex += 1;
    saveState();
    renderQuizQuestion();
  } else {
    scoreQuiz();
    saveState();
    goToScreen("results");
  }
});

// Simple scoring: every answered option adds one point to each category
// it lists. The result is a plain { categoryKey: points } object.
function scoreQuiz() {
  const scores = {};
  CATEGORIES.forEach((c) => (scores[c.key] = 0));

  Object.values(state.quizAnswers).forEach((answer) => {
    answer.categories.forEach((catKey) => {
      scores[catKey] = (scores[catKey] || 0) + 1;
    });
  });

  state.categoryScores = scores;
}

function topCategories(scores, count) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => key);
}

/* ---------- Topics: the three things a student is curious about ---------- */

// Tappable ideas for students who are not sure what to type.
const SUGGESTED_TOPICS = [
  "Cats", "Dogs", "Ancient history", "Architecture", "Space", "Ocean life",
  "Music", "Video games", "Art", "Cooking", "Sports", "Robots",
  "Movies", "Mythology", "Cars", "Fashion", "Weather", "Dinosaurs",
];

function fillTopicsForm() {
  for (let i = 0; i < 3; i++) {
    document.getElementById("topic-" + i).value = (state.topics && state.topics[i]) || "";
  }
  document.getElementById("topics-error").hidden = true;

  const chips = document.getElementById("topic-chips");
  chips.innerHTML = "";
  SUGGESTED_TOPICS.forEach((name) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag tag--button";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      // Put the suggestion into the first empty box.
      for (let i = 0; i < 3; i++) {
        const input = document.getElementById("topic-" + i);
        if (!input.value.trim()) {
          input.value = name;
          input.focus();
          return;
        }
      }
    });
    chips.appendChild(btn);
  });
}

document.getElementById("form-topics").addEventListener("submit", (e) => {
  e.preventDefault();
  const error = document.getElementById("topics-error");
  const values = [0, 1, 2].map((i) => document.getElementById("topic-" + i).value.trim());

  if (values.some((v) => !v)) {
    error.textContent = "Please fill in all three topics. Anything you are curious about counts.";
    error.hidden = false;
    return;
  }
  if (new Set(values.map((v) => v.toLowerCase())).size < 3) {
    error.textContent = "Try three different topics so PATH can find where they overlap.";
    error.hidden = false;
    return;
  }
  error.hidden = true;

  state.topics = values;
  saveState();
  // A returning student who already finished the survey goes straight back to their themes.
  if (state.categoryScores && state.studentInfo.level) goToScreen("results");
  else goToScreen("info");
});

/* ---------- Turning typed topics into interests ---------- */

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// One pattern per word in the INTERESTS list. A plural ("cats") also matches.
const INTEREST_MATCHERS = INTERESTS.map((interest) => ({
  id: interest.id,
  patterns: interest.words.map((word) => new RegExp("\\b" + escapeRegExp(word) + "(s|es)?\\b", "i")),
}));

// "Egyptian history" -> direct: ["history", "egypt"]
// Interests that come along for free (egypt implies history) are "implied"
// and count for half as much as ones the student actually typed.
function parseTopic(text) {
  const raw = String(text || "").trim();
  const direct = [];
  INTEREST_MATCHERS.forEach(({ id, patterns }) => {
    if (patterns.some((re) => re.test(raw))) direct.push(id);
  });

  const implied = [];
  direct.forEach((id) => {
    const interest = INTERESTS.find((i) => i.id === id);
    (interest.implies || []).forEach((other) => {
      if (!direct.includes(other) && !implied.includes(other)) implied.push(other);
    });
  });

  return { raw, key: raw.toLowerCase(), label: raw.charAt(0).toUpperCase() + raw.slice(1), direct, implied };
}

function getSlots() {
  return (state.topics || []).map(parseTopic).filter((slot) => slot.raw);
}

// How well one theme covers one of the student's topics:
//   1 = the theme is directly about it, 0.5 = related, 0 = not covered
function slotCoverage(theme, slot) {
  if (theme.generated) return theme.slotKeys.includes(slot.key) ? 1 : 0;
  if (theme.tags.some((tag) => slot.direct.includes(tag))) return 1;
  if (theme.tags.some((tag) => slot.implied.includes(tag))) return 0.5;
  return 0;
}

/* ---------- Custom themes: when no ready-made theme covers a topic ---------- */

// Templates for themes built from the student's own words. {A}, {B}, {C} are
// replaced with the topics. Format: [stage, lens, text]
const GEN_TEMPLATES = {
  1: [
    ["W", "writing", "Write down what you already know about {A} and five things you wonder about it"],
    ["D", "writing", "Find out where {A} came from and who first cared about it"],
    ["D", "science", "Explore the science, math, or how-it-works behind {A}"],
    ["D", "people", "Find a person, club, or place near you connected to {A} and learn from them"],
    ["M", "art", "Make something inspired by {A}: a drawing, model, story, or video"],
    ["S", "people", "Teach someone one surprising thing you learned about {A}"],
  ],
  2: [
    ["W", "writing", "Brainstorm ten places where {A} and {B} show up together"],
    ["D", "writing", "Research the history of {A}, then look for how {B} shaped it"],
    ["D", "science", "Look for the science, math, or design behind how {A} and {B} connect"],
    ["D", "independent", "Find three real examples (places, people, or events) where {A} and {B} meet"],
    ["M", "art", "Create something that blends {A} and {B}: a model, story, design, or presentation"],
    ["S", "people", "Present what you found about {A} and {B} to a friend, family member, or class"],
  ],
  3: [
    ["W", "writing", "Map every connection you can think of between {A}, {B}, and {C}"],
    ["D", "writing", "Research a time or place in history where {A}, {B}, and {C} all mattered"],
    ["D", "independent", "Study how {A} and {B} connect, then bring {C} into the picture"],
    ["D", "science", "Look for the science, math, or design that links your three topics"],
    ["M", "art", "Create something that combines {A}, {B}, and {C}"],
    ["S", "people", "Share what you discovered in a short talk, poster, or video"],
  ],
};

function fillTemplate(text, names) {
  return text.replace("{A}", names[0]).replace("{B}", names[1] || "").replace("{C}", names[2] || "");
}

function makeGeneratedTheme(list) {
  const names = list.map((slot) => slot.raw);
  const id = "custom-" + list.map((slot) => slot.key.replace(/[^a-z0-9]+/g, "-")).join("-and-");
  let title;
  let summary;
  if (list.length === 1) {
    title = `Exploring ${names[0]}`;
    summary = `A study theme built around your interest in ${names[0]}. Follow the threads below in any order to learn how it works, where it came from, and how you can make something of your own.`;
  } else if (list.length === 2) {
    title = `Where ${names[0]} meets ${names[1]}`;
    summary = `A study theme built to explore where ${names[0]} and ${names[1]} overlap. Follow the threads below in any order to find connections nobody handed you.`;
  } else {
    title = `${list[0].label}, ${names[1]}, and ${names[2]}`;
    summary = `A study theme that brings together all three of your topics. Follow the threads below in any order to discover where ${names[0]}, ${names[1]}, and ${names[2]} meet.`;
  }
  return {
    id,
    title,
    tags: [],
    lenses: [],
    summary,
    links: {},
    subjects: { english: 2, history: 1, art: 1 },
    threads: GEN_TEMPLATES[list.length].map(([stage, lens, text]) => [stage, lens, fillTemplate(text, names)]),
    generated: true,
    slotKeys: list.map((slot) => slot.key),
  };
}

// Builds custom themes only for topics (or combinations of topics) that no
// ready-made theme covers, so every student always gets something to study.
function generateThemes(slots) {
  const covers = (theme, slot) => slotCoverage(theme, slot) >= 1;
  const themes = [];

  slots.forEach((slot) => {
    if (!THEMES.some((t) => covers(t, slot))) themes.push(makeGeneratedTheme([slot]));
  });
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (!THEMES.some((t) => covers(t, slots[i]) && covers(t, slots[j]))) {
        themes.push(makeGeneratedTheme([slots[i], slots[j]]));
      }
    }
  }
  if (slots.length === 3 && !THEMES.some((t) => slots.every((slot) => covers(t, slot)))) {
    themes.push(makeGeneratedTheme(slots));
  }
  return themes;
}

function getAllThemes() {
  return [...THEMES, ...generateThemes(getSlots())];
}

function findTheme(id) {
  return getAllThemes().find((t) => t.id === id) || null;
}

function getSelectedTheme() {
  return state.selectedThemeId ? findTheme(state.selectedThemeId) : null;
}

/* ---------- Screen 4: study themes ---------- */

// Ranking, in plain terms. Each theme earns points for:
//   * covering the student's topics (the biggest factor: 20 points per topic)
//   * being a hand-written theme (a small bonus over custom ones)
//   * fitting how the student said they like to learn (0-10, from the survey)
//   * the student's course ratings (a nudge up or down, see courseAdjustment)
function rankThemes() {
  const slots = getSlots();
  const scores = state.categoryScores || {};

  const ranked = getAllThemes().map((theme) => {
    const perSlot = slots.map((slot) => slotCoverage(theme, slot));
    const coverage = perSlot.reduce((sum, v) => sum + v, 0);
    const lensScore = lensFit(theme, scores);
    const adjustment = courseAdjustment(theme);
    const score = coverage * 20 + (theme.generated ? 0 : 6) + lensScore + adjustment.total;
    return { theme, perSlot, coverage, lensScore, adjustment, score };
  });

  ranked.sort((a, b) => b.score - a.score || a.theme.title.localeCompare(b.theme.title));
  return ranked;
}

// 0-10: how well a theme's learning styles match the student's survey results.
function lensFit(theme, scores) {
  if (!theme.lenses.length) return 5; // custom themes are neutral
  const total = theme.lenses.reduce((sum, key) => sum + (scores[key] || 0), 0);
  return Math.min(10, (total / (theme.lenses.length * 4)) * 10);
}

// How far one rating can move a theme, per level of subject importance, and the overall limit.
const POINTS_PER_WEIGHT = 3;
const MAX_COURSE_ADJUSTMENT = 15;

// Turns the student's course ratings into points for one theme.
//   rating 0 = really didn't like it -> -1,  rating 5 = loved it -> +1
//   points  = that feeling x subject importance (1-3) x POINTS_PER_WEIGHT
// Only courses marked "Taken" and rated are counted. Ratings never remove a
// theme; they only shuffle the order.
function courseAdjustment(theme) {
  const weights = theme.subjects || {};
  let total = 0;
  const reasons = [];

  Object.entries(weights).forEach(([courseId, weight]) => {
    const rec = peekCourse(courseId);
    if (rec.status !== "Taken" || rec.rating === null) return;
    const feeling = (rec.rating - 2.5) / 2.5;
    const points = feeling * weight * POINTS_PER_WEIGHT;
    total += points;
    reasons.push({ courseId, rating: rec.rating, points });
  });

  total = Math.max(-MAX_COURSE_ADJUSTMENT, Math.min(MAX_COURSE_ADJUSTMENT, total));
  return { total: Math.round(total), reasons };
}

// A short plain-English explanation of why a theme moved, or null if it didn't.
function describeAdjustment(adjustment) {
  if (Math.abs(adjustment.total) < 1) return null;
  const sign = adjustment.total < 0 ? -1 : 1;
  const sameDirection = adjustment.reasons
    .filter((r) => Math.sign(r.points) === sign)
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  if (!sameDirection.length) return null;

  const top = sameDirection[0];
  const more = sameDirection.length - 1;
  const moreText = more > 0 ? ` (plus ${more} other course${more > 1 ? "s" : ""})` : "";
  return {
    className: sign < 0 ? "is-down" : "is-up",
    direction: sign < 0 ? "lower" : "higher",
    detail: `you rated ${courseName(top.courseId)} ${top.rating}/5${moreText}`,
  };
}

function shortSummary(text) {
  const end = text.indexOf(". ");
  return end === -1 ? text : text.slice(0, end + 1);
}

function renderResults() {
  const slots = getSlots();
  const top3 = topCategories(state.categoryScores || {}, 3).map(categoryLabel);
  document.getElementById("results-summary").textContent = slots.length
    ? `Your topics: ${slots.map((s) => s.label).join(", ")}.${top3.length ? ` You like learning through: ${top3.join(", ")}.` : ""}`
    : "Add your topics to see study themes.";

  let ranked = rankThemes().filter((r) => r.coverage > 0);
  if (!ranked.length) ranked = rankThemes();
  ranked = ranked.slice(0, 6);

  const grid = document.getElementById("career-grid");
  grid.innerHTML = "";

  ranked.forEach(({ theme, perSlot, lensScore, adjustment }) => {
    const covered = perSlot.filter((v) => v >= 1).length;
    const matchLabel = covered
      ? `Overlaps ${covered} of your ${slots.length} topics`
      : "Related to your topics";
    const adjust = describeAdjustment(adjustment);

    const topicChips = slots
      .map((slot, i) => {
        if (perSlot[i] >= 1) return `<span class="tag tag--match">${escapeHTML(slot.label)}</span>`;
        if (perSlot[i] > 0) return `<span class="tag tag--soft">${escapeHTML(slot.label)} (related)</span>`;
        return "";
      })
      .join("");
    const fitChip = !theme.generated && lensScore >= 6.5 ? `<span class="tag tag--style">Fits how you like to learn</span>` : "";
    const customChip = theme.generated ? `<span class="tag tag--soft">Built from your topics</span>` : "";

    const card = document.createElement("div");
    card.className = "career-card";
    card.innerHTML = `
      <span class="career-card__match">${matchLabel}</span>
      <h3 class="career-card__name">${escapeHTML(theme.title)}</h3>
      <p class="career-card__desc">${escapeHTML(shortSummary(theme.summary))}</p>
      <div class="career-card__tags">${topicChips}${fitChip}${customChip}</div>
      ${adjust ? `<p class="career-card__adjust ${adjust.className}">Ranked ${adjust.direction} because ${escapeHTML(adjust.detail)}.</p>` : ""}
      <button type="button" class="btn btn--pill-outline" data-theme="${theme.id}">Explore theme</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      state.selectedThemeId = theme.id;
      saveState();
      goToScreen("detail");
    });
    grid.appendChild(card);
  });
}

document.querySelectorAll('[data-go="quiz-restart"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    state.quizAnswers = {};
    state.currentQuestionIndex = 0;
    state.categoryScores = null;
    saveState();
    goToScreen("quiz");
  });
});

/* ---------- Screen 5: one study theme, its path, and self-paced threads ---------- */

// Every theme lists its threads as [stage, lens, title]. This gives each one an
// id so its status (Not Started / In Progress / Completed) can be saved.
function buildThreads(theme) {
  return theme.threads.map(([stage, lens, title], i) => ({ id: `${theme.id}-${i}`, stage, lens, title }));
}

function stageTitle(key) {
  const stage = THREAD_STAGES.find((st) => st.key === key);
  return stage ? stage.title : key;
}

// For a topic, find the sentence that explains how this theme connects to it.
function connectionSentence(theme, slot) {
  if (theme.generated) return "This theme is built around it.";
  const ids = [...slot.direct, ...slot.implied];
  const key = ids.find((id) => theme.tags.includes(id) && theme.links && theme.links[id]);
  return key ? theme.links[key] : "This theme touches on it.";
}

function renderDetail() {
  const container = document.getElementById("detail-content");
  const theme = getSelectedTheme();
  if (!theme) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No study theme selected</h2>
        <p>Pick a theme from your results to start building your own path.</p>
        <button type="button" class="btn btn--primary" data-go="results">See study themes</button>
      </div>`;
    container.querySelector("[data-go]").addEventListener("click", () => goToScreen("results"));
    return;
  }

  const threads = buildThreads(theme);
  const statusMap = getStepStatusMap(theme.id);
  const slots = getSlots();
  const adjust = describeAdjustment(courseAdjustment(theme));

  const overlapItems = slots
    .filter((slot) => slotCoverage(theme, slot) > 0)
    .map((slot) => `<li><strong>${escapeHTML(slot.label)}:</strong> ${escapeHTML(connectionSentence(theme, slot))}</li>`)
    .join("");
  const adjustHTML = adjust
    ? `<p class="fit-block__note">Your course ratings moved this theme ${adjust.direction} in your list: ${escapeHTML(adjust.detail)}.</p>`
    : "";

  container.innerHTML = `
    <div class="detail-head">
      <div>
        <h2>${escapeHTML(theme.title)}</h2>
        <p class="detail-desc">${escapeHTML(theme.summary)}</p>
      </div>
    </div>

    <div class="fit-block">
      <h3>How this overlaps your interests</h3>
      <ul class="overlap-list">${overlapItems || "<li>This theme is related to your topics.</li>"}</ul>
      ${adjustHTML}
    </div>

    <div class="roadmap">
      <h3>Your learning path</h3>
      <p class="roadmap__hint">A suggested shape for exploring this theme. It is not a checklist you must follow in order. Start wherever you are curious.</p>
      <div class="roadmap-stages">${renderPathHTML(theme, threads)}</div>
    </div>

    <div class="next-steps">
      <h3>What would you like to explore next?</h3>
      <p class="next-steps__hint">Pick anything, in any order. Tap the status button to move a thread from Not Started to In Progress to Completed. Threads marked "Fits how you like to learn" come from your survey answers, but the choice is yours.</p>
      <div class="step-list" id="step-list"></div>
    </div>

    <div class="detail-courses">
      <h3>School subjects connected to this theme</h3>
      <p class="detail-courses__hint">Mark courses as you take them, then rate how much you liked them (0 = really didn't like it, 5 = loved it). Ratings gently move study themes up or down in your list, and they never remove a theme. The importance tags are estimates.</p>
      <div class="course-list" id="detail-course-list"></div>
    </div>

    <div class="opportunities">
      <h3>Opportunities near you</h3>
      ${renderOpportunitiesHTML()}
    </div>

    <div class="detail-actions">
      <button type="button" class="btn btn--primary" data-go="dashboard">View my progress dashboard</button>
      <button type="button" class="btn btn--pill-outline" data-go="courses">Courses &amp; skills web</button>
      <button type="button" class="btn btn--ghost" data-go="results">Choose a different theme</button>
    </div>
  `;

  container.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => goToScreen(btn.dataset.go));
  });

  renderThreadList(theme, threads, statusMap);
  fillCourseList(document.getElementById("detail-course-list"), topCourseEntries(theme, 8), () => renderDetail());
}

// The visual path: "you are here", the four stages, and where it leads.
function renderPathHTML(theme, threads) {
  const row = (dotClass, title, itemsHTML) => `
    <div class="roadmap-stage">
      <div class="roadmap-stage__rail">
        <div class="roadmap-stage__dot ${dotClass}"></div>
        <div class="roadmap-stage__line"></div>
      </div>
      <div class="roadmap-stage__body">
        <div class="roadmap-stage__title">${title}</div>
        <div class="roadmap-stage__items">${itemsHTML}</div>
      </div>
    </div>`;

  const here = row("is-here", "You are here", `<span class="tag">Curious about this theme</span>`);
  const stages = THREAD_STAGES.map((stage) => {
    const items = threads
      .filter((t) => t.stage === stage.key)
      .map((t) => `<span class="tag">${escapeHTML(t.title)}</span>`)
      .join("");
    return row("", `${stage.title} <span class="roadmap-stage__blurb">${stage.blurb}</span>`, items);
  }).join("");
  const goal = row("is-goal", "Where this leads", `<span class="tag">You understand it well enough to teach it</span>`);

  return here + stages + goal;
}

function renderOpportunitiesHTML() {
  const { list } = getOpportunities(state.studentInfo);
  const locationLabel = state.studentInfo.city
    ? `${state.studentInfo.city}${state.studentInfo.state ? ", " + state.studentInfo.state : ""}`
    : "your area";

  return `
    <p class="opportunities__location">Places to keep learning, based on the location you entered: ${escapeHTML(locationLabel)}. Check each organization's website for current programs, dates, and openings.</p>
    <div class="opp-grid">
      ${list
        .map(
          (opp) => `
        <div class="opp-card">
          <div class="opp-card__label">${escapeHTML(opp.label)}</div>
          <div class="opp-card__name">${escapeHTML(opp.name)}</div>
          <p class="opp-card__desc">${escapeHTML(opp.desc)}</p>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function renderThreadList(theme, threads, statusMap) {
  const list = document.getElementById("step-list");
  list.innerHTML = "";

  const cycle = { "Not Started": "In Progress", "In Progress": "Completed", "Completed": "Not Started" };
  const scores = state.categoryScores || {};
  const favorites = new Set(topCategories(scores, 3));

  threads.forEach((thread) => {
    const status = statusMap[thread.id] || "Not Started";
    const fits = (scores[thread.lens] || 0) > 0 && favorites.has(thread.lens);

    const row = document.createElement("div");
    row.className = "step-item";
    if (status === "Completed") row.classList.add("is-completed");
    if (status === "In Progress") row.classList.add("is-inprogress");

    row.innerHTML = `
      <div class="step-item__info">
        <div class="step-item__title">${escapeHTML(thread.title)}</div>
        <div class="step-item__category">${escapeHTML(stageTitle(thread.stage))}${fits ? ` <span class="tag tag--style">Fits how you like to learn</span>` : ""}</div>
      </div>
      <button type="button" class="step-status" data-status="${status}">${status}</button>
    `;

    row.querySelector(".step-status").addEventListener("click", () => {
      statusMap[thread.id] = cycle[status];
      saveState();
      renderThreadList(theme, threads, statusMap);
    });

    list.appendChild(row);
  });
}

/* ---------- Screen 6: dashboard ---------- */

function computeProgress(theme) {
  const threads = buildThreads(theme);
  const statusMap = getStepStatusMap(theme.id);
  const scores = state.categoryScores || {};

  const completed = threads.filter((t) => statusMap[t.id] === "Completed");
  const inProgress = threads.filter((t) => statusMap[t.id] === "In Progress");
  // Threads that fit the student's learning style are suggested first (they can still pick any).
  const notStarted = threads
    .filter((t) => !statusMap[t.id] || statusMap[t.id] === "Not Started")
    .sort((a, b) => (scores[b.lens] || 0) - (scores[a.lens] || 0));
  const percent = threads.length ? Math.round((completed.length / threads.length) * 100) : 0;

  const current = inProgress[0] || notStarted[0] || null;
  const recommended = [...inProgress.slice(1), ...notStarted].filter((t) => t !== current).slice(0, 3);

  return { threads, completed, inProgress, notStarted, percent, current, recommended };
}

function renderDashboard() {
  const container = document.getElementById("dashboard-content");
  const theme = getSelectedTheme();

  if (!theme) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No study theme selected yet</h2>
        <p>Choose a theme from your results to start a path and track your progress.</p>
        <button type="button" class="btn btn--primary" data-go="results">See study themes</button>
      </div>
    `;
    container.querySelector("[data-go]").addEventListener("click", () => goToScreen("results"));
    return;
  }

  const progress = computeProgress(theme);
  const takenCount = COURSES.filter((c) => peekCourse(c.id).status === "Taken").length;
  const topics = getSlots();
  const styles = topCategories(state.categoryScores || {}, 3).map(categoryLabel);

  container.innerHTML = `
    <div class="dash-head">
      <div>
        <p class="panel__sub" style="margin-bottom:4px;">Your path</p>
        <h2 style="margin:0;">${escapeHTML(theme.title)}</h2>
      </div>
      <button type="button" class="btn btn--ghost" data-go="results">Choose a different theme</button>
    </div>

    <div class="dash-stats">
      <div class="dash-stat">
        <div class="dash-stat__label">Overall progress</div>
        <div class="dash-stat__value">${progress.percent}%</div>
      </div>
      <div class="dash-stat">
        <div class="dash-stat__label">Threads completed</div>
        <div class="dash-stat__value">${progress.completed.length} / ${progress.threads.length}</div>
      </div>
      <div class="dash-stat">
        <div class="dash-stat__label">Working on now</div>
        <div class="dash-stat__value" style="font-size:1.05rem;">${progress.current ? escapeHTML(progress.current.title) : "All caught up"}</div>
      </div>
      <div class="dash-stat">
        <div class="dash-stat__label">Courses taken</div>
        <div class="dash-stat__value">${takenCount} / ${COURSES.length}</div>
      </div>
    </div>

    <div class="progress-bar" style="margin-bottom:34px;">
      <div class="progress-bar__fill" style="width:${progress.percent}%"></div>
    </div>

    <div class="dash-section">
      <h3>Your topics</h3>
      <div class="chip-row">${topics.map((t) => `<span class="tag">${escapeHTML(t.label)}</span>`).join("")}</div>
    </div>

    <div class="dash-section">
      <h3>How you like to learn</h3>
      <div class="chip-row">${styles.map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join("") || `<span class="tag">Take the survey to see this</span>`}</div>
    </div>

    <div class="dash-section">
      <h3>Suggested next threads</h3>
      <div class="chip-row">
        ${
          progress.recommended.length
            ? progress.recommended.map((t) => `<span class="tag">${escapeHTML(t.title)}</span>`).join("")
            : `<span class="tag">You have started everything on the list. Nice work.</span>`
        }
      </div>
    </div>

    <div class="detail-actions">
      <button type="button" class="btn btn--primary" data-go="detail">Open my learning path</button>
      <button type="button" class="btn btn--pill-outline" data-go="courses">Courses &amp; skills web</button>
      <button type="button" class="btn btn--ghost" data-go="topics">Change my topics</button>
    </div>
  `;

  container.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => goToScreen(btn.dataset.go));
  });
}


/* ---------- Screen 7: courses, ratings, and the skills web ---------- */

// --- Small reusable pieces: rating buttons and course rows -----------------

// Builds the row of 0-5 buttons for rating a course. Clicking the selected
// number again clears the rating. onChange() runs after every save so the
// page can redraw itself.
function buildRatingControl(courseId, onChange) {
  const rec = peekCourse(courseId);
  const wrap = document.createElement("div");
  wrap.className = "rating";
  wrap.innerHTML = `
    <span class="rating__label">How did you like ${escapeHTML(courseName(courseId))}?</span>
    <div class="rating__buttons" role="group" aria-label="Rate ${escapeHTML(courseName(courseId))} from 0 to 5"></div>
    <span class="rating__caption"></span>
  `;

  const buttons = wrap.querySelector(".rating__buttons");
  for (let r = 0; r <= 5; r++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rating__btn";
    if (rec.rating === r) btn.classList.add("is-selected");
    if (r <= 1) btn.setAttribute("data-low", "");
    btn.textContent = String(r);
    btn.title = RATING_LABELS[r];
    btn.addEventListener("click", () => {
      const record = getCourseRecord(courseId);
      record.rating = record.rating === r ? null : r;
      saveState();
      onChange();
    });
    buttons.appendChild(btn);
  }

  wrap.querySelector(".rating__caption").textContent =
    rec.rating === null ? "0 = really didn't like it, 5 = loved it" : `${rec.rating}/5 - ${RATING_LABELS[rec.rating]}`;
  return wrap;
}

// Builds one course row: name, importance tag, a status button, and (once the
// course is marked Taken) the rating buttons underneath.
function buildCourseRow(course, weight, onChange) {
  const rec = peekCourse(course.id);
  const row = document.createElement("div");
  row.className = "course-row";
  if (rec.status === "Taken") row.classList.add("is-taken");
  if (rec.status === "In Progress") row.classList.add("is-inprogress");

  row.innerHTML = `
    <div class="course-row__main">
      <div class="course-row__name">${escapeHTML(course.name)}</div>
      <div class="course-row__meta">${weight ? `<span class="tag">${IMPORTANCE_LABELS[weight]}</span>` : ""}</div>
    </div>
    <button type="button" class="step-status" data-status="${rec.status}">${COURSE_STATUS_LABELS[rec.status]}</button>
  `;

  row.querySelector(".step-status").addEventListener("click", () => {
    const record = getCourseRecord(course.id);
    record.status = COURSE_STATUS_CYCLE[record.status];
    saveState();
    onChange();
  });

  if (rec.status === "Taken") row.appendChild(buildRatingControl(course.id, onChange));
  return row;
}

function fillCourseList(listEl, entries, onChange) {
  listEl.innerHTML = "";
  entries.forEach(({ course, weight }) => listEl.appendChild(buildCourseRow(course, weight, onChange)));
}

// The most important courses for one study theme, most important first.
function topCourseEntries(theme, limit) {
  const weights = theme.subjects || {};
  return COURSES.filter((c) => weights[c.id])
    .map((course) => ({ course, weight: weights[course.id] }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

// --- The skills web --------------------------------------------------------

const WEB_W = 900;
const WEB_H = 720;

let webSelected = null;     // id of the bubble the student clicked, or null
let webLayoutCache = null;  // bubble positions are calculated once and reused

// Bubble color shows how the student felt about the subject.
function courseColor(rec, usage) {
  if (rec.status === "Taken" && rec.rating !== null) {
    if (rec.rating >= 4) return "var(--accent)";
    if (rec.rating === 3) return "#8DBFA9";
    if (rec.rating === 2) return "var(--accent-2)";
    return "var(--danger)";
  }
  return usage > 0 ? "#B8BEAE" : "var(--paper-dim)";
}

// Bubble size grows with how much the student has used the subject.
function courseRadius(usage) {
  return 12 + 9 * Math.sqrt(Math.min(usage, 9));
}

function neighborIds(courseId) {
  const ids = [];
  COURSE_LINKS.forEach(([a, b]) => {
    if (a === courseId) ids.push(b);
    else if (b === courseId) ids.push(a);
  });
  return ids;
}

// Splits a long subject name over two lines so labels do not collide.
function wrapLabel(name) {
  if (name.length <= 13 || name.indexOf(" ") === -1) return [name];
  const words = name.split(" ");
  let best = 1;
  let bestGap = Infinity;
  for (let i = 1; i < words.length; i++) {
    const gap = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (gap < bestGap) { bestGap = gap; best = i; }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

// Works out where each bubble sits. This is a small "force layout": every
// bubble pushes the others away, while linked subjects pull toward each other,
// so related subjects end up near each other. Positions are calculated once
// (not from usage), so bubbles stay put while they grow as you make progress.
function getWebLayout() {
  if (webLayoutCache) return webLayoutCache;

  const groups = [...new Set(COURSES.map((c) => c.group))];
  const nodes = COURSES.map((course, i) => {
    // Start each group of subjects in its own direction around the middle.
    const angle = (groups.indexOf(course.group) / groups.length) * Math.PI * 2;
    const wobble = i * 2.4; // fixed pseudo-random spread (no Math.random, so it is always the same)
    return {
      id: course.id,
      x: WEB_W / 2 + Math.cos(angle) * 260 + Math.cos(wobble) * 40,
      y: WEB_H / 2 + Math.sin(angle) * 190 + Math.sin(wobble) * 40,
      dx: 0,
      dy: 0,
    };
  });
  const byId = {};
  nodes.forEach((n) => (byId[n.id] = n));
  const links = COURSE_LINKS.map(([a, b]) => [byId[a], byId[b]]);

  const k = 105;            // ideal distance between linked bubbles
  let temperature = 90;     // how far a bubble may move per step; cools over time
  for (let step = 0; step < 400; step++) {
    nodes.forEach((n) => { n.dx = 0; n.dy = 0; });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const force = (k * k) / dist;
        a.dx += (dx / dist) * force; a.dy += (dy / dist) * force;
        b.dx -= (dx / dist) * force; b.dy -= (dy / dist) * force;
      }
    }

    links.forEach(([a, b]) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = (dist * dist) / k;
      a.dx -= (dx / dist) * force; a.dy -= (dy / dist) * force;
      b.dx += (dx / dist) * force; b.dy += (dy / dist) * force;
    });

    nodes.forEach((n) => {
      n.dx -= (n.x - WEB_W / 2) * 0.05;   // gentle pull toward the middle
      n.dy -= (n.y - WEB_H / 2) * 0.05;
      const move = Math.sqrt(n.dx * n.dx + n.dy * n.dy) || 0.01;
      n.x += (n.dx / move) * Math.min(move, temperature);
      n.y += (n.dy / move) * Math.min(move, temperature);
    });
    temperature *= 0.985;
  }

  // Stretch the result to fill the drawing area, leaving room for labels.
  const margin = { left: 70, right: 70, top: 55, bottom: 90 };
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  nodes.forEach((n) => {
    n.x = margin.left + ((n.x - minX) / (maxX - minX || 1)) * (WEB_W - margin.left - margin.right);
    n.y = margin.top + ((n.y - minY) / (maxY - minY || 1)) * (WEB_H - margin.top - margin.bottom);
  });

  // Last, nudge apart any bubbles that still sit too close together.
  const minGap = 96;
  for (let pass = 0; pass < 80; pass++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist < minGap) {
          const push = (minGap - dist) / 2;
          a.x -= (dx / dist) * push; a.y -= (dy / dist) * push;
          b.x += (dx / dist) * push; b.y += (dy / dist) * push;
        }
      }
    }
    nodes.forEach((n) => {
      n.x = Math.max(margin.left, Math.min(WEB_W - margin.right, n.x));
      n.y = Math.max(margin.top, Math.min(WEB_H - margin.bottom, n.y));
    });
  }

  const pos = {};
  nodes.forEach((n) => (pos[n.id] = { x: Math.round(n.x), y: Math.round(n.y) }));
  webLayoutCache = { pos, links: COURSE_LINKS };
  return webLayoutCache;
}

function courseStatusText(rec) {
  if (rec.status === "Taken") return rec.rating === null ? "taken, not rated yet" : `taken, rated ${rec.rating} out of 5`;
  if (rec.status === "In Progress") return "in progress";
  return "not taken yet";
}

// Draws the web as SVG. Bigger bubble = more use. Color = how much you liked it.
// Dashed ring = matters for your selected career. Click a bubble to focus on it.
function renderWebGraph() {
  const holder = document.getElementById("web-graph");
  const layout = getWebLayout();
  const usage = getCourseUsage();
  const theme = getSelectedTheme();
  const careerWeights = theme ? theme.subjects || {} : {};
  const focus = webSelected ? new Set([webSelected, ...neighborIds(webSelected)]) : null;

  const edgesSVG = layout.links
    .map(([aId, bId]) => {
      const a = layout.pos[aId];
      const b = layout.pos[bId];
      const bothUsed = usage[aId] > 0 && usage[bId] > 0;
      const touches = webSelected && (aId === webSelected || bId === webSelected);
      const dim = webSelected && !touches;
      const cls = `web-edge${bothUsed ? " is-used" : ""}${touches ? " is-active" : ""}${dim ? " is-dim" : ""}`;
      return `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
    })
    .join("");

  const nodesSVG = COURSES.map((course) => {
    const p = layout.pos[course.id];
    const rec = peekCourse(course.id);
    const u = usage[course.id];
    const r = Math.round(courseRadius(u));
    const rated = rec.status === "Taken" && rec.rating !== null;
    const dim = focus && !focus.has(course.id);
    const classes = `web-node${webSelected === course.id ? " is-selected" : ""}${dim ? " is-dim" : ""}`;
    const label = `${course.name}: ${courseStatusText(rec)}`;
    const digitColor = rated && (rec.rating >= 4 || rec.rating <= 1) ? "#fff" : "var(--ink)";
    const lines = wrapLabel(course.name);
    const labelY = p.y + r + 15;

    return `
      <g class="${classes}" data-course="${course.id}" tabindex="0" role="button" aria-label="${escapeHTML(label)}">
        <title>${escapeHTML(label)}</title>
        ${careerWeights[course.id] ? `<circle class="web-ring" cx="${p.x}" cy="${p.y}" r="${r + 6}"/>` : ""}
        <circle class="web-bubble" cx="${p.x}" cy="${p.y}" r="${r}" style="fill:${courseColor(rec, u)}"/>
        ${rated ? `<text class="web-rating" x="${p.x}" y="${p.y + 5}" style="fill:${digitColor}">${rec.rating}</text>` : ""}
        <text class="web-label" x="${p.x}" y="${labelY}">${lines
          .map((line, i) => `<tspan x="${p.x}" dy="${i === 0 ? 0 : 13}">${escapeHTML(line)}</tspan>`)
          .join("")}</text>
      </g>`;
  }).join("");

  holder.innerHTML = `
    <svg class="web-svg" viewBox="0 0 ${WEB_W} ${WEB_H}" role="group" aria-label="Skills web of school subjects">
      <g>${edgesSVG}</g>
      <g>${nodesSVG}</g>
    </svg>
  `;

  holder.querySelectorAll(".web-node").forEach((node) => {
    const pick = () => {
      const id = node.getAttribute("data-course");
      webSelected = webSelected === id ? null : id;
      renderWebGraph();
      renderWebDetail();
    };
    node.addEventListener("click", pick);
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick();
      }
    });
  });
}

// The info box under the web: shows details for the bubble that was clicked.
function renderWebDetail() {
  const panel = document.getElementById("web-detail");
  if (!webSelected) {
    panel.innerHTML = `<p class="web-detail__empty">Select a bubble to see how that subject connects to others and which study themes it shapes.</p>`;
    return;
  }

  const course = COURSES.find((c) => c.id === webSelected);
  const rec = peekCourse(course.id);
  const related = neighborIds(course.id).map((id) => COURSES.find((c) => c.id === id));
  const careersAffected = THEMES.filter((t) => (t.subjects[course.id] || 0) >= 2);
  const feeling = rec.status === "Taken" && rec.rating !== null ? ` (${RATING_LABELS[rec.rating]})` : "";

  panel.innerHTML = `
    <h3>${escapeHTML(course.name)}</h3>
    <p>Status: ${escapeHTML(courseStatusText(rec))}${escapeHTML(feeling)}.</p>
    <div class="web-detail__row">
      <strong>Connected subjects</strong>
      <div class="chip-row">${related
        .map((r) => `<button type="button" class="tag tag--button" data-pick="${r.id}">${escapeHTML(r.name)}</button>`)
        .join("")}</div>
    </div>
    <div class="web-detail__row">
      <strong>Study themes this subject shapes</strong>
      <div class="chip-row">${
        careersAffected.length
          ? careersAffected.map((t) => `<span class="tag">${escapeHTML(t.title)}</span>`).join("")
          : `<span class="tag">No themes depend heavily on it</span>`
      }</div>
    </div>
  `;

  panel.querySelectorAll("[data-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      webSelected = btn.getAttribute("data-pick");
      renderWebGraph();
      renderWebDetail();
    });
  });
}

// The full course list, grouped by subject area, with status and rating controls.
function renderCourseTracker() {
  const holder = document.getElementById("course-tracker");
  holder.innerHTML = "";
  const theme = getSelectedTheme();
  const weights = theme ? theme.subjects || {} : {};

  [...new Set(COURSES.map((c) => c.group))].forEach((group) => {
    const section = document.createElement("div");
    section.className = "course-group";
    section.innerHTML = `<h4>${escapeHTML(group)}</h4><div class="course-list"></div>`;
    const entries = COURSES.filter((c) => c.group === group).map((course) => ({ course, weight: weights[course.id] || 0 }));
    fillCourseList(section.querySelector(".course-list"), entries, () => renderCourses());
    holder.appendChild(section);
  });
}

function renderCourses() {
  const container = document.getElementById("courses-content");
  const theme = getSelectedTheme();
  const career = theme ? { name: theme.title } : null; // used by the text below

  const legendItem = (color, text) =>
    `<span class="web-legend__item"><span class="web-legend__dot" style="background:${color}"></span>${text}</span>`;

  container.innerHTML = `
    <h2 class="panel__title">Your courses and skills web</h2>
    <p class="panel__sub">Each bubble is a school subject. The more you use a subject (courses taken or in progress, plus skills you have worked on), the bigger its bubble grows, and lines connect subjects that build on each other. Rate the courses you have taken and PATH will nudge study themes up or down in your list. It never hides a theme from you.</p>

    <div class="web-legend">
      ${legendItem("var(--accent)", "Liked or loved it (4-5)")}
      ${legendItem("#8DBFA9", "It was fine (3)")}
      ${legendItem("var(--accent-2)", "Not a fan (2)")}
      ${legendItem("var(--danger)", "Didn't like it (0-1)")}
      ${legendItem("#B8BEAE", "Used, not rated yet")}
      ${legendItem("var(--paper-dim)", "Not used yet")}
      ${career ? `<span class="web-legend__item"><span class="web-legend__dot web-legend__dot--ring"></span>Matters for ${escapeHTML(career.name)}</span>` : ""}
    </div>

    <div class="web-wrap"><div id="web-graph"></div></div>
    <div class="web-detail" id="web-detail"></div>

    <h3 class="tracker-title">Course tracker</h3>
    <p class="panel__sub">Tap a course's status to move it from Not taken to In progress to Taken. Once a course is taken, rate it from 0 (really didn't like it) to 5 (loved it).${
      career ? ` Tags show how much each subject matters for ${escapeHTML(career.name)}.` : ""
    }</p>
    <div id="course-tracker"></div>

    <div class="detail-actions">
      <button type="button" class="btn btn--primary" data-go="results">See my study themes</button>
      ${career ? `<button type="button" class="btn btn--ghost" data-go="dashboard">Back to my dashboard</button>` : ""}
    </div>
  `;

  container.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => goToScreen(btn.dataset.go));
  });

  renderWebGraph();
  renderWebDetail();
  renderCourseTracker();
}


/* ============================================================
   4. LOGIN / SIGN UP (Firebase Authentication)
   ============================================================ */

let authMode = "login"; // or "signup"

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === "signup";
  document.getElementById("login-title").textContent = isSignup ? "Create your PATH account" : "Log in to PATH";
  document.getElementById("btn-login-submit").textContent = isSignup ? "Sign up" : "Log in";
  document.getElementById("btn-toggle-auth-mode").textContent = isSignup
    ? "Already have an account? Log in"
    : "Need an account? Sign up";
  document.getElementById("login-error").hidden = true;
  document.getElementById("login-success").hidden = true;
  // "Forgot your password?" only makes sense when logging in, not signing up.
  document.getElementById("forgot-row").hidden = isSignup;
}

document.getElementById("btn-toggle-auth-mode").addEventListener("click", () => {
  setAuthMode(authMode === "login" ? "signup" : "login");
});

function showLoginError(message) {
  document.getElementById("login-success").hidden = true;
  const el = document.getElementById("login-error");
  el.textContent = message;
  el.hidden = false;
}

function showLoginSuccess(message) {
  document.getElementById("login-error").hidden = true;
  const el = document.getElementById("login-success");
  el.textContent = message;
  el.hidden = false;
}

// "Forgot your password?" -- Firebase emails the student a link to choose a
// new password. We use whatever is already typed in the email box.
document.getElementById("btn-forgot-password").addEventListener("click", () => {
  const email = document.getElementById("login-email").value.trim();

  if (!firebaseReady) {
    showLoginError("Password reset isn't available right now.");
    return;
  }
  if (!email) {
    showLoginError("Type your email address above first, then click \"Forgot your password?\" again.");
    return;
  }

  const btn = document.getElementById("btn-forgot-password");
  btn.disabled = true;
  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      // The message is intentionally the same whether or not an account exists.
      showLoginSuccess("If there's an account for " + email + ", a password reset link is on its way. Check your inbox and your spam folder.");
    })
    .catch((err) => showLoginError(friendlyAuthError(err)))
    .finally(() => { btn.disabled = false; });
});

document.getElementById("form-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  document.getElementById("login-error").hidden = true;
  document.getElementById("login-success").hidden = true;

  if (!firebaseReady) {
    showLoginError("Firebase isn't configured yet -- see firebase-config.js. Progress will save to this browser only until it is.");
    return;
  }

  const submitBtn = document.getElementById("btn-login-submit");
  submitBtn.disabled = true;

  const action =
    authMode === "signup"
      ? auth.createUserWithEmailAndPassword(email, password)
      : auth.signInWithEmailAndPassword(email, password);

  action
    .catch((err) => showLoginError(friendlyAuthError(err)))
    .finally(() => { submitBtn.disabled = false; });
  // On success, onAuthStateChanged (below) takes over -- it loads the
  // student's saved state and moves them past the login screen.
});

function friendlyAuthError(err) {
  const map = {
    "auth/email-already-in-use": "That email already has an account -- try logging in instead.",
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/wrong-password": "Incorrect password.",
    "auth/user-not-found": "No account found with that email -- try signing up instead.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/missing-email": "Type your email address first.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Couldn't reach the server. Check your internet connection and try again.",
  };
  return map[err.code] || err.message;
}

document.getElementById("btn-signout").addEventListener("click", () => {
  if (firebaseReady) auth.signOut();
});


/* ============================================================
   5. STARTUP
   ============================================================ */

document.getElementById("btn-start").addEventListener("click", () => goToScreen("topics"));

document.querySelectorAll("[data-go]").forEach((btn) => {
  // Only wire up static buttons here; buttons created dynamically inside
  // render functions get their own listeners where they're created.
  if (!btn.closest("#detail-content") && !btn.closest("#dashboard-content") && btn.dataset.go !== "quiz-restart") {
    btn.addEventListener("click", () => goToScreen(btn.dataset.go));
  }
});

// Resume where the student left off: if they've already answered at least
// one quiz question or picked a career, skip back to a sensible screen
// instead of always starting at the welcome page.
function resumeOrStart() {
  const hasTopics = (state.topics || []).some((t) => t && t.trim());
  if (state.selectedThemeId && hasTopics) {
    goToScreen("dashboard");
  } else if (state.categoryScores && hasTopics) {
    goToScreen("results");
  } else if (Object.keys(state.quizAnswers).length > 0) {
    goToScreen("quiz");
  } else if (hasTopics) {
    goToScreen("info");
  } else {
    goToScreen("welcome");
  }
}

let auth, db; // set up below once we know Firebase is configured

function initApp() {
  firebaseReady = isFirebaseConfigured();

  if (!firebaseReady) {
    // No real Firebase project connected yet -- fall back to saving in
    // this browser only, and skip straight past the login screen so the
    // app still works immediately out of the box.
    console.info("PATH: firebase-config.js still has placeholder values -- saving to this browser only. See firebase-config.js to add per-user accounts.");
    state = loadStateLocal();
    resumeOrStart();
    return;
  }

  auth = firebase.auth();
  db = firebase.firestore();

  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    const accountBar = document.getElementById("header-account");

    if (user) {
      accountBar.hidden = false;
      document.getElementById("header-account-email").textContent = user.email;
      state = await loadStateForUser(user.uid);
      resumeOrStart();
    } else {
      accountBar.hidden = true;
      state = defaultState();
      setAuthMode("login");
      goToScreen("login");
    }
  });
}

initApp();
