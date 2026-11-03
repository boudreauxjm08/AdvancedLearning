/* ==========================================================================
   PATH — data.js
   All of the content PATH uses lives in this one file, so you can change it
   without touching any of the app logic in script.js:

     1. CATEGORIES / QUESTIONS   the "how do you like to learn" survey
     2. INTERESTS                words PATH recognizes when students type topics
     3. THEMES                   the study themes where interests overlap
     4. COURSES / COURSE_LINKS   school subjects shown on the skills web
     5. OPPORTUNITIES            places to learn near the student

   How it fits together: a student types three topics. PATH turns each topic
   into one or more INTERESTS, then finds THEMES that overlap as many of those
   interests as possible. If no theme covers a topic (say, "skateboarding"),
   script.js builds a custom theme from the student's own words, so every topic
   always gets something to study.
   ========================================================================== */


/* ============================================================
   1. SURVEY: how do you like to learn?
   ============================================================ */

// The 12 "learning styles" the survey measures. "key" is used internally;
// "label" is what students see. Each study thread (see THEMES) is tagged
// with one of these keys, which is how the survey decides which activities
// to highlight as a good fit.
const CATEGORIES = [
  { key: "math",        label: "Numbers & patterns" },
  { key: "science",     label: "Experiments & discovery" },
  { key: "tech",        label: "Digital tools & code" },
  { key: "engineering", label: "Building & making" },
  { key: "healthcare",  label: "Helping & caring" },
  { key: "business",    label: "Planning & organizing" },
  { key: "art",         label: "Creating & designing" },
  { key: "writing",     label: "Stories & writing" },
  { key: "outdoors",    label: "Getting out there" },
  { key: "animals",     label: "Living things" },
  { key: "people",      label: "Learning with others" },
  { key: "independent", label: "Learning on your own" },
];

function categoryLabel(key) {
  const found = CATEGORIES.find((c) => c.key === key);
  return found ? found.label : key;
}

// 12 questions about HOW a student likes to learn. Each option adds a point
// to one or more of the categories above.
const QUESTIONS = [
  {
    text: "You find something fascinating. What do you want to do first?",
    options: [
      { text: "Take it apart or build a model of it", categories: ["engineering"] },
      { text: "Look up the story behind it", categories: ["writing"] },
      { text: "Run a test or experiment", categories: ["science"] },
      { text: "Draw or design something inspired by it", categories: ["art"] },
      { text: "Talk to someone who knows a lot about it", categories: ["people"] },
    ],
  },
  {
    text: "Which kind of project sounds the most fun?",
    options: [
      { text: "Building a working model", categories: ["engineering"] },
      { text: "Making a short film, website, or app", categories: ["tech"] },
      { text: "Writing an article or a story", categories: ["writing"] },
      { text: "Collecting data and finding patterns", categories: ["math"] },
      { text: "Creating an art piece, poster, or exhibit", categories: ["art"] },
    ],
  },
  {
    text: "How do you like to work through a hard idea?",
    options: [
      { text: "Alone, with plenty of quiet time", categories: ["independent"] },
      { text: "In a small group, talking it out", categories: ["people"] },
      { text: "By measuring and counting things", categories: ["math"] },
      { text: "By sketching or diagramming it", categories: ["art"] },
      { text: "By trying something hands-on", categories: ["engineering"] },
    ],
  },
  {
    text: "Where do you learn best?",
    options: [
      { text: "At a desk with my own materials", categories: ["independent"] },
      { text: "Outside, out in the real world", categories: ["outdoors"] },
      { text: "In a lab or workshop", categories: ["science", "engineering"] },
      { text: "In a lively discussion", categories: ["people"] },
      { text: "Around animals, plants, or nature", categories: ["animals", "outdoors"] },
    ],
  },
  {
    text: "How would you most like to show what you learned?",
    options: [
      { text: "Give a presentation or teach a lesson", categories: ["people"] },
      { text: "Write a report or a story", categories: ["writing"] },
      { text: "Build a model or prototype", categories: ["engineering"] },
      { text: "Make a website, video, or program", categories: ["tech"] },
      { text: "Paint, draw, or design something", categories: ["art"] },
    ],
  },
  {
    text: "When a topic gets complicated, you usually...",
    options: [
      { text: "Look for patterns in the numbers", categories: ["math"] },
      { text: "Think about the people it affects", categories: ["healthcare"] },
      { text: "Figure out how the whole system is organized", categories: ["business"] },
      { text: "Test your ideas to see what is true", categories: ["science"] },
      { text: "Explain it in simple words to someone else", categories: ["writing", "people"] },
    ],
  },
  {
    text: "Which Saturday sounds best?",
    options: [
      { text: "Visiting a museum or historic site", categories: ["art", "writing"] },
      { text: "Helping others learn something", categories: ["healthcare", "people"] },
      { text: "Working on a coding or digital project", categories: ["tech"] },
      { text: "Exploring a trail or a new neighborhood", categories: ["outdoors"] },
      { text: "Planning and running a small event or sale", categories: ["business"] },
    ],
  },
  {
    text: "Which part of a school project do you enjoy most?",
    options: [
      { text: "Researching and reading", categories: ["writing", "independent"] },
      { text: "Building the thing", categories: ["engineering"] },
      { text: "Presenting to others", categories: ["people"] },
      { text: "Designing how it looks", categories: ["art"] },
      { text: "Analyzing the results", categories: ["math", "science"] },
    ],
  },
  {
    text: "How do you like to get feedback?",
    options: [
      { text: "Private notes I can think about on my own", categories: ["independent"] },
      { text: "A conversation with a teacher or friends", categories: ["people"] },
      { text: "A clear score or checklist", categories: ["math"] },
      { text: "Showing it to a real audience", categories: ["business", "people"] },
      { text: "Seeing whether my design actually works", categories: ["engineering"] },
    ],
  },
  {
    text: "A mystery shows up. How do you tackle it?",
    options: [
      { text: "Follow clues in old documents and books", categories: ["writing"] },
      { text: "Set up experiments to rule things out", categories: ["science"] },
      { text: "Interview the people involved", categories: ["people"] },
      { text: "Check the numbers", categories: ["math"] },
      { text: "Go to the scene and look around", categories: ["outdoors"] },
    ],
  },
  {
    text: "Which skill would you most like to grow?",
    options: [
      { text: "Coding", categories: ["tech"] },
      { text: "Drawing and design", categories: ["art"] },
      { text: "Writing and speaking", categories: ["writing"] },
      { text: "Building and fixing things", categories: ["engineering"] },
      { text: "Leading and organizing", categories: ["business"] },
    ],
  },
  {
    text: "What draws you into a topic the most?",
    options: [
      { text: "When it connects to animals or nature", categories: ["animals", "outdoors"] },
      { text: "When it helps people", categories: ["healthcare", "people"] },
      { text: "Big ideas and how systems work", categories: ["independent", "math"] },
      { text: "The gadgets and technology side", categories: ["tech"] },
      { text: "A bit of everything, no strong preference", categories: [] },
    ],
  },
];


