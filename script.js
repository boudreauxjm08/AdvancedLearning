/* ==========================================================================
   PATH — script.js
   This file is organized into sections:
     1. DATA          - the interest categories, quiz questions, and career database
     2. STATE         - the one object that holds everything about the current student,
                         plus load/save helpers that use localStorage
     3. NAVIGATION    - functions that show/hide the six "screens" of the app
     4. SCREEN LOGIC  - the code that fills in and reacts to each screen
     5. STARTUP       - wires up the buttons and shows the first screen

   Nothing here is real API access -- everything (careers, opportunities,
   matching) lives in plain JavaScript objects/arrays below so a beginner
   can open this file and change the data without touching the logic.
   ========================================================================== */


/* ============================================================
   1. DATA
   ============================================================ */

// The 12 interest categories used by the assessment. "key" is used
// internally (in scoring and in career.categories arrays); "label" is
// what students see.
const CATEGORIES = [
  { key: "math",        label: "Mathematics" },
  { key: "science",     label: "Science" },
  { key: "tech",        label: "Technology" },
  { key: "engineering", label: "Engineering / Building" },
  { key: "healthcare",  label: "Healthcare / Helping People" },
  { key: "business",    label: "Business" },
  { key: "art",         label: "Art / Design" },
  { key: "writing",     label: "Writing / Communication" },
  { key: "outdoors",    label: "Working Outdoors" },
  { key: "animals",     label: "Working with Animals" },
  { key: "people",      label: "Working with People" },
  { key: "independent", label: "Working Independently" },
];

function categoryLabel(key) {
  const found = CATEGORIES.find((c) => c.key === key);
  return found ? found.label : key;
}

