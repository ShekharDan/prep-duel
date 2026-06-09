/** PrepDuel content: schedules, topics, quizzes, resources */

export const SCHEDULE_BLOCKS = [
  { id: "m-p2", time: "6:30–8:00", minutes: 90, session: "morning", title: "CIL Paper II", desc: "DBMS / OS / CN / DSA / SE — see weekly rotation", track: "cil", xp: 15 },
  { id: "m-dsa", time: "8:00–8:45", minutes: 45, session: "morning", title: "DSA (Corporate)", desc: "1 LeetCode — arrays → trees → graphs", track: "corporate", xp: 15 },
  { id: "m-corp", time: "8:45–9:30", minutes: 45, session: "morning", title: "Corporate depth", desc: "Ticket Triage / Java / Amdocs — rotate", track: "corporate", xp: 15 },
  { id: "n-p1", time: "9:00–10:30", minutes: 90, session: "evening", title: "CIL Paper I", desc: "Reasoning + Quant timed sets", track: "cil", xp: 15 },
  { id: "n-eng", time: "10:30–11:15", minutes: 45, session: "evening", title: "English or GK", desc: "Alternate days — RC / grammar / current affairs", track: "cil", xp: 15 },
  { id: "n-rev", time: "11:15–12:00", minutes: 45, session: "evening", title: "Revise + explain", desc: "Notes + project story aloud", track: "both", xp: 15 },
];

/** Today tab — evening session only (after office) */
export const TODAY_BLOCKS = SCHEDULE_BLOCKS.filter((b) => b.session === "evening");

export const TOTAL_DAILY_MINUTES = SCHEDULE_BLOCKS.reduce((s, b) => s + b.minutes, 0);
export const TODAY_MINUTES = TODAY_BLOCKS.reduce((s, b) => s + b.minutes, 0);