/* ============================================================
   2. INTERESTS: words PATH recognizes in the topics students type
   ============================================================ */

// "id"      short name used inside THEMES (their "tags")
// "label"   how the interest is shown
// "words"   lowercase words or phrases that mean this interest. A plural
//           ("cat" matches "cats") is matched automatically.
// "implies" other interests that come along with this one. Typing "Egyptian"
//           also counts as history, for example. Implied interests count for
//           half as much as ones the student actually typed.
const INTERESTS = [
  { id: "cats",         label: "Cats",                    words: ["cat", "kitten", "kitty", "feline"], implies: ["animals"] },
  { id: "dogs",         label: "Dogs",                    words: ["dog", "puppy", "canine"], implies: ["animals"] },
  { id: "animals",      label: "Animals",                 words: ["animal", "wildlife", "pet", "zoo", "bird", "horse", "reptile", "insect", "wolf", "wolves", "bear", "elephant", "veterinarian", "vet"], implies: [] },
  { id: "ocean",        label: "The ocean",               words: ["ocean", "sea", "marine", "shark", "whale", "dolphin", "coral", "fish", "scuba", "diving", "reef", "submarine"], implies: [] },
  { id: "nature",       label: "Nature",                  words: ["nature", "forest", "hiking", "camping", "plant", "garden", "gardening", "tree", "flower", "ecology", "environment", "outdoors"], implies: [] },
  { id: "weather",      label: "Weather & climate",       words: ["weather", "storm", "tornado", "hurricane", "climate", "meteorology", "lightning", "snow"], implies: [] },
  { id: "space",        label: "Space",                   words: ["space", "astronomy", "planet", "star", "nasa", "rocket", "galaxy", "universe", "moon", "mars", "telescope", "astronaut"], implies: [] },
  { id: "dinosaurs",    label: "Dinosaurs & fossils",     words: ["dinosaur", "fossil", "paleontology", "t-rex", "jurassic"], implies: ["science"] },
  { id: "history",      label: "History",                 words: ["history", "historical", "ancient", "civilization", "archaeology", "empire", "world war"], implies: [] },
  { id: "egypt",        label: "Ancient Egypt",           words: ["egypt", "egyptian", "pharaoh", "pyramid", "mummy", "sphinx", "nile", "hieroglyph"], implies: ["history"] },
  { id: "rome",         label: "Ancient Rome",            words: ["rome", "roman", "gladiator", "colosseum", "caesar", "latin"], implies: ["history"] },
  { id: "greece",       label: "Ancient Greece",          words: ["greece", "greek", "athens", "sparta"], implies: ["history"] },
  { id: "medieval",     label: "The Middle Ages",         words: ["medieval", "middle ages", "knight", "castle", "viking", "samurai", "feudal"], implies: ["history"] },
  { id: "architecture", label: "Architecture",            words: ["architecture", "architect", "building", "skyscraper", "bridge", "cathedral", "interior design", "house design"], implies: [] },
  { id: "art",          label: "Art & design",            words: ["art", "drawing", "painting", "sketch", "design", "illustration", "sculpture", "museum", "graphic design", "craft"], implies: [] },
  { id: "music",        label: "Music",                   words: ["music", "song", "guitar", "piano", "band", "singing", "drums", "instrument", "hip hop", "rap", "composer"], implies: [] },
  { id: "film",         label: "Film & TV",               words: ["film", "movie", "cinema", "tv", "television", "animation", "anime", "directing", "youtube", "video"], implies: [] },
  { id: "books",        label: "Books & writing",         words: ["book", "reading", "writing", "story", "novel", "poetry", "poem", "fantasy", "fiction", "author", "journalism", "comic", "manga"], implies: [] },
  { id: "mythology",    label: "Myths & legends",         words: ["mythology", "myth", "legend", "folklore", "god", "magic", "dragon", "religion"], implies: [] },
  { id: "games",        label: "Games",                   words: ["video game", "gaming", "game", "minecraft", "esports", "chess", "board game", "tabletop", "d&d"], implies: [] },
  { id: "coding",       label: "Coding & computers",      words: ["coding", "programming", "computer", "software", "app", "website", "python", "javascript", "ai", "artificial intelligence", "hacking", "cybersecurity", "technology", "tech"], implies: [] },
  { id: "making",       label: "Building & inventing",    words: ["engineering", "robot", "robotics", "drone", "invent", "inventing", "build", "tinkering", "electronics", "3d printing", "woodworking", "lego"], implies: [] },
  { id: "math",         label: "Math & puzzles",          words: ["math", "mathematics", "numbers", "puzzle", "logic", "algebra", "geometry", "statistics", "probability"], implies: [] },
  { id: "science",      label: "Science",                 words: ["science", "chemistry", "physics", "biology", "experiment", "lab", "genetics", "dna", "volcano", "geology", "rocks", "minerals"], implies: [] },
  { id: "medicine",     label: "Medicine & the body",     words: ["medicine", "medical", "doctor", "nurse", "health", "anatomy", "body", "hospital", "disease", "first aid"], implies: [] },
  { id: "psychology",   label: "Psychology",              words: ["psychology", "mind", "brain", "behavior", "emotion", "mental health", "dream", "personality"], implies: [] },
  { id: "ideas",        label: "Big ideas & philosophy",  words: ["philosophy", "ethics", "debate", "big questions"], implies: [] },
  { id: "food",         label: "Food",                    words: ["food", "cooking", "baking", "chef", "recipe", "cuisine", "nutrition", "coffee", "pizza", "restaurant"], implies: [] },
  { id: "fashion",      label: "Fashion",                 words: ["fashion", "clothing", "clothes", "sewing", "style", "textile", "makeup", "jewelry", "sneaker"], implies: [] },
  { id: "sports",       label: "Sports",                  words: ["sport", "soccer", "football", "basketball", "baseball", "tennis", "running", "swimming", "gymnastics", "fitness", "athletics", "martial arts", "wrestling", "volleyball", "hockey", "golf"], implies: [] },
  { id: "cars",         label: "Cars & engines",          words: ["car", "engine", "motorcycle", "racing", "truck", "automotive", "mechanic"], implies: [] },
  { id: "flight",       label: "Flight",                  words: ["flight", "airplane", "aviation", "pilot", "aircraft", "helicopter", "plane", "flying"], implies: [] },
  { id: "money",        label: "Money & business",        words: ["money", "business", "economics", "finance", "investing", "stock", "entrepreneur", "marketing", "startup"], implies: [] },
  { id: "law",          label: "Law & government",        words: ["law", "government", "politics", "justice", "court", "lawyer", "rights", "election", "crime"], implies: [] },
  { id: "languages",    label: "Languages",               words: ["language", "spanish", "french", "japanese", "linguistics", "translation", "german", "chinese", "sign language"], implies: [] },
  { id: "travel",       label: "Travel & geography",      words: ["travel", "geography", "map", "country", "culture", "world", "tourism"], implies: [] },
  { id: "photography",  label: "Photography",             words: ["photography", "photo", "camera"], implies: [] },
  { id: "theater",      label: "Theater & performance",   words: ["theater", "theatre", "acting", "drama", "stage", "musical", "comedy", "improv"], implies: [] },
];