// The 12-question interest assessment. Each option lists one or more
// category keys it contributes a point to -- most options map to a single
// category, which keeps the scoring easy to follow.
const QUESTIONS = [
  {
    text: "When you have free time, you're most likely to...",
    options: [
      { text: "Tinker with a gadget, bike, or take something apart to see how it works", categories: ["engineering"] },
      { text: "Draw, design, or make something visual", categories: ["art"] },
      { text: "Read, write, or make videos/podcasts", categories: ["writing"] },
      { text: "Hang out with friends or family", categories: ["people"] },
      { text: "Be outside -- hiking, sports, working in a yard or garden", categories: ["outdoors"] },
    ],
  },
  {
    text: "Which school subject do you find yourself enjoying the most?",
    options: [
      { text: "Math class", categories: ["math"] },
      { text: "Science class (biology, chemistry, physics)", categories: ["science"] },
      { text: "Computer science / coding", categories: ["tech"] },
      { text: "Art or design class", categories: ["art"] },
      { text: "English or language arts", categories: ["writing"] },
    ],
  },
  {
    text: "A group project is more fun for you when your job is to...",
    options: [
      { text: "Organize the team and keep everyone on budget/schedule", categories: ["business"] },
      { text: "Design how it looks or how people will use it", categories: ["art"] },
      { text: "Build or troubleshoot the actual thing", categories: ["engineering"] },
      { text: "Write the report or present the findings", categories: ["writing"] },
      { text: "Work on your piece solo and bring it back together", categories: ["independent"] },
    ],
  },
  {
    text: "Which of these sounds like the best afternoon?",
    options: [
      { text: "Helping a friend work through a problem they're upset about", categories: ["healthcare", "people"] },
      { text: "Taking care of a pet or volunteering at an animal shelter", categories: ["animals"] },
      { text: "Building something with your hands (wood, metal, circuits, Legos)", categories: ["engineering"] },
      { text: "Solving math puzzles or logic games", categories: ["math"] },
      { text: "Being outdoors, away from screens", categories: ["outdoors"] },
    ],
  },
  {
    text: "In a video game or hobby project, you gravitate toward...",
    options: [
      { text: "Designing the levels, characters, or visuals", categories: ["art"] },
      { text: "Writing the story or dialogue", categories: ["writing"] },
      { text: "Modding, scripting, or coding new features", categories: ["tech"] },
      { text: "Optimizing strategy and numbers", categories: ["math"] },
      { text: "Playing with friends and coordinating the team", categories: ["people"] },
    ],
  },
  {
    text: "Which cause would you most want to spend a Saturday volunteering for?",
    options: [
      { text: "A health clinic or hospital", categories: ["healthcare"] },
      { text: "An animal rescue", categories: ["animals"] },
      { text: "A local business or fundraiser", categories: ["business"] },
      { text: "A park or trail cleanup", categories: ["outdoors"] },
      { text: "A community center working directly with people", categories: ["people"] },
    ],
  },
  {
    text: "When something breaks around the house, you...",
    options: [
      { text: "Want to figure out exactly why it broke and fix it yourself", categories: ["engineering"] },
      { text: "Look up a tutorial and try it, mostly for the challenge", categories: ["tech"] },
      { text: "Call/ask someone who knows how to fix it -- coordinating help is your strength", categories: ["people"] },
      { text: "Not that interested, honestly -- you'd rather work on something creative", categories: ["art"] },
      { text: "Research the most cost-effective way to solve it", categories: ["business"] },
    ],
  },
  {
    text: "Which kind of school project have you enjoyed most?",
    options: [
      { text: "A science-fair experiment", categories: ["science"] },
      { text: "A creative writing piece or presentation", categories: ["writing"] },
      { text: "Building a model, robot, or structure", categories: ["engineering"] },
      { text: "A budgeting or economics project", categories: ["business"] },
      { text: "Anything you could do at your own pace, on your own", categories: ["independent"] },
    ],
  },
  {
    text: "Your friends would probably describe you as the one who...",
    options: [
      { text: "Explains things clearly and likes to teach or help others understand", categories: ["writing", "people"] },
      { text: "Takes care of people when they're upset or hurt", categories: ["healthcare"] },
      { text: "Notices small details and likes precision", categories: ["math"] },
      { text: "Has strong opinions about how things should look", categories: ["art"] },
      { text: "Is happiest working through a problem alone before sharing it", categories: ["independent"] },
    ],
  },
  {
    text: "If you had to give a presentation, you'd rather it be about...",
    options: [
      { text: "How something is built or engineered", categories: ["engineering"] },
      { text: "A new app, tool, or piece of technology", categories: ["tech"] },
      { text: "A business idea or marketing plan", categories: ["business"] },
      { text: "An animal species or ecosystem", categories: ["animals"] },
      { text: "A trip outdoors or a nature topic", categories: ["outdoors"] },
    ],
  },
  {
    text: "Which work environment sounds best to you?",
    options: [
      { text: "A lab or workshop where you're building/testing things", categories: ["engineering", "science"] },
      { text: "A hospital, clinic, or care facility", categories: ["healthcare"] },
      { text: "An office working with clients or a team", categories: ["business"] },
      { text: "Outdoors or on a job site, not behind a desk all day", categories: ["outdoors"] },
      { text: "Anywhere, as long as you can focus without a lot of interruptions", categories: ["independent"] },
    ],
  },
  {
    text: "What kind of math or number problems do you like best?",
    options: [
      { text: "Geometry and spatial reasoning (shapes, angles, structures)", categories: ["math", "engineering"] },
      { text: "Statistics and data (what does this trend tell us?)", categories: ["math", "business"] },
      { text: "I like numbers fine, but I'd rather work with words or images", categories: ["writing"] },
      { text: "Honestly, math isn't my favorite -- I'd rather work with people or outdoors", categories: ["people"] },
      { text: "Applied problems -- how much material, how much it costs, how long it takes", categories: ["math"] },
    ],
  },
];