/** Daily plan — each block links to topic IDs + concrete tasks */
export const DAY_PLANS = {
  Monday: {
    blocks: {
      "m-p2": {
        focus: "DBMS",
        topicIds: ["cil-dbms"],
        tasks: ["Normalization + SQL joins", "40 GATE-style DBMS MCQs"],
      },
      "m-dsa": {
        focus: "Two pointers & window",
        topicIds: ["corp-arr-2p"],
        tasks: ["1 LC: two sum / max subarray / sliding window"],
      },
      "m-corp": {
        focus: "Ticket Triage — big picture",
        topicIds: ["corp-triage-1"],
        tasks: ["Draw Client→Gateway→AI→Gemini", "Explain Controller/Service/DTO"],
      },
      "n-p1": {
        focus: "Reasoning",
        topicIds: ["cil-reason-syl"],
        tasks: ["30 reasoning Q timed (syllogism, series)"],
      },
      "n-eng": {
        focus: "English",
        topicIds: ["cil-eng-rc"],
        tasks: ["2 RC passages + 15 grammar Q"],
      },
      "n-rev": {
        focus: "Revise aloud",
        topicIds: ["cil-dbms", "corp-triage-1"],
        tasks: ["15 min notes + 30 sec project pitch"],
      },
    },
  },
  Tuesday: {
    blocks: {
      "m-p2": {
        focus: "Operating Systems",
        topicIds: ["cil-os"],
        tasks: ["Process/thread, deadlock, paging", "40 OS MCQs"],
      },
      "m-dsa": {
        focus: "Hash map & prefix",
        topicIds: ["corp-arr-hash"],
        tasks: ["1 LC: frequency / subarray sum k"],
      },
      "m-corp": {
        focus: "Java OOP",
        topicIds: ["corp-java-oop"],
        tasks: ["OOP 4 pillars + HashMap internals", "Run TestAnimal if needed"],
      },
      "n-p1": {
        focus: "Quant",
        topicIds: ["cil-quant-pct", "cil-quant-tsd"],
        tasks: ["20 % + ratio", "20 TSD/work Q timed"],
      },
      "n-eng": {
        focus: "English",
        topicIds: ["cil-eng-rc"],
        tasks: ["1 RC + error spotting"],
      },
      "n-rev": {
        focus: "Revise",
        topicIds: ["cil-os", "corp-java-oop"],
        tasks: ["OS flashcards + Java OOP aloud"],
      },
    },
  },
  Wednesday: {
    blocks: {
      "m-p2": {
        focus: "Computer Networks",
        topicIds: ["cil-cn"],
        tasks: ["TCP/UDP, HTTP, DNS", "30 CN MCQs"],
      },
      "m-dsa": {
        focus: "Trees intro",
        topicIds: ["corp-tree"],
        tasks: ["1 LC: max depth / level order"],
      },
      "m-corp": {
        focus: "Amdocs story",
        topicIds: ["corp-amdocs"],
        tasks: ["2 min KYC + REST/SOAP + prod debug story"],
      },
      "n-p1": {
        focus: "Reasoning puzzles",
        topicIds: ["cil-reason-puzzle"],
        tasks: ["25 puzzle + seating Q"],
      },
      "n-eng": {
        focus: "GK",
        topicIds: ["cil-gk"],
        tasks: ["15 min current affairs + 20 static GK Q"],
      },
      "n-rev": {
        focus: "Revise",
        topicIds: ["cil-cn", "corp-amdocs"],
        tasks: ["CN summary + Amdocs aloud"],
      },
    },
  },
  Thursday: {
    blocks: {
      "m-p2": {
        focus: "DSA MCQ (CIL)",
        topicIds: ["cil-dsa-mcq"],
        tasks: ["Big-O, stack/queue, tree/graph theory MCQs"],
      },
      "m-dsa": {
        focus: "Trees",
        topicIds: ["corp-tree"],
        tasks: ["1 LC: BFS/DFS or validate BST"],
      },
      "m-corp": {
        focus: "Ticket Triage — Service + Gemini",
        topicIds: ["corp-triage-1"],
        tasks: ["Trace TriageService + parse errors", "Quiz: corp-project"],
      },
      "n-p1": {
        focus: "Quant + Reasoning mix",
        topicIds: ["cil-quant-tsd", "cil-reason-syl"],
        tasks: ["15 quant + 15 reasoning timed"],
      },
      "n-eng": {
        focus: "English",
        topicIds: ["cil-eng-rc"],
        tasks: ["Cloze test + vocab"],
      },
      "n-rev": {
        focus: "Revise",
        topicIds: ["cil-dsa-mcq"],
        tasks: ["Weak DSA MCQ topics"],
      },
    },
  },
  Friday: {
    blocks: {
      "m-p2": {
        focus: "Software Eng + C MCQ",
        topicIds: ["cil-c"],
        tasks: ["SDLC, testing types", "20 C output MCQs"],
      },
      "m-dsa": {
        focus: "Graphs basics",
        topicIds: ["corp-graph"],
        tasks: ["1 LC: islands / grid BFS"],
      },
      "m-corp": {
        focus: "Spring + Docker",
        topicIds: ["corp-spring", "corp-triage-2"],
        tasks: ["Read docker-compose.yml", "Explain gateway + WebClient"],
      },
      "n-p1": {
        focus: "Mixed Paper I",
        topicIds: ["cil-quant-pct", "cil-reason-puzzle", "cil-eng-rc"],
        tasks: ["50 Q mixed timed (mini mock)"],
      },
      "n-eng": {
        focus: "English",
        topicIds: ["cil-eng-rc"],
        tasks: ["Para jumbles + grammar"],
      },
      "n-rev": {
        focus: "Revise",
        topicIds: ["corp-spring", "corp-triage-2"],
        tasks: ["Full microservices story aloud"],
      },
    },
  },
  Saturday: {
    blocks: {
      "m-p2": {
        focus: "Half mock Paper II",
        topicIds: ["cil-dbms", "cil-os", "cil-cn", "cil-dsa-mcq"],
        tasks: ["50 Q Paper II timed — log score in Week tab"],
      },
      "m-dsa": {
        focus: "Weekly DSA review",
        topicIds: ["corp-arr-2p", "corp-arr-hash", "corp-tree"],
        tasks: ["Re-do 1 missed LC problem"],
      },
      "m-corp": {
        focus: "Full project walkthrough",
        topicIds: ["corp-triage-1", "corp-triage-2", "corp-amdocs"],
        tasks: ["5 min explain Ticket Triage + Amdocs without notes"],
      },
      "n-p1": {
        focus: "Half mock Paper I",
        topicIds: ["cil-reason-syl", "cil-quant-pct", "cil-eng-rc"],
        tasks: ["50 Q Paper I timed — log score"],
      },
      "n-eng": {
        focus: "GK catch-up",
        topicIds: ["cil-gk"],
        tasks: ["Weekly GK revision"],
      },
      "n-rev": {
        focus: "Mock review",
        topicIds: [],
        tasks: ["Mark weak chapters for Sunday"],
      },
    },
  },
  Sunday: {
    blocks: {
      "m-p2": {
        focus: "Weak Paper II topics",
        topicIds: [],
        tasks: ["Revise lowest-scoring subject from mocks"],
      },
      "m-dsa": {
        focus: "Light / catch-up",
        topicIds: ["corp-graph"],
        tasks: ["Optional 1 easy LC or skip if tired"],
      },
      "m-corp": {
        focus: "Rest or Instahyre",
        topicIds: ["corp-java-init"],
        tasks: ["Java class-loading order OR 15 min job portal"],
      },
      "n-p1": {
        focus: "Weak Paper I topics",
        topicIds: ["cil-reason-puzzle"],
        tasks: ["Fix weak reasoning/quant areas"],
      },
      "n-eng": {
        focus: "GK marathon",
        topicIds: ["cil-gk"],
        tasks: ["60 min GK + monthly PDF skim"],
      },
      "n-rev": {
        focus: "Week preview",
        topicIds: [],
        tasks: ["Plan next week + export backup JSON"],
      },
    },
  },
};