/* ============================================================
   3. THEMES: places where interests overlap
   ============================================================ */

// Each study theme has:
//   id        a short unique name
//   title     what students see
//   tags      the INTERESTS ids this theme overlaps. The more of a student's
//             three topics a theme covers, the higher it ranks.
//   lenses    survey categories this theme suits best (used to rank themes)
//   summary   a short description. The first sentence shows on the card.
//   links     one sentence per tag explaining HOW that interest connects
//   subjects  school subjects (ids from COURSES) it uses, weighted 1-3
//   threads   things to study and do: [stage, lens, "description"]
//               stage: "W" Wonder, "D" Dig In, "M" Make Something, "S" Share It
//               lens:  one of the survey category keys above. If it matches how
//                      the student likes to learn, the thread is highlighted.
//             Students can do threads in ANY order. They are never locked.
const THEMES = [
  {
    id: "ancient-egypt",
    title: "Ancient Egypt: Cats, Temples, and Pyramids",
    tags: ["egypt", "history", "cats", "animals", "architecture", "mythology", "art", "math"],
    lenses: ["writing", "engineering", "art"],
    summary: "Egyptians built pyramids and temples that still stand after 4,500 years, worshipped the cat goddess Bastet, and mummified cats by the thousands. Studying Egypt shows how animals, belief, and building worked together in one of history's longest-lasting civilizations.",
    links: {
      cats: "Cats were protected, tied to the goddess Bastet, and mummified. Why did one animal matter so much?",
      architecture: "Temples, tombs, and pyramids took geometry, ramps, and huge teams of workers. How did they plan them?",
      history: "Egypt lasted over 3,000 years. How did dynasties rise and fall along the Nile?",
      mythology: "Gods like Bastet and Anubis show how Egyptians saw animals and the afterlife.",
      art: "Hieroglyphs and tomb paintings were both writing and art.",
    },
    subjects: { history: 3, art: 2, geometry: 2, english: 1, geography: 1 },
    threads: [
      ["W", "writing", "Write five questions: why were cats so important in Egypt?"],
      ["D", "writing", "Learn who Bastet was and how cat worship worked"],
      ["D", "engineering", "Find out how the pyramids were designed and built"],
      ["D", "outdoors", "Trace how the Nile shaped where temples and cities were built"],
      ["M", "art", "Sketch a temple or write a message in hieroglyphs"],
      ["S", "people", "Explain to someone why Egyptians mummified cats"],
    ],
  },
  {
    id: "ancient-rome",
    title: "Ancient Rome: Roads, Aqueducts, and Concrete",
    tags: ["rome", "history", "architecture", "making", "math", "law"],
    lenses: ["engineering", "writing", "math"],
    summary: "Rome built roads, aqueducts, arches, and the Colosseum, and wrote laws that still influence courts today. Studying Rome connects engineering, politics, and daily life across a huge empire.",
    links: {
      architecture: "Arches, domes, and concrete let Romans build bigger than anyone before them.",
      law: "Roman ideas about citizens, contracts, and courts shaped modern legal systems.",
      making: "Aqueducts moved water with only gravity and careful measurement.",
      history: "How did one city rule so much land for so long, and why did it fall apart?",
    },
    subjects: { history: 3, geometry: 2, civics: 2, physics: 1, english: 1 },
    threads: [
      ["W", "writing", "Ask: how did one city rule so much land for so long?"],
      ["D", "engineering", "Study how aqueducts moved water using only gravity"],
      ["D", "engineering", "Learn how Roman concrete and arches held up"],
      ["D", "writing", "Read about daily life for a Roman citizen, a soldier, and a slave"],
      ["M", "engineering", "Build a model of an arch or aqueduct"],
      ["S", "people", "Debate: was Rome's empire good for the people it ruled?"],
    ],
  },
  {
    id: "ancient-greece",
    title: "Ancient Greece: Ideas, Temples, and Stories",
    tags: ["greece", "history", "architecture", "theater", "ideas", "mythology", "sports", "math"],
    lenses: ["writing", "people", "art"],
    summary: "Greeks invented theater, democracy, and philosophy, built temples like the Parthenon, and held the first Olympic Games. Their myths and math still show up in classrooms and stories today.",
    links: {
      architecture: "The Parthenon uses careful proportions so it looks perfectly straight to the eye.",
      theater: "Greek plays began as festivals and gave us comedy and tragedy.",
      sports: "The Olympics were religious festivals as well as competitions.",
      mythology: "Myths explained weather, love, and war, and still inspire books and films.",
      math: "Geometry proofs from Euclid and Pythagoras began here.",
      ideas: "Socrates and Plato asked questions people still debate.",
    },
    subjects: { history: 3, english: 2, theater: 2, geometry: 2, civics: 1 },
    threads: [
      ["W", "writing", "Ask: why did Greek city-states argue over how to govern?"],
      ["D", "writing", "Read two Greek myths and compare what each one explains"],
      ["D", "math", "Learn how Greeks used proportion in the Parthenon"],
      ["D", "people", "Explore how Athenian democracy worked and who was left out"],
      ["M", "art", "Write or act a short scene in the style of a Greek play"],
      ["S", "people", "Teach friends an Olympic event the way the Greeks played it"],
    ],
  },
  {
    id: "medieval-worlds",
    title: "Medieval Worlds: Castles, Knights, and Everyday Life",
    tags: ["medieval", "history", "architecture", "making", "books", "mythology", "games"],
    lenses: ["writing", "engineering", "people"],
    summary: "Castles, cathedrals, and trade routes defined the Middle Ages. Studying the era shows how people built defenses, told legends, and lived through plague and change.",
    links: {
      architecture: "Castle walls, moats, and cathedral vaults solved problems of defense and light.",
      mythology: "King Arthur, dragons, and sagas blend history with legend.",
      games: "Chess, tabletop strategy, and many fantasy games borrow medieval ideas.",
      books: "Chronicles, poems, and legends are how we know what people believed.",
    },
    subjects: { history: 3, english: 1, geometry: 1, art: 1, geography: 1 },
    threads: [
      ["W", "writing", "Ask: why were castles built the way they were?"],
      ["D", "engineering", "Study how castle defenses and cathedral arches worked"],
      ["D", "writing", "Compare a legend like King Arthur with what historians know"],
      ["D", "people", "Learn how markets, guilds, and farming fed a medieval town"],
      ["M", "art", "Design your own castle on paper or in a game"],
      ["S", "people", "Run a strategy game based on a real medieval siege"],
    ],
  },
  {
    id: "space-exploration",
    title: "Space: Planets, Rockets, and Big Questions",
    tags: ["space", "science", "math", "flight", "making", "film", "history"],
    lenses: ["science", "math", "engineering"],
    summary: "From telescopes to rockets, space science mixes physics, math, engineering, and stories about what is out there.",
    links: {
      flight: "Rockets and spacecraft are flight at its most extreme.",
      math: "Orbits and distances come from equations you can try yourself.",
      film: "Science fiction both reflects and inspires real space missions.",
      history: "The Space Race shows how science, politics, and teamwork collide.",
    },
    subjects: { physics: 3, algebra: 2, earth: 3, history: 1, programming: 1 },
    threads: [
      ["W", "science", "Ask: what would it take to live on another planet?"],
      ["D", "math", "Learn how orbits work and calculate one"],
      ["D", "science", "Study the planets and pick one to explore in depth"],
      ["D", "writing", "Read about a space mission and the people who made it happen"],
      ["M", "engineering", "Build a straw or paper rocket and test what makes it fly farther"],
      ["S", "people", "Present a plan for a mission to somewhere in the solar system"],
    ],
  },
  {
    id: "ocean-life",
    title: "Oceans: Life, Currents, and the Deep",
    tags: ["ocean", "animals", "science", "nature", "weather", "travel"],
    lenses: ["science", "animals", "outdoors"],
    summary: "Oceans shape weather, feed billions of people, and hide most of Earth's unexplored life. Studying them blends biology, chemistry, physics, and exploration.",
    links: {
      animals: "From plankton to whales, ocean food chains link every living thing.",
      weather: "Currents and warm water drive storms and climate.",
      travel: "Trade and exploration followed the sea.",
    },
    subjects: { biology: 3, earth: 2, chemistry: 1, geography: 1, envsci: 2 },
    threads: [
      ["W", "animals", "Ask: what lives in the deepest parts of the ocean?"],
      ["D", "science", "Learn how ocean currents move heat around the planet"],
      ["D", "animals", "Pick one sea animal and map its food chain"],
      ["D", "outdoors", "Study a local body of water and what lives in it"],
      ["M", "art", "Make a model or poster of the ocean zones from surface to seafloor"],
      ["S", "people", "Teach others one way humans affect the ocean"],
    ],
  },
  {
    id: "deep-time",
    title: "Deep Time: Dinosaurs, Fossils, and Earth's Story",
    tags: ["dinosaurs", "science", "history", "animals", "nature"],
    lenses: ["science", "outdoors", "writing"],
    summary: "Fossils are clues to worlds that vanished millions of years ago. You piece together evidence the way a detective would.",
    links: {
      dinosaurs: "Bones, tracks, and eggs let scientists rebuild animals nobody has ever seen alive.",
      history: "Deep time stretches far past written records.",
      animals: "Birds are living descendants of dinosaurs.",
    },
    subjects: { biology: 3, earth: 3, history: 1, chemistry: 1 },
    threads: [
      ["W", "science", "Ask: how do we know what dinosaurs looked like?"],
      ["D", "science", "Learn how fossils form and how scientists date them"],
      ["D", "animals", "Compare a dinosaur with its closest living relatives"],
      ["D", "outdoors", "Find out what rocks and fossils exist near where you live"],
      ["M", "art", "Build a mock fossil dig or draw a scientifically accurate dinosaur"],
      ["S", "people", "Present your best theory for why the dinosaurs went extinct"],
    ],
  },
  {
    id: "weather-climate",
    title: "Weather and Climate: Storms, Patterns, and Change",
    tags: ["weather", "science", "math", "nature", "travel", "ocean"],
    lenses: ["science", "math", "outdoors"],
    summary: "Weather is physics happening above your head, and climate is its long-term pattern. Studying it mixes data, maps, and real predictions.",
    links: {
      math: "Forecasts are built from data and probability.",
      nature: "Plants, rivers, and animals respond to weather and seasons.",
      ocean: "Warm water feeds hurricanes and shapes whole climates.",
    },
    subjects: { earth: 3, physics: 2, algebra: 1, stats: 2, geography: 1, envsci: 2 },
    threads: [
      ["W", "science", "Ask: why does your area get the weather it does?"],
      ["D", "science", "Learn how storms form: clouds, fronts, and pressure"],
      ["D", "math", "Track the weather for two weeks and graph what you see"],
      ["D", "outdoors", "Build a simple weather station or rain gauge"],
      ["M", "tech", "Make a forecast and check how close you were"],
      ["S", "people", "Explain a past storm or climate trend to others"],
    ],
  },
  {
    id: "animal-minds",
    title: "How Animals Think, Talk, and Live",
    tags: ["animals", "cats", "dogs", "psychology", "science", "nature"],
    lenses: ["animals", "science", "people"],
    summary: "Cats purr, dogs read faces, and crows solve puzzles. This theme asks how different animals sense the world, communicate, and learn.",
    links: {
      cats: "Cats communicate with their tails, ears, and purrs.",
      dogs: "Dogs have lived with humans for thousands of years and read our signals.",
      psychology: "Animal behavior research asks the same questions as human psychology.",
    },
    subjects: { biology: 3, psychology: 2, stats: 1, english: 1 },
    threads: [
      ["W", "animals", "Ask: how do different animals understand the world?"],
      ["D", "animals", "Learn how one animal communicates (try cats or dogs)"],
      ["D", "science", "Study how scientists test animal intelligence"],
      ["D", "outdoors", "Watch an animal near you for 30 minutes and take notes"],
      ["M", "engineering", "Design a safe puzzle toy for a pet or local animal (ask an adult first)"],
      ["S", "people", "Share a short guide to reading an animal's body language"],
    ],
  },
  {
    id: "cats-story",
    title: "Cats: From Wild Hunters to Household Companions",
    tags: ["cats", "animals", "history", "science", "psychology", "art"],
    lenses: ["animals", "writing", "science"],
    summary: "Cats chose to live near people roughly 10,000 years ago. Study how that happened, what makes cats different from dogs, and how they show up in art and stories.",
    links: {
      history: "Grain stores attracted mice, and mice attracted cats, so cats and farmers began living near each other.",
      art: "Cats appear in paintings, myths, and memes across many cultures.",
      science: "Cat genes, senses, and hunting show how evolution shaped them.",
      psychology: "Why do cats knead, purr, and ignore you on purpose?",
    },
    subjects: { biology: 3, history: 2, art: 1, psychology: 1, english: 1 },
    threads: [
      ["W", "animals", "Ask: why did cats become pets when so many wild animals didn't?"],
      ["D", "science", "Learn about cat senses, genes, and the family of big cats"],
      ["D", "writing", "Trace how cats appear in art and stories across cultures"],
      ["D", "animals", "Visit or volunteer at a shelter to see cat behavior up close"],
      ["M", "art", "Create a comic, painting, or story about a cat from history"],
      ["S", "people", "Present the story of how cats joined human homes"],
    ],
  },
  {
    id: "game-design",
    title: "Game Design: Rules, Worlds, and Play",
    tags: ["games", "coding", "art", "music", "books", "making", "psychology", "math"],
    lenses: ["tech", "art", "independent"],
    summary: "Every game is a system of rules wrapped in a story. Designing one uses math, art, music, writing, and psychology at the same time.",
    links: {
      coding: "Even a simple game needs logic, loops, and testing.",
      psychology: "Designers study what makes play feel fair, fun, and rewarding.",
      books: "Game worlds are built with stories, characters, and lore.",
      music: "Sound and music set the mood for every level.",
      math: "Balancing a game means working with odds and numbers.",
    },
    subjects: { programming: 3, art: 2, music: 1, english: 1, algebra: 1, psychology: 1 },
    threads: [
      ["W", "tech", "Ask: what makes a game fun to play again and again?"],
      ["D", "math", "Study the rules and odds of a favorite board or video game"],
      ["D", "tech", "Learn the basics of making a simple game (Scratch or similar)"],
      ["D", "art", "Study how art and sound set a game's mood"],
      ["M", "art", "Design and playtest a paper game with friends"],
      ["S", "people", "Run a playtest and collect feedback"],
    ],
  },
  {
    id: "storytelling",
    title: "Storytelling: Film, Books, and Theater",
    tags: ["film", "books", "theater", "art", "music", "psychology", "photography"],
    lenses: ["writing", "art", "people"],
    summary: "Stories move people through words, images, and sound. This theme studies how storytellers build suspense, characters, and meaning.",
    links: {
      film: "Camera angles, editing, and sound shape how you feel in a scene.",
      books: "Plot structure, voice, and character are the toolkit for any story.",
      music: "Soundtracks tell you what to feel before a character says a word.",
      theater: "A live audience changes how a story is told.",
    },
    subjects: { english: 3, theater: 2, art: 2, music: 1, psychology: 1 },
    threads: [
      ["W", "writing", "Ask: why does one story stay with you for years?"],
      ["D", "writing", "Break down the structure of a favorite book or film"],
      ["D", "art", "Study how camera angles, color, and sound set the mood"],
      ["D", "people", "Interview someone who loves a story as much as you do"],
      ["M", "writing", "Write or film a short scene with a clear beginning, middle, and end"],
      ["S", "people", "Share your piece with an audience and gather reactions"],
    ],
  },
  {
    id: "music-world",
    title: "Music: Sound, Math, and Culture",
    tags: ["music", "math", "science", "history", "making", "theater"],
    lenses: ["art", "math", "science"],
    summary: "Music is vibration, pattern, and feeling all at once. This theme explores how instruments work, why scales sound the way they do, and how music tells the story of a time.",
    links: {
      math: "Rhythm is fractions, and scales are ratios.",
      science: "Sound is vibration, and every instrument shapes it differently.",
      history: "Each era's music shows how people lived and what they cared about.",
    },
    subjects: { music: 3, physics: 2, algebra: 1, history: 1 },
    threads: [
      ["W", "art", "Ask: why do some sounds feel happy and others sad?"],
      ["D", "math", "Learn how rhythm and scales connect to fractions and ratios"],
      ["D", "science", "Explore how sound waves and instruments work"],
      ["D", "writing", "Trace a style of music back through its history"],
      ["M", "art", "Compose or remix a short piece using what you learned"],
      ["S", "people", "Perform or share your music with an audience"],
    ],
  },
  {
    id: "architecture-design",
    title: "Architecture and Design: How Spaces Shape Us",
    tags: ["architecture", "art", "math", "making", "history", "nature", "psychology"],
    lenses: ["art", "engineering", "math"],
    summary: "Buildings are art you can walk through. Studying architecture connects geometry, history, materials, and how people feel inside a space.",
    links: {
      nature: "Designers borrow shapes and cooling ideas from plants and animals.",
      history: "Styles from gothic to modern show what each era valued.",
      psychology: "Light, ceiling height, and layout change how people feel.",
      math: "Geometry and scale drawings turn ideas into floor plans.",
    },
    subjects: { geometry: 3, art: 3, history: 1, physics: 1, cad: 2 },
    threads: [
      ["W", "art", "Ask: what makes a building feel welcoming or intimidating?"],
      ["D", "writing", "Compare two architectural styles from different eras"],
      ["D", "math", "Learn how geometry and scale drawings are used in floor plans"],
      ["D", "outdoors", "Walk around town sketching three different buildings"],
      ["M", "engineering", "Design and build a model of a home or public space"],
      ["S", "people", "Present your design and explain who it is for"],
    ],
  },
  {
    id: "inventing-robotics",
    title: "Inventing and Robotics: Making Machines Work",
    tags: ["making", "coding", "math", "science", "flight", "cars"],
    lenses: ["engineering", "tech", "science"],
    summary: "Robots, drones, and gadgets combine circuits, code, and mechanical design. You learn by building, testing, and fixing what breaks.",
    links: {
      coding: "Code tells the hardware what to do, so every robot needs both.",
      math: "Gears, sensors, and motion all have numbers behind them.",
      flight: "Drones mix motors, sensors, and aerodynamics.",
    },
    subjects: { programming: 2, circuits: 3, physics: 2, algebra: 1, cad: 2, shop: 1 },
    threads: [
      ["W", "engineering", "Ask: what problem around you could a simple machine solve?"],
      ["D", "science", "Learn how circuits and sensors work"],
      ["D", "tech", "Learn the basics of programming a small robot or microcontroller"],
      ["D", "engineering", "Study how gears, levers, and motors move things"],
      ["M", "engineering", "Build and test a prototype that solves a real problem"],
      ["S", "people", "Demo your invention and share what failed and what worked"],
    ],
  },
  {
    id: "cars-engines",
    title: "Cars and Engines: How Things Move",
    tags: ["cars", "making", "science", "history", "money", "sports"],
    lenses: ["engineering", "science", "business"],
    summary: "From the first engines to electric cars, vehicles show physics, design, and economics at work.",
    links: {
      history: "Cars changed where people lived, worked, and traveled.",
      money: "Fuel costs, factories, and prices explain why cars look the way they do.",
      sports: "Racing pushes engineering to its limits.",
    },
    subjects: { physics: 3, algebra: 1, shop: 2, history: 1, econ: 1 },
    threads: [
      ["W", "engineering", "Ask: how does an engine turn fuel into motion?"],
      ["D", "science", "Compare gas, hybrid, and electric motors"],
      ["D", "writing", "Trace how cars changed cities and daily life"],
      ["D", "engineering", "Visit a repair shop or watch a teardown to see parts up close"],
      ["M", "engineering", "Build a small vehicle powered by a rubber band, balloon, or motor"],
      ["S", "people", "Present what the future of transportation might look like"],
    ],
  },
  {
    id: "flight-aerodynamics",
    title: "Flight: Wings, Aerodynamics, and Exploration",
    tags: ["flight", "science", "history", "making", "math", "space"],
    lenses: ["engineering", "science", "math"],
    summary: "How does something heavier than air stay up? Study lift, drag, and the people who tried and failed on the way to flying.",
    links: {
      history: "The Wright brothers' tests show how trial and error beats guesswork.",
      space: "Rockets and planes both fight gravity.",
      math: "Wing shape and speed come down to measurement.",
    },
    subjects: { physics: 3, algebra: 1, history: 2, geometry: 1, earth: 1 },
    threads: [
      ["W", "science", "Ask: how does a plane stay in the air?"],
      ["D", "science", "Learn the four forces of flight: lift, weight, thrust, and drag"],
      ["D", "writing", "Read about early flight pioneers and their failures"],
      ["D", "math", "Measure how wing shape changes how far a paper plane glides"],
      ["M", "engineering", "Build and test paper or foam planes with different designs"],
      ["S", "people", "Share your best design and explain why it flew farthest"],
    ],
  },
  {
    id: "food-world",
    title: "Food: Science, Culture, and History",
    tags: ["food", "science", "history", "travel", "money", "medicine"],
    lenses: ["science", "people", "independent"],
    summary: "Every dish is chemistry, history, and geography on a plate.",
    links: {
      science: "Baking and cooking are controlled chemical reactions.",
      history: "Trade routes spread spices, crops, and recipes around the world.",
      medicine: "Nutrition and food safety protect health.",
      travel: "Where a food comes from says a lot about a place.",
    },
    subjects: { chemistry: 2, history: 1, health: 2, geography: 2, econ: 1 },
    threads: [
      ["W", "science", "Ask: why do some foods change so much when cooked?"],
      ["D", "science", "Learn the chemistry of baking or fermenting"],
      ["D", "writing", "Trace one food from where it began to your plate"],
      ["D", "people", "Ask a family member to teach you a recipe and its story"],
      ["M", "art", "Cook or bake something and document the process"],
      ["S", "people", "Host a tasting and explain the science and history behind it"],
    ],
  },
  {
    id: "fashion-design",
    title: "Fashion and Design: Style Across Time",
    tags: ["fashion", "art", "history", "making", "money"],
    lenses: ["art", "business", "engineering"],
    summary: "Clothes show status, technology, and rebellion in every era. Study how style changes and how a flat piece of fabric becomes something you wear.",
    links: {
      history: "Clothes show status, technology, and rebellion in every era.",
      making: "Sewing and pattern making are geometry with fabric.",
      money: "Fashion is a global business with trends and supply chains.",
    },
    subjects: { art: 3, history: 2, econ: 1, business: 1 },
    threads: [
      ["W", "art", "Ask: why do trends change, and who decides?"],
      ["D", "writing", "Trace the history of one clothing item (jeans, sneakers, and so on)"],
      ["D", "math", "Learn how patterns are measured and cut from flat fabric"],
      ["D", "people", "Study how clothing is made and sold around the world"],
      ["M", "art", "Design or upcycle a clothing item"],
      ["S", "people", "Present a mini fashion show or lookbook"],
    ],
  },
  {
    id: "sports-science",
    title: "Sports Science: Bodies, Data, and Strategy",
    tags: ["sports", "science", "math", "medicine", "psychology", "history"],
    lenses: ["science", "math", "people"],
    summary: "Athletes are experiments in biology, physics, and psychology. Study how bodies perform, how data changes strategy, and why the mind matters as much as the muscles.",
    links: {
      math: "Stats and analytics change how teams play and scout.",
      medicine: "Training, recovery, and injury prevention rely on anatomy.",
      psychology: "Focus, pressure, and teamwork matter as much as strength.",
    },
    subjects: { biology: 2, physics: 2, stats: 3, health: 2, psychology: 1 },
    threads: [
      ["W", "science", "Ask: what separates a good athlete from a great one?"],
      ["D", "science", "Learn how muscles, energy, and recovery work"],
      ["D", "math", "Collect stats from a sport you love and look for patterns"],
      ["D", "people", "Interview a coach or athlete about training and mindset"],
      ["M", "tech", "Design a training plan or a stats chart for a team"],
      ["S", "people", "Present a data-backed strategy tip"],
    ],
  },
  {
    id: "body-medicine",
    title: "The Human Body and Medicine",
    tags: ["medicine", "science", "psychology", "history", "animals"],
    lenses: ["healthcare", "science", "people"],
    summary: "How does a body heal? Study anatomy, disease, and how medicine advanced from guesswork to science.",
    links: {
      history: "Vaccines, germ theory, and anesthesia changed what humans could survive.",
      animals: "Veterinary and animal research overlap with human health.",
      psychology: "Mind and body affect each other more than people once thought.",
    },
    subjects: { biology: 3, anatomy: 3, health: 3, chemistry: 1, history: 1 },
    threads: [
      ["W", "healthcare", "Ask: how does your body fight off sickness?"],
      ["D", "science", "Learn how one body system works (heart, brain, or lungs)"],
      ["D", "writing", "Read about a medical breakthrough and the people behind it"],
      ["D", "people", "Learn basic first aid from a trusted class or source"],
      ["M", "art", "Create a labeled diagram or model of a body system"],
      ["S", "people", "Teach others one healthy habit and the science behind it"],
    ],
  },
  {
    id: "minds-ideas",
    title: "Minds and Ideas: Psychology and Philosophy",
    tags: ["psychology", "ideas", "books", "medicine", "film"],
    lenses: ["people", "writing", "independent"],
    summary: "Why do we dream, forget, and change our minds? Psychology studies how people think, and philosophy asks what is true and what is right.",
    links: {
      ideas: "Philosophers ask what is real, what is right, and what is worth believing.",
      film: "Stories often explore memory, identity, and choice.",
      books: "Novels let you live inside someone else's mind.",
    },
    subjects: { psychology: 3, english: 2, history: 1, stats: 1 },
    threads: [
      ["W", "independent", "Ask: why do we dream, forget, or change our minds?"],
      ["D", "science", "Learn about a famous psychology experiment and what it showed"],
      ["D", "writing", "Read a short piece of philosophy and respond to it"],
      ["D", "people", "Run a small, friendly survey about habits with friends"],
      ["M", "writing", "Write an essay or script exploring a big question"],
      ["S", "people", "Host a discussion where everyone argues a different side"],
    ],
  },
  {
    id: "myths-legends",
    title: "Myths, Legends, and Folklore",
    tags: ["mythology", "books", "history", "art", "film", "games", "animals"],
    lenses: ["writing", "art", "people"],
    summary: "Cultures everywhere tell stories about gods, heroes, and monsters. Study what those stories explained, who told them, and why they still shape books, films, and games.",
    links: {
      animals: "Animal characters like trickster foxes and sacred cats appear in cultures worldwide.",
      games: "Fantasy games borrow monsters, heroes, and quests from old myths.",
      history: "Myths show what a culture feared and hoped for.",
    },
    subjects: { english: 3, history: 2, art: 1, theater: 1 },
    threads: [
      ["W", "writing", "Ask: why do cultures everywhere tell stories about gods and monsters?"],
      ["D", "writing", "Compare a myth from two different cultures"],
      ["D", "art", "See how artists have pictured one legend over time"],
      ["D", "people", "Collect a folktale from a family member or neighbor"],
      ["M", "writing", "Write your own myth to explain something in nature"],
      ["S", "people", "Tell your story aloud, or turn it into a comic"],
    ],
  },
  {
    id: "languages-cultures",
    title: "Languages and Cultures Around the World",
    tags: ["languages", "travel", "history", "books", "food", "music"],
    lenses: ["people", "writing", "independent"],
    summary: "Every language is a different way of seeing the world. Study how languages spread, change, and carry culture in their words, foods, and songs.",
    links: {
      history: "Languages spread through trade, conquest, and migration.",
      food: "Food words travel with recipes and people.",
      music: "Songs are one of the easiest ways into a new language.",
    },
    subjects: { languages: 3, geography: 2, history: 2, english: 1 },
    threads: [
      ["W", "people", "Ask: why do some words look similar across languages?"],
      ["D", "writing", "Trace how one word traveled from one language to another"],
      ["D", "people", "Learn greetings and a song in a new language"],
      ["D", "outdoors", "Map where a language is spoken and why"],
      ["M", "art", "Make a mini phrasebook or comic in a language you are learning"],
      ["S", "people", "Teach a friend ten useful phrases"],
    ],
  },
  {
    id: "money-business",
    title: "Money, Business, and Choices",
    tags: ["money", "math", "law", "history", "coding", "psychology"],
    lenses: ["business", "math", "people"],
    summary: "Why is one thing worth more than another? Study how money, markets, and businesses work, and how people actually make choices about them.",
    links: {
      psychology: "Why we spend, save, and follow trends is partly psychology.",
      history: "Trade, banks, and markets shaped nations.",
      math: "Interest, budgets, and profit are all arithmetic you can use right away.",
    },
    subjects: { econ: 3, business: 3, algebra: 2, accounting: 2, civics: 1 },
    threads: [
      ["W", "business", "Ask: what makes something worth more than something else?"],
      ["D", "math", "Learn how interest, savings, and budgeting work"],
      ["D", "writing", "Study a famous business success or failure"],
      ["D", "people", "Interview a local business owner about how they started"],
      ["M", "business", "Create a mini business plan for something you would love to sell"],
      ["S", "people", "Pitch your idea in two minutes"],
    ],
  },
  {
    id: "law-government",
    title: "Law, Government, and Justice",
    tags: ["law", "history", "ideas", "books", "money"],
    lenses: ["writing", "people", "independent"],
    summary: "Who decides what is fair, and how? Study how laws are made, how courts work, and how rights have changed over time.",
    links: {
      ideas: "Rights and fairness are debated by philosophers and courts.",
      history: "Constitutions and court cases show how rules change.",
      money: "Taxes, contracts, and business rules are all law.",
    },
    subjects: { civics: 3, history: 2, english: 2, speech: 1 },
    threads: [
      ["W", "writing", "Ask: who decides what is fair, and how?"],
      ["D", "writing", "Read a landmark court case in plain language"],
      ["D", "people", "Learn how your local government makes a decision"],
      ["D", "people", "Watch a public meeting or a mock trial"],
      ["M", "writing", "Write an argument for or against a rule you care about"],
      ["S", "people", "Hold a mock trial or debate with friends"],
    ],
  },
  {
    id: "nature-ecosystems",
    title: "Nature and Ecosystems",
    tags: ["nature", "science", "animals", "weather", "food", "ocean"],
    lenses: ["outdoors", "science", "animals"],
    summary: "Every living thing depends on others. Study how ecosystems work, how plants and animals fit together, and how to see the nature around you more clearly.",
    links: {
      food: "Every meal depends on soil, pollinators, and water.",
      animals: "Ecosystems are webs where each animal depends on others.",
      weather: "Seasons and storms decide when plants grow and animals move.",
    },
    subjects: { biology: 3, envsci: 3, earth: 1, chemistry: 1 },
    threads: [
      ["W", "outdoors", "Ask: what lives within a five-minute walk of home?"],
      ["D", "science", "Learn how a food web works in one ecosystem"],
      ["D", "outdoors", "Identify ten local plants or animals and keep a nature journal"],
      ["D", "science", "Study how a local plant or animal depends on weather and seasons"],
      ["M", "outdoors", "Plan a small garden or habitat for pollinators"],
      ["S", "people", "Share your journal or lead a short nature walk"],
    ],
  },
  {
    id: "photo-storytelling",
    title: "Photography and Visual Storytelling",
    tags: ["photography", "art", "film", "travel", "nature", "books"],
    lenses: ["art", "tech", "outdoors"],
    summary: "A photograph can say more than a page of writing. Study light, composition, and how images tell stories about people and places.",
    links: {
      nature: "Wildlife and landscape photography teach patience and a feel for light.",
      travel: "Photos show places and people the viewer has never met.",
      film: "Movies are photographs in motion, so the same rules of light and framing apply.",
    },
    subjects: { art: 3, physics: 1, english: 1, programming: 1 },
    threads: [
      ["W", "art", "Ask: what makes one photograph unforgettable?"],
      ["D", "art", "Learn composition: light, framing, and the rule of thirds"],
      ["D", "science", "Learn how a camera turns light into an image"],
      ["D", "writing", "Study a famous photo and the story behind it"],
      ["M", "art", "Shoot a photo essay on one theme"],
      ["S", "people", "Display your best photos with short captions"],
    ],
  },
  {
    id: "code-ai",
    title: "Code and AI: How Computers Think",
    tags: ["coding", "math", "ideas", "law", "art", "making"],
    lenses: ["tech", "math", "independent"],
    summary: "Computers follow instructions exactly, which is both their power and their weakness. Study how programs and AI work, what they can do, and the questions they raise.",
    links: {
      ideas: "AI raises questions about fairness, jobs, and what counts as thinking.",
      art: "Code can create images, music, and games.",
      law: "Privacy and online safety depend on both technology and rules.",
    },
    subjects: { programming: 3, algebra: 2, linalg: 1, stats: 1, english: 1 },
    threads: [
      ["W", "tech", "Ask: what can computers do that people cannot, and the other way around?"],
      ["D", "tech", "Learn the basics of a programming language through small projects"],
      ["D", "math", "Explore how a simple algorithm sorts or searches data"],
      ["D", "writing", "Read about how AI is trained and where it goes wrong"],
      ["M", "tech", "Build a small app, site, or program that solves a real problem"],
      ["S", "people", "Show your project and explain how it works"],
    ],
  },
  {
    id: "math-puzzles",
    title: "Math in Puzzles, Patterns, and Codes",
    tags: ["math", "games", "ideas", "coding", "history", "art"],
    lenses: ["math", "independent", "science"],
    summary: "Math is the study of patterns, and patterns are everywhere: in games, secret codes, music, and art. Follow them to see why math keeps turning up.",
    links: {
      games: "Chess, sudoku, and strategy games are logic puzzles in disguise.",
      history: "Secret codes shaped wars and led to the invention of computers.",
      art: "Tilings, fractals, and symmetry make math visible.",
    },
    subjects: { algebra: 3, geometry: 2, stats: 1, history: 1, linalg: 1 },
    threads: [
      ["W", "math", "Ask: why do patterns show up everywhere in nature and art?"],
      ["D", "math", "Learn how a classic code or cipher works, then crack one"],
      ["D", "writing", "Study a mathematician and the problem they solved"],
      ["D", "math", "Explore probability by testing dice, cards, or coin flips"],
      ["M", "art", "Create art using symmetry, tilings, or fractals"],
      ["S", "people", "Challenge friends with a puzzle you designed"],
    ],
  },
];