// The career database. Each career lists which of the 12 categories it
// draws on (used for matching), plus the info shown on the detail page.
// "postsecondary" and the roadmap "steps" are built from these fields
// further down by buildRoadmap().
const CAREERS = [
  {
    id: "mechanical-engineer",
    name: "Mechanical Engineer",
    description: "Designs, builds, and tests machines and mechanical systems -- everything from engines to robotics to medical devices.",
    categories: ["engineering", "math", "science", "tech"],
    educationLevel: "Bachelor's degree (4 years)",
    skills: ["CAD (computer-aided design)", "Problem-solving under constraints", "Physics & statics", "Prototyping"],
    hsCourses: ["Algebra II", "Geometry", "Physics", "Pre-Calculus / Calculus"],
    postsecondary: ["Mechanical Engineering degree (B.S.)"],
    experiences: ["Robotics club or FIRST Robotics", "Job shadow a working engineer", "Build a personal engineering project"],
  },
  {
    id: "electrical-engineer",
    name: "Electrical Engineer",
    description: "Designs circuits, power systems, and electronics -- the hidden systems behind phones, cars, and the power grid.",
    categories: ["engineering", "math", "tech", "science"],
    educationLevel: "Bachelor's degree (4 years)",
    skills: ["Circuit design", "Programming (embedded systems)", "Signal analysis", "Troubleshooting"],
    hsCourses: ["Algebra II", "Physics", "Pre-Calculus / Calculus", "Intro to Programming"],
    postsecondary: ["Electrical Engineering degree (B.S.)"],
    experiences: ["Build a simple circuit or Arduino project", "Robotics or electronics club", "Internship at a utility or electronics company"],
  },
  {
    id: "civil-engineer",
    name: "Civil Engineer",
    description: "Plans and designs infrastructure -- roads, bridges, water systems, and buildings that communities depend on.",
    categories: ["engineering", "math", "outdoors", "science"],
    educationLevel: "Bachelor's degree (4 years)",
    skills: ["Structural analysis", "Site surveying", "Project planning", "CAD / GIS software"],
    hsCourses: ["Geometry", "Algebra II", "Physics", "Environmental Science"],
    postsecondary: ["Civil Engineering degree (B.S.)"],
    experiences: ["Job shadow at a city engineering department", "Volunteer on a community infrastructure project", "Engineering club project involving structures"],
  },
  {
    id: "software-developer",
    name: "Software Developer",
    description: "Builds the apps, websites, and software systems that run on computers and phones.",
    categories: ["tech", "math", "independent", "engineering"],
    educationLevel: "Bachelor's degree (or coding bootcamp / self-taught path)",
    skills: ["Programming languages (Python, JavaScript, etc.)", "Debugging", "Logical problem-solving", "Version control (Git)"],
    hsCourses: ["Computer Science / Intro to Programming", "Algebra II", "Pre-Calculus", "Statistics"],
    postsecondary: ["Computer Science degree (B.S.)", "Coding bootcamp"],
    experiences: ["Build a personal app or website", "Contribute to an open-source project", "Coding club or hackathon"],
  },
  {
    id: "biomedical-engineer",
    name: "Biomedical Engineer",
    description: "Combines engineering and biology to design medical devices, prosthetics, and diagnostic equipment.",
    categories: ["engineering", "science", "healthcare", "math"],
    educationLevel: "Bachelor's degree (4 years)",
    skills: ["Biology & anatomy basics", "CAD & prototyping", "Data analysis", "Regulatory awareness"],
    hsCourses: ["Biology", "Chemistry", "Physics", "Algebra II / Calculus"],
    postsecondary: ["Biomedical Engineering degree (B.S.)"],
    experiences: ["Science fair project with a health angle", "Job shadow at a hospital or device company", "Anatomy or health-sciences club"],
  },
  {
    id: "nurse",
    name: "Nurse",
    description: "Provides direct patient care, monitors health, and supports patients and families through treatment.",
    categories: ["healthcare", "people", "science", "independent"],
    educationLevel: "Associate's or Bachelor's degree in Nursing (BSN)",
    skills: ["Patient communication", "Clinical judgment", "Attention to detail", "Working calmly under pressure"],
    hsCourses: ["Biology", "Chemistry", "Anatomy & Physiology (if offered)", "Health Sciences"],
    postsecondary: ["Nursing degree (ADN or BSN)"],
    experiences: ["Volunteer at a hospital or clinic", "CNA (Certified Nursing Assistant) certification", "Job shadow a nurse"],
  },
  {
    id: "physical-therapist",
    name: "Physical Therapist",
    description: "Helps patients recover movement and manage pain after injury, surgery, or illness.",
    categories: ["healthcare", "people", "science"],
    educationLevel: "Doctor of Physical Therapy (DPT), 7 years total",
    skills: ["Anatomy knowledge", "Hands-on treatment techniques", "Patient motivation & coaching", "Care planning"],
    hsCourses: ["Biology", "Anatomy & Physiology (if offered)", "Chemistry", "Health Sciences"],
    postsecondary: ["Bachelor's degree, then Doctor of Physical Therapy (DPT)"],
    experiences: ["Volunteer or shadow at a PT clinic", "Play or coach a sport (injury/movement awareness)", "Job shadow an athletic trainer"],
  },
  {
    id: "architect",
    name: "Architect",
    description: "Designs buildings and spaces, balancing how they look, function, and hold up structurally.",
    categories: ["art", "engineering", "math", "business"],
    educationLevel: "Bachelor's or Master's degree in Architecture",
    skills: ["Drafting & CAD", "3D modeling", "Spatial reasoning", "Client communication"],
    hsCourses: ["Geometry", "Art / Drafting", "Physics", "Algebra II"],
    postsecondary: ["Architecture degree (B.Arch or M.Arch)"],
    experiences: ["Design a floor plan or model of a building", "Job shadow at an architecture firm", "Art or drafting club"],
  },
  {
    id: "graphic-designer",
    name: "Graphic Designer",
    description: "Creates visual content -- logos, layouts, and digital design -- for brands, apps, and print.",
    categories: ["art", "tech", "writing", "independent"],
    educationLevel: "Bachelor's degree, portfolio, or self-taught path",
    skills: ["Design software (Adobe Suite, Figma)", "Typography & color theory", "Client feedback & revision", "Branding basics"],
    hsCourses: ["Art / Graphic Design", "Computer Science (basic)", "English / Communications", "Business (basic)"],
    postsecondary: ["Graphic Design degree (B.F.A.)", "Design portfolio program"],
    experiences: ["Build a personal design portfolio", "Design for a school club or local business", "Freelance a small project"],
  },
  {
    id: "accountant",
    name: "Accountant",
    description: "Manages financial records, prepares taxes, and helps individuals or businesses make sound financial decisions.",
    categories: ["math", "business", "independent"],
    educationLevel: "Bachelor's degree in Accounting",
    skills: ["Spreadsheets & accounting software", "Attention to detail", "Analytical thinking", "Understanding regulations"],
    hsCourses: ["Algebra II", "Statistics", "Business / Personal Finance", "Economics"],
    postsecondary: ["Accounting degree (B.S.)", "CPA certification (after degree)"],
    experiences: ["Manage budget for a club or fundraiser", "Internship at an accounting firm", "Personal finance / investing club"],
  },
  {
    id: "marketing-specialist",
    name: "Marketing Specialist",
    description: "Plans campaigns and content that help a business or organization reach and connect with customers.",
    categories: ["business", "writing", "people", "art"],
    educationLevel: "Bachelor's degree in Marketing or Communications",
    skills: ["Writing & storytelling", "Social media & analytics", "Basic design sense", "Project coordination"],
    hsCourses: ["Business / Marketing", "English / Communications", "Statistics", "Art (basic)"],
    postsecondary: ["Marketing or Communications degree (B.S./B.A.)"],
    experiences: ["Run social media for a club or small business", "DECA or a business club", "Internship at a marketing agency"],
  },
  {
    id: "teacher",
    name: "Teacher",
    description: "Plans lessons and guides students through learning a subject, from elementary school through high school.",
    categories: ["people", "writing", "science", "independent"],
    educationLevel: "Bachelor's degree in Education (plus certification)",
    skills: ["Explaining ideas clearly", "Classroom management", "Patience & adaptability", "Lesson planning"],
    hsCourses: ["English", "Whatever subject you'd want to teach", "Psychology (if offered)", "Speech / Communications"],
    postsecondary: ["Education degree (B.A./B.S.)", "Teaching certification"],
    experiences: ["Tutor a younger student", "Volunteer as a camp counselor or coach", "Job shadow a teacher"],
  },
  {
    id: "electrician",
    name: "Electrician",
    description: "Installs and repairs electrical systems in homes, businesses, and industrial sites.",
    categories: ["engineering", "tech", "independent", "outdoors"],
    educationLevel: "Apprenticeship + trade certification (no 4-year degree required)",
    skills: ["Reading electrical diagrams", "Hands-on wiring & troubleshooting", "Safety code knowledge", "Physical stamina"],
    hsCourses: ["Algebra I/II", "Shop / Electrical Trades class", "Physics (basic)", "Technical drawing"],
    postsecondary: ["Trade school program or apprenticeship (paid, on-the-job)"],
    experiences: ["Trade-school open house or CareerTech program", "Job shadow a working electrician", "Basic home-wiring project (with supervision)"],
  },
  {
    id: "welder",
    name: "Welder",
    description: "Joins metal parts together for construction, manufacturing, and repair work.",
    categories: ["engineering", "outdoors", "independent", "tech"],
    educationLevel: "Trade certification (6 months - 2 years)",
    skills: ["Blueprint reading", "Precision hand skills", "Metal & material knowledge", "Safety practices"],
    hsCourses: ["Shop / Welding class", "Geometry", "Physics (basic)", "Technical drawing"],
    postsecondary: ["Welding certificate program at a trade school or CareerTech"],
    experiences: ["CareerTech welding program", "Job shadow at a manufacturing shop", "Metal shop class project"],
  },
  {
    id: "hvac-technician",
    name: "HVAC Technician",
    description: "Installs and repairs heating, ventilation, and air-conditioning systems in homes and buildings.",
    categories: ["engineering", "tech", "outdoors", "independent"],
    educationLevel: "Trade certification (6 months - 2 years)",
    skills: ["Diagnosing mechanical problems", "Reading system diagrams", "Customer communication", "Hands-on repair"],
    hsCourses: ["Shop / HVAC class", "Algebra I", "Physics (basic)", "Technical drawing"],
    postsecondary: ["HVAC certificate program at a trade school or CareerTech"],
    experiences: ["CareerTech HVAC program", "Job shadow an HVAC technician", "Basic home-repair project (with supervision)"],
  },
];