/** Prep cycle starts Tuesday — Monday is last (catch-up) */
export const PREP_CYCLE_DAYS = [
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Monday",
];

/** 8-week roadmap — Week 1 begins Tuesday (Monday topics moved to catch-up) */
export const ROADMAP_ORDER = [
  { week: 1, day: "Tuesday", topicId: "cil-os" },
  { week: 1, day: "Tuesday", topicId: "corp-java-oop" },
  { week: 1, day: "Tuesday", topicId: "corp-arr-hash" },
  { week: 1, day: "Tuesday", topicId: "cil-quant-pct" },
  { week: 2, day: "Wednesday", topicId: "cil-cn" },
  { week: 2, day: "Wednesday", topicId: "corp-amdocs" },
  { week: 2, day: "Wednesday", topicId: "corp-tree" },
  { week: 2, day: "Wednesday", topicId: "cil-reason-puzzle" },
  { week: 2, day: "Wednesday", topicId: "cil-gk" },
  { week: 2, day: "Thursday", topicId: "cil-dsa-mcq" },
  { week: 3, day: "Friday", topicId: "cil-c" },
  { week: 3, day: "Friday", topicId: "corp-spring" },
  { week: 3, day: "Friday", topicId: "corp-triage-2" },
  { week: 3, day: "Friday", topicId: "corp-graph" },
  { week: 4, day: "Sunday", topicId: "corp-java-init" },
  { week: 4, day: "Tuesday", topicId: "cil-quant-tsd" },
  { week: 5, day: "Monday (catch-up)", topicId: "cil-dbms" },
  { week: 5, day: "Monday (catch-up)", topicId: "corp-triage-1" },
  { week: 5, day: "Monday (catch-up)", topicId: "corp-arr-2p" },
  { week: 5, day: "Monday (catch-up)", topicId: "cil-reason-syl" },
  { week: 5, day: "Monday (catch-up)", topicId: "cil-eng-rc" },
];

export const WEEK_ROTATION = PREP_CYCLE_DAYS.map((day, i) => {
  const plan = DAY_PLANS[day];
  const label = i === 0 ? `${day} (Day 1 — start)` : i === 6 ? `${day} (catch-up)` : day;
  return {
    day,
    label,
    cycleDay: i + 1,
    p2: plan?.blocks["m-p2"]?.focus || "—",
    p1: plan?.blocks["n-p1"]?.focus || "—",
    corp: plan?.blocks["m-corp"]?.focus || "—",
  };
});