// The four stages every thread belongs to. These make up the learning path
// shown on a theme page. They are suggestions, not steps: students can start
// anywhere.
const THREAD_STAGES = [
  { key: "W", title: "Wonder",         blurb: "Ask questions" },
  { key: "D", title: "Dig In",         blurb: "Learn and explore" },
  { key: "M", title: "Make Something", blurb: "Create to understand" },
  { key: "S", title: "Share It",       blurb: "Teach and show others" },
];


/* ============================================================
   4. COURSES: school subjects used by course ratings and the skills web
   ============================================================ */

// "group" keeps related subjects together on the web.
const COURSES = [
  { id: "algebra",     name: "Algebra",                group: "Math" },
  { id: "geometry",    name: "Geometry",               group: "Math" },
  { id: "precalc",     name: "Pre-Calculus",           group: "Math" },
  { id: "calculus",    name: "Calculus",               group: "Math" },
  { id: "diffeq",      name: "Differential Equations", group: "Math" },
  { id: "linalg",      name: "Linear Algebra",         group: "Math" },
  { id: "stats",       name: "Statistics",             group: "Math" },
  { id: "physics",     name: "Physics",                group: "Science" },
  { id: "chemistry",   name: "Chemistry",              group: "Science" },
  { id: "biology",     name: "Biology",                group: "Science" },
  { id: "envsci",      name: "Environmental Science",  group: "Science" },
  { id: "earth",       name: "Earth & Space Science",  group: "Science" },
  { id: "anatomy",     name: "Anatomy & Physiology",   group: "Health" },
  { id: "health",      name: "Health Sciences",        group: "Health" },
  { id: "programming", name: "Programming",            group: "Tech & Trades" },
  { id: "cad",         name: "CAD & Drafting",         group: "Tech & Trades" },
  { id: "circuits",    name: "Electronics & Circuits", group: "Tech & Trades" },
  { id: "shop",        name: "Shop & Trades",          group: "Tech & Trades" },
  { id: "business",    name: "Business & Marketing",   group: "Business" },
  { id: "accounting",  name: "Accounting & Finance",   group: "Business" },
  { id: "econ",        name: "Economics",              group: "Business" },
  { id: "english",     name: "English & Writing",      group: "Communication" },
  { id: "speech",      name: "Speech & Communication", group: "Communication" },
  { id: "psychology",  name: "Psychology",             group: "Communication" },
  { id: "history",     name: "History",                group: "Humanities" },
  { id: "geography",   name: "Geography & Cultures",   group: "Humanities" },
  { id: "languages",   name: "World Languages",        group: "Humanities" },
  { id: "civics",      name: "Government & Law",       group: "Humanities" },
  { id: "art",         name: "Art & Design",           group: "Arts" },
  { id: "music",       name: "Music",                  group: "Arts" },
  { id: "theater",     name: "Theater & Film",         group: "Arts" },
];