// Turns a career's raw fields into a structured roadmap: four stages for
// display, plus a flattened list of "steps" the student can check off in
// any order. Kept as a function (not hard-coded data) so the four stages
// and the checklist always stay in sync with each other.
function buildRoadmap(career) {
  const stages = [
    { key: "foundation",    title: "Build Your Foundation",    items: career.hsCourses },
    { key: "skills",        title: "Develop Skills",           items: career.skills },
    { key: "experience",    title: "Gain Experience",          items: career.experiences },
    { key: "postsecondary", title: "Postsecondary Education",  items: career.postsecondary },
  ];

  // Build a flat checklist: 2 items from foundation/skills/experience,
  // plus every postsecondary option. That gives most careers ~7 steps,
  // matching the "3 / 7 completed" style shown on the dashboard.
  const steps = [];
  const addSteps = (stageKey, stageTitle, items, count) => {
    items.slice(0, count).forEach((item, i) => {
      steps.push({
        id: `${career.id}-${stageKey}-${i}`,
        title: item,
        stage: stageTitle,
      });
    });
  };
  addSteps("foundation", "Build Your Foundation", career.hsCourses, 2);
  addSteps("skills", "Develop Skills", career.skills, 2);
  addSteps("experience", "Gain Experience", career.experiences, 2);
  addSteps("postsecondary", "Postsecondary Education", career.postsecondary, career.postsecondary.length);

  return { stages, steps };
}