export const BADGES = [
  { id: "first-day", name: "🌅 First Blood", need: (s) => s.daysLogged >= 1 },
  { id: "streak-7", name: "🔥 Week Streak", need: (s) => s.streak >= 7 },
  { id: "xp-500", name: "⭐ Rising", need: (s) => s.xp >= 500 },
  { id: "xp-2000", name: "💎 Grinder", need: (s) => s.xp >= 2000 },
  { id: "quiz-50", name: "📝 Scholar", need: (s) => s.quizCorrect >= 50 },
  { id: "topics-10", name: "✅ Topic Hunter", need: (s) => s.topicsDone >= 10 },
  { id: "perfect-day", name: "🏆 Perfect Day", need: (s) => s.perfectDays >= 1 },
];

export const RESOURCES = [
  { track: "cil", title: "CIL MT 2026 — Official notification PDF", url: "https://www.coalindia.in", note: "Advertisement 03/2026 — exam pattern, qualifying marks" },
  { track: "cil", title: "RS Aggarwal — Quantitative Aptitude", url: "https://www.google.com/search?q=RS+Aggarwal+Quantitative+Aptitude", note: "Chapters: %, TSD, ratio, CI/SI, P&C basics" },
  { track: "cil", title: "RS Aggarwal — Verbal & Non-Verbal Reasoning", url: "https://www.google.com/search?q=RS+Aggarwal+Reasoning", note: "Syllogism, seating, puzzles, series" },
  { track: "cil", title: "SP Bakshi — Objective English", url: "https://www.google.com/search?q=SP+Bakshi+Objective+English", note: "Grammar, RC, cloze, error spotting" },
  { track: "cil", title: "AffairsCloud / Gradeup GK", url: "https://affairscloud.com", note: "Monthly CA PDF + daily quiz" },
  { track: "cil", title: "GATE CS PYQ (subject-wise)", url: "https://gateoverflow.in", note: "Paper II reference — DBMS, OS, CN, DSA" },
  { track: "cil", title: "Testbook — CIL MT System mocks", url: "https://testbook.com/cil-mt", note: "Full CBT mocks when ready" },
  { track: "cil", title: "Let Us C — Yashavant Kanetkar", url: "https://www.google.com/search?q=Let+Us+C+Kanetkar", note: "Pointers, arrays, output MCQs only" },
  { track: "corporate", title: "NeetCode 150", url: "https://neetcode.io/practice", note: "Arrays, strings, trees — corporate DSA" },
  { track: "corporate", title: "LeetCode", url: "https://leetcode.com", note: "Daily 1 problem — your ~1600 base" },
  { track: "corporate", title: "Ticket Triage — your repo", url: "https://github.com/ShekharDan", note: "Project walkthrough for interviews" },
  { track: "corporate", title: "Instahyre", url: "https://www.instahyre.com", note: "Java 1–3 yr, Pune/BLR/Hyd — passive apply" },
  { track: "corporate", title: "Cutshort", url: "https://cutshort.io", note: "Product companies, fast recruiters" },
  { track: "corporate", title: "Spring Boot docs", url: "https://docs.spring.io/spring-boot/", note: "REST, validation, exception handling" },
  { track: "both", title: "NPTEL — DBMS / OS / CN", url: "https://nptel.ac.in", note: "Revision at 1.5x for CIL Paper II" },
];