// Which subjects build on or relate to each other. Every pair becomes a line
// on the skills web. Add or remove pairs freely, using ids from COURSES.
const COURSE_LINKS = [
  ["algebra", "geometry"], ["algebra", "precalc"], ["algebra", "stats"], ["algebra", "accounting"],
  ["geometry", "precalc"], ["geometry", "cad"], ["geometry", "art"],
  ["precalc", "calculus"], ["calculus", "diffeq"], ["calculus", "linalg"], ["calculus", "physics"],
  ["linalg", "diffeq"], ["linalg", "programming"],
  ["physics", "chemistry"], ["physics", "circuits"], ["physics", "cad"], ["physics", "earth"],
  ["chemistry", "biology"], ["chemistry", "envsci"], ["chemistry", "earth"], ["biology", "envsci"], ["biology", "anatomy"],
  ["earth", "envsci"], ["earth", "geography"],
  ["anatomy", "health"], ["health", "psychology"],
  ["stats", "econ"], ["stats", "psychology"], ["stats", "programming"],
  ["programming", "circuits"], ["circuits", "shop"], ["shop", "cad"], ["art", "cad"],
  ["business", "accounting"], ["business", "econ"], ["accounting", "econ"], ["business", "speech"], ["business", "art"],
  ["english", "speech"], ["speech", "psychology"],
  ["history", "geography"], ["history", "civics"], ["history", "english"], ["history", "art"], ["history", "languages"],
  ["geography", "languages"], ["civics", "econ"], ["civics", "speech"], ["languages", "english"],
  ["music", "art"], ["music", "algebra"], ["music", "theater"], ["theater", "english"], ["theater", "speech"],
];