// Example "opportunities near you" data. This is intentionally a small,
// hard-coded lookup (focused on Stillwater / Oklahoma) rather than a real
// API call -- see renderOpportunities() for how a real API/database could
// be swapped in later without changing the rest of the app.
const OPPORTUNITIES_BY_REGION = {
  "stillwater-ok": [
    { label: "University", name: "Oklahoma State University", desc: "Engineering, health sciences, business, and design programs, plus pre-college camps." },
    { label: "CareerTech", name: "Meridian Technology Center", desc: "Oklahoma CareerTech programs in trades, healthcare, and IT -- many open to high schoolers." },
    { label: "Internship", name: "Local engineering & tech firms", desc: "Stillwater-area employers often take student interns during the school year or summer." },
    { label: "Job Shadow", name: "Stillwater Medical Center", desc: "Hospitals frequently allow job-shadowing for students exploring healthcare careers." },
    { label: "Club / Competition", name: "OSU Robotics & FIRST teams", desc: "Regional robotics and engineering competitions welcome student volunteers and teams." },
    { label: "Technical Program", name: "OSU Institute of Technology (Okmulgee)", desc: "Hands-on technical degrees in trades, engineering technology, and design." },
  ],
  "oklahoma-general": [
    { label: "University", name: "Oklahoma public universities (OSU, OU, UCO, etc.)", desc: "Most offer engineering, health, business, and design programs with campus visit days." },
    { label: "CareerTech", name: "Oklahoma CareerTech system", desc: "A statewide network of technology centers offering trade and healthcare programs to high schoolers." },
    { label: "Internship", name: "Regional employers & chambers of commerce", desc: "Local chambers of commerce often maintain internship listings for students." },
    { label: "Club / Competition", name: "State FFA, FBLA, DECA, and robotics chapters", desc: "Statewide student organizations with local chapters in most Oklahoma schools." },
  ],
  "default": [
    { label: "University", name: "Your state's public universities", desc: "Look up open houses, summer camps, or dual-enrollment options in your field of interest." },
    { label: "Technical Program", name: "Local community or technical college", desc: "Many offer trade certificates and career-exploration courses for high schoolers." },
    { label: "Internship", name: "Local businesses in your field of interest", desc: "Ask a school counselor about internship or job-shadow programs in your area." },
    { label: "Club / Competition", name: "School clubs (robotics, FBLA, DECA, HOSA, FFA)", desc: "Most of these national organizations have chapters at schools across the country." },
  ],
};

function getOpportunities(studentInfo) {
  const city = (studentInfo.city || "").trim().toLowerCase();
  const state = (studentInfo.state || "").trim().toLowerCase();
  if (city === "stillwater" && (state === "ok" || state === "oklahoma")) {
    return { key: "stillwater-ok", list: OPPORTUNITIES_BY_REGION["stillwater-ok"] };
  }
  if (state === "ok" || state === "oklahoma") {
    return { key: "oklahoma-general", list: OPPORTUNITIES_BY_REGION["oklahoma-general"] };
  }
  return { key: "default", list: OPPORTUNITIES_BY_REGION["default"] };
}