export const TOPICS = [
  { id: "cil-quant-pct", track: "cil", name: "Quant — Percentage & Ratio", must: ["Profit-loss", "SI/CI basics", "Partnership", "Mixture-alligation"], status: "empty" },
  { id: "cil-quant-tsd", track: "cil", name: "Quant — Time, Speed, Work", must: ["TSD", "Pipes & cistern", "Work efficiency"], status: "empty" },
  { id: "cil-reason-syl", track: "cil", name: "Reasoning — Syllogism & Series", must: ["Syllogism", "Number/alpha series", "Coding-decoding"], status: "empty" },
  { id: "cil-reason-puzzle", track: "cil", name: "Reasoning — Puzzles & Seating", must: ["Linear seating", "Circular seating", "Floor puzzles basic"], status: "empty" },
  { id: "cil-eng-rc", track: "cil", name: "English — RC & Grammar", must: ["2 RC/week", "Error spotting", "Cloze test"], status: "empty" },
  { id: "cil-gk", track: "cil", name: "GK — Current + Static", must: ["Last 6 months CA", "CIL/coal sector", "Schemes & awards"], status: "empty" },
  { id: "cil-dbms", track: "cil", name: "Paper II — DBMS", must: ["Keys & normalization", "SQL joins", "ACID & transactions", "Indexing"], status: "empty" },
  { id: "cil-os", track: "cil", name: "Paper II — OS", must: ["Process vs thread", "Scheduling", "Deadlock", "Paging & segmentation"], status: "empty" },
  { id: "cil-cn", track: "cil", name: "Paper II — Computer Networks", must: ["OSI vs TCP/IP", "TCP vs UDP", "HTTP/DNS", "IP & MAC basics"], status: "empty" },
  { id: "cil-dsa-mcq", track: "cil", name: "Paper II — DSA MCQ", must: ["Big-O", "Stack/queue", "Trees BST", "Graph BFS/DFS theory"], status: "empty" },
  { id: "cil-c", track: "cil", name: "Paper II — C output MCQ", must: ["Pointers basics", "Arrays & strings in C", "malloc/free concept"], status: "empty" },
  { id: "corp-arr-2p", track: "corporate", name: "DSA — Two pointers & window", must: ["Two sum", "Max subarray Kadane", "Longest substring window", "Container water"], status: "empty" },
  { id: "corp-arr-hash", track: "corporate", name: "DSA — Hash map & prefix", must: ["Frequency count", "Subarray sum k", "Group anagrams"], status: "empty" },
  { id: "corp-tree", track: "corporate", name: "DSA — Trees", must: ["BFS level order", "Max depth", "Validate BST", "Invert tree"], status: "empty" },
  { id: "corp-graph", track: "corporate", name: "DSA — Graphs basics", must: ["Grid islands BFS", "DFS visit all", "Skip Dijkstra for now"], status: "empty" },
  { id: "corp-java-oop", track: "corporate", name: "Java — OOP & Collections", must: ["4 pillars", "Override vs overload", "HashMap internals", "ArrayList vs LinkedList"], status: "empty" },
  { id: "corp-java-init", track: "corporate", name: "Java — Class loading order", must: ["Static vs instance", "Parent-child order", "Constructor override trap"], status: "empty" },
  { id: "corp-spring", track: "corporate", name: "Spring — REST layers", must: ["DI & beans", "Controller vs Service", "@Valid", "ExceptionHandler"], status: "empty" },
  { id: "corp-triage-1", track: "corporate", name: "Project — Ticket Triage flow", must: ["POST /triage JSON", "Controller→Service→Gemini", "No Entity/DAO why"], status: "empty" },
  { id: "corp-triage-2", track: "corporate", name: "Project — Gateway & Docker", must: ["Why 2 services", "WebClient role", "docker-compose ports"], status: "empty" },
  { id: "corp-amdocs", track: "corporate", name: "Amdocs — Interview story", must: ["KYC flow", "REST/SOAP", "Prod debugging", "SLA & retry"], status: "empty" },
];