// Weights for how much each subject matters per theme are stored on the
// themes themselves (the "subjects" field above): 3 = core, 2 = important,
// 1 = helpful. They are rough estimates meant to be edited.
const IMPORTANCE_LABELS = { 3: "Core", 2: "Important", 1: "Helpful" };


/* ============================================================
   5. OPPORTUNITIES: places to keep learning near the student
   ============================================================ */

// This is a simple lookup keyed by region. To connect a real database or API
// later, replace getOpportunities() below so it returns the same shape:
//   { key: "...", list: [{ label, name, desc }, ...] }
const OPPORTUNITIES_BY_REGION = {
  "stillwater-ok": [
    { label: "University", name: "Oklahoma State University", desc: "Public lectures, museums, and events open to the community, plus summer camps and open houses." },
    { label: "Library", name: "Stillwater Public Library", desc: "Books, research help, and programs on a huge range of topics." },
    { label: "History", name: "Sheerar Museum of Stillwater History", desc: "Local history exhibits and archives." },
    { label: "Art", name: "OSU Museum of Art", desc: "Changing exhibits and tours for students and families." },
    { label: "CareerTech", name: "Meridian Technology Center", desc: "Oklahoma CareerTech programs with hands-on courses in building, tech, health, and design." },
    { label: "Clubs", name: "School and community clubs", desc: "Robotics, history, art, 4-H, FFA, and other groups where you can learn alongside others." },
  ],
  "oklahoma-general": [
    { label: "University", name: "Oklahoma public universities", desc: "Many offer open houses, lectures, museums, and summer programs for students." },
    { label: "Library", name: "Your local public library", desc: "Free books, research help, and programs on nearly any topic." },
    { label: "History", name: "Oklahoma Historical Society", desc: "Museums and archives across the state." },
    { label: "Science", name: "Science Museum Oklahoma", desc: "Hands-on exhibits in Oklahoma City on space, nature, and engineering." },
    { label: "CareerTech", name: "Oklahoma CareerTech system", desc: "A statewide network of technology centers offering hands-on courses." },
    { label: "Clubs", name: "School and community clubs", desc: "Most schools have clubs for robotics, history, art, and more." },
  ],
  "default": [
    { label: "Library", name: "Your local public library", desc: "Free books, research help, and programs on nearly any topic." },
    { label: "Museums", name: "Nearby museums and historic sites", desc: "Many offer student programs, tours, and free days." },
    { label: "College", name: "Local community college or university", desc: "Look for open houses, public lectures, and dual-enrollment classes." },
    { label: "Clubs", name: "School and community clubs", desc: "Robotics, history, art, and other clubs where you can learn alongside others." },
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