/* ============================================================
   2. STATE
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
    selectedCareerId: null,
    stepStatus: {},           // { careerId: { stepId: "Not Started" | "In Progress" | "Completed" } }
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
        placeholder values, so the prototype still works out of the box) ---- */

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


/* ============================================================
   3. NAVIGATION
   ============================================================ */

// The six stages shown as dots in the header trail.
const STAGES = [
  { screen: "welcome",   label: "Welcome" },
  { screen: "info",      label: "About you" },
  { screen: "quiz",      label: "Interests" },
  { screen: "results",   label: "Careers" },
  { screen: "detail",    label: "Roadmap" },
  { screen: "dashboard", label: "Progress" },
];

function goToScreen(screenName) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.screen === screenName);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderTrail(screenName);

  // Each screen needs a little setup work whenever it becomes visible.
  if (screenName === "info") fillInfoForm();
  if (screenName === "quiz") renderQuizQuestion();
  if (screenName === "results") renderResults();
  if (screenName === "detail") renderDetail();
  if (screenName === "dashboard") renderDashboard();
}

function renderTrail(activeScreen) {
  const trail = document.getElementById("trail");
  trail.innerHTML = "";
  const activeIndex = STAGES.findIndex((s) => s.screen === activeScreen);

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

/* ---------- Screen 4: career recommendations ---------- */

// Matching "algorithm" for this prototype: for each career, count how many
// of its listed categories overlap with the student's top interests, then
// weight by the student's actual score in those categories. This is a
// simple demo, not a validated instrument -- see the on-screen disclaimer.
function matchCareers() {
  const scores = state.categoryScores || {};
  const results = CAREERS.map((career) => {
    let matchScore = 0;
    career.categories.forEach((catKey) => {
      matchScore += scores[catKey] || 0;
    });
    // Normalize roughly to a percentage against a generous ceiling so
    // numbers feel meaningful without implying false precision.
    const ceiling = career.categories.length * 4;
    const percent = Math.min(100, Math.round((matchScore / ceiling) * 100));
    return { career, matchScore, percent };
  });

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

function renderResults() {
  const top3 = topCategories(state.categoryScores || {}, 3).map(categoryLabel);
  document.getElementById("results-summary").textContent =
    top3.length ? `Your strongest interests: ${top3.join(", ")}.` : "Complete the assessment to see your matches.";

  const ranked = matchCareers().slice(0, 6);
  const grid = document.getElementById("career-grid");
  grid.innerHTML = "";

  ranked.forEach(({ career, percent }) => {
    const card = document.createElement("div");
    card.className = "career-card";
    card.innerHTML = `
      <span class="career-card__match">${percent}% interest match</span>
      <h3 class="career-card__name">${career.name}</h3>
      <p class="career-card__desc">${career.description}</p>
      <div class="career-card__tags">
        ${career.categories.map((c) => `<span class="tag">${categoryLabel(c)}</span>`).join("")}
      </div>
      <button type="button" class="btn btn--pill-outline" data-career="${career.id}">Explore career</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      state.selectedCareerId = career.id;
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

/* ---------- Screen 5: career detail, roadmap, self-paced steps ---------- */

function renderDetail() {
  const career = CAREERS.find((c) => c.id === state.selectedCareerId);
  const container = document.getElementById("detail-content");
  if (!career) {
    container.innerHTML = `<p>No career selected yet. <button class="btn btn--primary" data-go="results">Back to careers</button></p>`;
    container.querySelector("[data-go]").addEventListener("click", () => goToScreen("results"));
    return;
  }

  const { stages, steps } = buildRoadmap(career);
  const statusMap = getStepStatusMap(career.id);
  const topInterests = topCategories(state.categoryScores || {}, 3).map(categoryLabel);

  container.innerHTML = `
    <div class="detail-head">
      <div>
        <h2>${career.name}</h2>
        <p class="detail-desc">${career.description}</p>
      </div>
      <span class="tag">${career.educationLevel}</span>
    </div>

    <div class="fit-block">
      <h3>Why this might fit you</h3>
      <p>This career draws on ${career.categories.map(categoryLabel).join(", ")}${
        topInterests.length ? ` -- which overlaps with your top interests (${topInterests.join(", ")}).` : "."
      }</p>
    </div>

    <div class="info-grid">
      <div class="info-block">
        <h3>Important skills</h3>
        <ul>${career.skills.map((s) => `<li>${s}</li>`).join("")}</ul>
      </div>
      <div class="info-block">
        <h3>High-school courses</h3>
        <ul>${career.hsCourses.map((s) => `<li>${s}</li>`).join("")}</ul>
      </div>
      <div class="info-block">
        <h3>Postsecondary options</h3>
        <ul>${career.postsecondary.map((s) => `<li>${s}</li>`).join("")}</ul>
      </div>
      <div class="info-block">
        <h3>Experience ideas</h3>
        <ul>${career.experiences.map((s) => `<li>${s}</li>`).join("")}</ul>
      </div>
    </div>

    <div class="roadmap">
      <h3>Your roadmap</h3>
      <p class="roadmap__hint">One possible path from where you are now to this career. You don't have to follow it in order -- see "What would you like to work on next?" below.</p>
      <div class="roadmap-stages">
        ${renderRoadmapStagesHTML(stages)}
      </div>
    </div>

    <div class="next-steps">
      <h3>What would you like to work on next?</h3>
      <p class="next-steps__hint">Pick any item below, in any order. Tap the status button to move it from Not Started &rarr; In Progress &rarr; Completed.</p>
      <div class="step-list" id="step-list"></div>
    </div>

    <div class="opportunities">
      <h3>Opportunities near you</h3>
      ${renderOpportunitiesHTML()}
    </div>

    <div class="detail-actions">
      <button type="button" class="btn btn--primary" data-go="dashboard">View my progress dashboard</button>
      <button type="button" class="btn btn--ghost" data-go="results">Choose a different career</button>
    </div>
  `;

  container.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => goToScreen(btn.dataset.go));
  });

  renderStepList(career, steps, statusMap);
}

function renderRoadmapStagesHTML(stages) {
  // "YOU ARE HERE" always sits at the top of the roadmap, above stage 1,
  // representing the student's current position before any steps are done.
  const hereRow = `
    <div class="roadmap-stage">
      <div class="roadmap-stage__rail">
        <div class="roadmap-stage__dot is-here"></div>
        <div class="roadmap-stage__line"></div>
      </div>
      <div class="roadmap-stage__body">
        <div class="roadmap-stage__title">You are here</div>
        <div class="roadmap-stage__items"><span class="tag">Exploring this career</span></div>
      </div>
    </div>
  `;

  const stageRows = stages
    .map(
      (stage) => `
    <div class="roadmap-stage">
      <div class="roadmap-stage__rail">
        <div class="roadmap-stage__dot"></div>
        <div class="roadmap-stage__line"></div>
      </div>
      <div class="roadmap-stage__body">
        <div class="roadmap-stage__title">${stage.title}</div>
        <div class="roadmap-stage__items">
          ${stage.items.map((item) => `<span class="tag">${item}</span>`).join("")}
        </div>
      </div>
    </div>
  `
    )
    .join("");

  return hereRow + stageRows;
}

function renderOpportunitiesHTML() {
  const { list } = getOpportunities(state.studentInfo);
  const locationLabel = state.studentInfo.city
    ? `${state.studentInfo.city}${state.studentInfo.state ? ", " + state.studentInfo.state : ""}`
    : "your area";

  return `
    <span class="example-flag">Example opportunities, not a live listing</span>
    <p class="opportunities__location">Based on the location you entered: ${locationLabel}. A future version of PATH could connect this section to a real opportunities database or API.</p>
    <div class="opp-grid">
      ${list
        .map(
          (opp) => `
        <div class="opp-card">
          <div class="opp-card__label">${opp.label}</div>
          <div class="opp-card__name">${opp.name}</div>
          <p class="opp-card__desc">${opp.desc}</p>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function renderStepList(career, steps, statusMap) {
  const list = document.getElementById("step-list");
  list.innerHTML = "";

  const cycle = { "Not Started": "In Progress", "In Progress": "Completed", "Completed": "Not Started" };

  steps.forEach((step) => {
    const status = statusMap[step.id] || "Not Started";

    const row = document.createElement("div");
    row.className = "step-item";
    if (status === "Completed") row.classList.add("is-completed");
    if (status === "In Progress") row.classList.add("is-inprogress");

    row.innerHTML = `
      <div class="step-item__info">
        <div class="step-item__title">${step.title}</div>
        <div class="step-item__category">${step.stage}</div>
      </div>
      <button type="button" class="step-status" data-status="${status}">${status}</button>
    `;

    row.querySelector(".step-status").addEventListener("click", (e) => {
      const nextStatus = cycle[status];
      statusMap[step.id] = nextStatus;
      saveState();
      renderStepList(career, steps, statusMap); // re-render just this list
    });

    list.appendChild(row);
  });
}

/* ---------- Screen 6: dashboard ---------- */

function computeProgress(career) {
  const { steps } = buildRoadmap(career);
  const statusMap = getStepStatusMap(career.id);
  const completed = steps.filter((s) => statusMap[s.id] === "Completed");
  const inProgress = steps.filter((s) => statusMap[s.id] === "In Progress");
  const notStarted = steps.filter((s) => !statusMap[s.id] || statusMap[s.id] === "Not Started");
  const percent = steps.length ? Math.round((completed.length / steps.length) * 100) : 0;

  const current = inProgress[0] || notStarted[0] || null;
  const recommended = [...inProgress.slice(1), ...notStarted].filter((s) => s !== current).slice(0, 3);

  return { steps, completed, inProgress, notStarted, percent, current, recommended };
}

function renderDashboard() {
  const container = document.getElementById("dashboard-content");
  const career = CAREERS.find((c) => c.id === state.selectedCareerId);

  if (!career) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No career selected yet</h2>
        <p>Choose a career from your recommendations to start building a roadmap and tracking progress.</p>
        <button type="button" class="btn btn--primary" data-go="results">Explore careers</button>
      </div>
    `;
    container.querySelector("[data-go]").addEventListener("click", () => goToScreen("results"));
    return;
  }

  const progress = computeProgress(career);
  const topInterests = topCategories(state.categoryScores || {}, 3).map(categoryLabel);

  container.innerHTML = `
    <div class="dash-head">
      <div>
        <p class="panel__sub" style="margin-bottom:4px;">Your path</p>
        <h2 style="margin:0;">${career.name}</h2>
      </div>
      <button type="button" class="btn btn--ghost" data-go="results">Choose a different career</button>
    </div>

    <div class="dash-stats">
      <div class="dash-stat">
        <div class="dash-stat__label">Overall progress</div>
        <div class="dash-stat__value">${progress.percent}%</div>
      </div>
      <div class="dash-stat">
        <div class="dash-stat__label">Steps completed</div>
        <div class="dash-stat__value">${progress.completed.length} / ${progress.steps.length}</div>
      </div>
      <div class="dash-stat">
        <div class="dash-stat__label">Current step</div>
        <div class="dash-stat__value" style="font-size:1.1rem;">${progress.current ? progress.current.title : "All caught up"}</div>
      </div>
    </div>

    <div class="progress-bar" style="margin-bottom:34px;">
      <div class="progress-bar__fill" style="width:${progress.percent}%"></div>
    </div>

    <div class="dash-section">
      <h3>Your strongest interests</h3>
      <div class="chip-row">${topInterests.map((t) => `<span class="tag">${t}</span>`).join("") || "<span class=\"tag\">Take the assessment to see this</span>"}</div>
    </div>

    <div class="dash-section">
      <h3>Recommended next steps</h3>
      <div class="chip-row">
        ${
          progress.recommended.length
            ? progress.recommended.map((s) => `<span class="tag">${s.title}</span>`).join("")
            : `<span class="tag">You've started everything on the list -- nice work</span>`
        }
      </div>
    </div>

    <div class="detail-actions">
      <button type="button" class="btn btn--primary" data-go="detail">Open full roadmap</button>
      <button type="button" class="btn btn--ghost" data-go="results">Back to career exploration</button>
    </div>
  `;

  container.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => goToScreen(btn.dataset.go));
  });
}


/* ============================================================
   5. LOGIN / SIGN UP (Firebase Authentication)
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
}

document.getElementById("btn-toggle-auth-mode").addEventListener("click", () => {
  setAuthMode(authMode === "login" ? "signup" : "login");
});

function showLoginError(message) {
  const el = document.getElementById("login-error");
  el.textContent = message;
  el.hidden = false;
}

document.getElementById("form-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  document.getElementById("login-error").hidden = true;

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
  };
  return map[err.code] || err.message;
}

document.getElementById("btn-signout").addEventListener("click", () => {
  if (firebaseReady) auth.signOut();
});


/* ============================================================
   6. STARTUP
   ============================================================ */

document.getElementById("btn-start").addEventListener("click", () => goToScreen("info"));

document.querySelectorAll("[data-go]").forEach((btn) => {
  // Only wire up static buttons here; buttons created dynamically inside
  // render functions get their own listeners where they're created.
  if (!btn.closest("#detail-content") && !btn.closest("#dashboard-content")) {
    btn.addEventListener("click", () => goToScreen(btn.dataset.go));
  }
});

// Resume where the student left off: if they've already answered at least
// one quiz question or picked a career, skip back to a sensible screen
// instead of always starting at the welcome page.
function resumeOrStart() {
  if (state.selectedCareerId) {
    goToScreen("dashboard");
  } else if (state.categoryScores) {
    goToScreen("results");
  } else if (Object.keys(state.quizAnswers).length > 0) {
    goToScreen("quiz");
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
    // prototype still works immediately out of the box.
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