export const QUIZZES = {
  "cil-dbms": {
    title: "CIL — DBMS (10 Q)",
    track: "cil",
    questions: [
      { q: "Which normal form removes partial dependency?", opts: ["1NF", "2NF", "3NF", "BCNF"], a: 1 },
      { q: "ACID stands for — which is NOT part of it?", opts: ["Atomicity", "Consistency", "Isolation", "Parallelism"], a: 3 },
      { q: "Primary key must be:", opts: ["Nullable", "Unique only", "Unique + not null", "Foreign"], a: 2 },
      { q: "Which join returns all rows from both tables with NULLs?", opts: ["INNER", "LEFT", "RIGHT", "FULL OUTER"], a: 3 },
      { q: "Dirty read happens when:", opts: ["Transaction commits early", "Read uncommitted data", "Index missing", "Deadlock"], a: 1 },
      { q: "B+ trees are commonly used for:", opts: ["Sorting", "Indexing in DB", "Hashing passwords", "Graph traversal"], a: 1 },
      { q: "Foreign key enforces:", opts: ["Referential integrity", "Normalization", "Indexing", "Sharding"], a: 0 },
      { q: "3NF removes:", opts: ["Repeating groups", "Partial dependency", "Transitive dependency", "Multi-valued dependency"], a: 2 },
      { q: "ROLLBACK is used to:", opts: ["Save changes", "Undo transaction", "Lock table forever", "Create index"], a: 1 },
      { q: "Candidate key is:", opts: ["Minimal superkey", "Only primary key", "Always composite", "Same as foreign key"], a: 0 },
    ],
  },
  "cil-os": {
    title: "CIL — OS (10 Q)",
    track: "cil",
    questions: [
      { q: "Which is NOT a process state?", opts: ["Ready", "Running", "Blocked", "Compiled"], a: 3 },
      { q: "Deadlock needs:", opts: ["Mutual exclusion", "Hold & wait", "No preemption", "All of these"], a: 3 },
      { q: "Paging is used for:", opts: ["Memory management", "CPU scheduling", "Disk formatting", "Networking"], a: 0 },
      { q: "Semaphore is used for:", opts: ["Synchronization", "Compilation", "Encryption", "Backup"], a: 0 },
      { q: "Round Robin is:", opts: ["CPU scheduling", "Page replacement", "Disk scheduling", "Deadlock detection"], a: 0 },
      { q: "Thrashing occurs when:", opts: ["Too much paging", "CPU idle", "No deadlock", "Cache hit high"], a: 0 },
      { q: "Thread shares with same process:", opts: ["Address space", "Stack", "Registers", "Program counter"], a: 0 },
      { q: "Banker's algorithm is for:", opts: ["Deadlock avoidance", "Memory allocation", "File indexing", "Scheduling"], a: 0 },
      { q: "Context switch involves:", opts: ["Save/restore process state", "Format disk", "Compile code", "DNS lookup"], a: 0 },
      { q: "Virtual memory allows:", opts: ["Running larger programs than RAM", "Faster CPU", "No paging", "More threads only"], a: 0 },
    ],
  },
  "cil-reason": {
    title: "CIL — Reasoning (8 Q)",
    track: "cil",
    questions: [
      { q: "All cats are animals. Some animals are dogs. Conclusion?", opts: ["Some cats are dogs", "No cats are dogs", "Cannot determine", "All dogs are cats"], a: 2 },
      { q: "Series: 2, 6, 12, 20, ?", opts: ["28", "30", "32", "24"], a: 1 },
      { q: "If A@B means A is brother of B, A#B means mother of B — A#B@C means?", opts: ["A is uncle of C", "A is mother of C's brother", "A is grandmother", "Cannot say"], a: 1 },
      { q: "Odd one out:", opts: ["Square", "Triangle", "Circle", "Cube"], a: 3 },
      { q: "5 people in row. A left of B, C right of B — who is middle?", opts: ["A", "B", "C", "Depends"], a: 1 },
      { q: "Mirror of CLOCK is?", opts: ["KCOLC", "CLOKC", "KCOLC reversed", "Same"], a: 0 },
      { q: "If today is Monday, day after 61 days?", opts: ["Saturday", "Sunday", "Friday", "Wednesday"], a: 0 },
      { q: "Blood: A is father of B, B is mother of C — A is ___ of C", opts: ["Grandfather", "Uncle", "Brother", "Son"], a: 0 },
    ],
  },
  "cil-quant": {
    title: "CIL — Quant (8 Q)",
    track: "cil",
    questions: [
      { q: "20% of 150 is:", opts: ["25", "30", "35", "40"], a: 1 },
      { q: "A does work in 10 days, B in 15. Together?", opts: ["5 days", "6 days", "7 days", "8 days"], a: 1 },
      { q: "SI on 1000 at 10% for 2 years:", opts: ["100", "200", "210", "220"], a: 1 },
      { q: "Speed 60 km/h for 2.5 hr — distance?", opts: ["120", "130", "150", "160"], a: 2 },
      { q: "Ratio 3:5, sum 40 — larger part?", opts: ["15", "20", "25", "30"], a: 2 },
      { q: "Average of 10,20,30,40:", opts: ["20", "25", "30", "35"], a: 1 },
      { q: "25% increase then 25% decrease on 100:", opts: ["100", "93.75", "96", "97.5"], a: 1 },
      { q: "3^4 = ?", opts: ["27", "64", "81", "12"], a: 2 },
    ],
  },
  "corp-java": {
    title: "Corporate — Java (10 Q)",
    track: "corporate",
    questions: [
      { q: "Which is NOT OOP pillar?", opts: ["Encapsulation", "Inheritance", "Compilation", "Polymorphism"], a: 2 },
      { q: "Interface can extend:", opts: ["Only class", "Multiple interfaces", "Multiple classes", "Nothing"], a: 1 },
      { q: "HashMap allows:", opts: ["One null key", "No null keys", "Sorted order", "Only primitives"], a: 0 },
      { q: "static block runs:", opts: ["Once per class load", "Every new object", "Never", "Only in main"], a: 0 },
      { q: "Override needs:", opts: ["Same signature + inheritance", "Same name only", "static method", "private method"], a: 0 },
      { q: "String in Java is:", opts: ["Immutable", "Mutable", "Primitive", "Thread-unsafe always"], a: 0 },
      { q: "Checked exception:", opts: ["Must handle or declare", "Always runtime", "Never thrown", "Only in main"], a: 0 },
      { q: "synchronized keyword:", opts: ["Thread mutual exclusion", "Faster loops", "Garbage collection", "Serialization"], a: 0 },
      { q: "DTO purpose:", opts: ["API data shape", "DB table row", "HTTP client", "Logging"], a: 0 },
      { q: "@Service in Spring marks:", opts: ["Business logic bean", "HTTP endpoint", "Config file", "Entity"], a: 0 },
    ],
  },
  "corp-dsa": {
    title: "Corporate — DSA (8 Q)",
    track: "corporate",
    questions: [
      { q: "Two sum uses best:", opts: ["Hash map", "Bubble sort", "Stack only", "Graph BFS"], a: 0 },
      { q: "BFS uses:", opts: ["Queue", "Stack", "Heap only", "Set only"], a: 0 },
      { q: "Max subarray (Kadane) is:", opts: ["O(n)", "O(n^2)", "O(log n)", "O(1)"], a: 0 },
      { q: "BST property:", opts: ["Left < root < right", "All nodes equal", "No children", "Circular"], a: 0 },
      { q: "Binary search needs:", opts: ["Sorted array", "Linked list", "Graph", "Hash collision"], a: 0 },
      { q: "Sliding window helps:", opts: ["Substring problems", "Tree height", "Graph cycle", "Sorting"], a: 0 },
      { q: "DFS uses:", opts: ["Stack/recursion", "Queue only", "Heap", "Priority queue only"], a: 0 },
      { q: "Big-O of binary search:", opts: ["O(log n)", "O(n)", "O(n log n)", "O(1)"], a: 0 },
    ],
  },
  "corp-project": {
    title: "Corporate — Ticket Triage (8 Q)",
    track: "corporate",
    questions: [
      { q: "Ticket Triage has DB?", opts: ["No — stateless", "Yes MySQL", "Yes Mongo", "Redis only"], a: 0 },
      { q: "Gateway port in compose:", opts: ["8080", "8081", "3000", "9090"], a: 0 },
      { q: "AI service port:", opts: ["8081", "8080", "443", "3306"], a: 0 },
      { q: "WebClient is used for:", opts: ["HTTP to another service", "SQL queries", "File upload only", "JPA"], a: 0 },
      { q: "Empty title returns:", opts: ["400", "200", "404", "301"], a: 0 },
      { q: "LLM bad JSON returns:", opts: ["502", "201", "302", "100"], a: 0 },
      { q: "Controller job:", opts: ["HTTP in/out", "Call Gemini directly", "Parse JSON from LLM", "Docker build"], a: 0 },
      { q: "DTO vs Entity:", opts: ["DTO=API shape, Entity=DB row", "Same thing", "DTO is database", "Entity is JSON only"], a: 0 },
    ],
  },
};

export const DEFAULT_ALARMS = [
  { id: "wake", label: "Wake up", time: "05:30", enabled: true },
  { id: "morning", label: "Morning study start", time: "06:30", enabled: true },
  { id: "office", label: "Leave for office", time: "10:15", enabled: true },
  { id: "evening", label: "Evening study start", time: "21:00", enabled: true },
  { id: "sleep", label: "Wind down / sleep", time: "23:30", enabled: true },
];
