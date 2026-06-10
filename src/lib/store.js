import { countRoadmapProgress } from "./roadmap.js";
import { buildPresence } from "./presence.js";
import { defaultFocusState } from "./focus.js";
import { SCHEDULE_START_DATE, SCHEDULE_VERSION } from "./data.js";

const KEY_V2 = "prepduel_v2";
const KEY_V1 = "prepduel_v1";

function newUserId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `u-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultState() {
  const weekId = getWeekId();
  return {
    profile: { name: "", partner: "" },
    roomCode: "",
    userId: newUserId(),
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    quizCorrect: 0,
    perfectDays: 0,
    daysLogged: 0,
    topicStatus: {},
    dailyLog: {},
    mocks: { paper1: [], paper2: [] },
    alarms: null,
    firedAlarms: {},
    weekXp: { [weekId]: { you: 0, partner: 0 } },
    partnerXpLocal: 0,
    lastSyncAt: null,
    prepStartDate: SCHEDULE_START_DATE,
    scheduleVersion: SCHEDULE_VERSION,
    backlogSkipped: {},
    focus: defaultFocusState(),
    colorMode: "dark",
    sessionJoined: false,
  };
}

function mergeSavedState(parsed) {
  const base = defaultState();
  const merged = {
    ...base,
    ...parsed,
    profile: { ...base.profile, ...(parsed.profile || {}) },
  };
  if (merged.scheduleVersion !== SCHEDULE_VERSION) {
    merged.prepStartDate = SCHEDULE_START_DATE;
    merged.scheduleVersion = SCHEDULE_VERSION;
  }
  if (!merged.prepStartDate) merged.prepStartDate = SCHEDULE_START_DATE;
  if (!merged.backlogSkipped) merged.backlogSkipped = {};
  if (merged.profile?.name?.trim()) merged.sessionJoined = true;
  return merged;
}

export function loadState() {
  try {
    const rawV2 = localStorage.getItem(KEY_V2);
    if (rawV2) {
      return mergeSavedState(JSON.parse(rawV2));
    }

    const rawV1 = localStorage.getItem(KEY_V1);
    if (rawV1) {
      const migrated = mergeSavedState({ ...JSON.parse(rawV1), userId: newUserId() });
      saveState(migrated);
      return migrated;
    }
    return defaultState();
  } catch {
    return defaultState();
  }
}

export function logoutSession(state) {
  if (roomUnsubscribe) {
    roomUnsubscribe();
    roomUnsubscribe = null;
  }
  const next = {
    ...state,
    profile: { name: "", partner: "" },
    roomCode: "",
    sessionJoined: false,
  };
  saveState(next);
  return next;
}

export function saveState(state) {
  localStorage.setItem(KEY_V2, JSON.stringify(state));
}

export function getWeekId() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

let firebaseDb = null;
let roomUnsubscribe = null;
let onRoomUpdate = null;

export async function initFirebase() {
  try {
    let cfg;
    try {
      cfg = await import("./firebase-config.js");
    } catch {
      cfg = await import("./firebase-config.example.js");
    }
    if (!cfg?.firebaseConfig?.apiKey || cfg.firebaseConfig.apiKey === "YOUR_API_KEY") return null;
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js");
    const {
      getFirestore,
      doc,
      setDoc,
      getDoc,
      onSnapshot,
    } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");
    const app = initializeApp(cfg.firebaseConfig);
    firebaseDb = { db: getFirestore(app), doc, setDoc, getDoc, onSnapshot };
    return firebaseDb;
  } catch {
    return null;
  }
}

function memberPayload(state) {
  const wk = getWeekId();
  const roadmap = countRoadmapProgress(state.topicStatus || {});
  const presence = buildPresence(state);
  return {
    userId: state.userId,
    xp: state.xp,
    streak: state.streak,
    weekXp: state.weekXp[wk]?.you ?? state.xp,
    roadmapPct: roadmap.pct,
    roadmapDone: roadmap.done,
    topicStatus: state.topicStatus,
    updated: presence.updated,
    online: presence.online,
    studying: presence.studying,
    focusMode: presence.focusMode,
    blockId: presence.blockId,
    blockLabel: presence.blockLabel,
    timerRemaining: presence.timerRemaining,
    timerTotal: presence.timerTotal,
  };
}

export async function syncRoom(state) {
  if (!firebaseDb || !state.roomCode?.trim() || !state.profile.name) return false;
  const code = state.roomCode.trim().toUpperCase();
  const ref = firebaseDb.doc(firebaseDb.db, "rooms", code);
  try {
    await firebaseDb.setDoc(
      ref,
      { members: { [state.profile.name]: memberPayload(state) } },
      { merge: true }
    );
    state.lastSyncAt = Date.now();
    saveState(state);
    return true;
  } catch (e) {
    console.warn("Room sync failed", e);
    return false;
  }
}

export function subscribeRoom(state, callback) {
  if (roomUnsubscribe) {
    roomUnsubscribe();
    roomUnsubscribe = null;
  }
  onRoomUpdate = callback;
  if (!firebaseDb || !state.roomCode?.trim()) return;
  const code = state.roomCode.trim().toUpperCase();
  const ref = firebaseDb.doc(firebaseDb.db, "rooms", code);
  roomUnsubscribe = firebaseDb.onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    callback(snap.data());
  });
}

export function applyRoomData(state, roomData) {
  if (!roomData?.members) return state;
  const partnerName = state.profile.partner;
  const partner = partnerName ? roomData.members[partnerName] : null;
  if (partner) {
    const wk = getWeekId();
    if (!state.weekXp[wk]) state.weekXp[wk] = { you: 0, partner: 0 };
    state.weekXp[wk].partner = partner.weekXp ?? partner.xp ?? 0;
    state.partnerXpLocal = state.weekXp[wk].partner;
  }
  return state;
}

/** @deprecated use syncRoom */
export async function syncFirebase(state) {
  return syncRoom(state);
}

export async function fetchLeaderboard(state) {
  if (!firebaseDb || !state.roomCode?.trim()) return null;
  const code = state.roomCode.trim().toUpperCase();
  const ref = firebaseDb.doc(firebaseDb.db, "rooms", code);
  try {
    const snap = await firebaseDb.getDoc(ref);
    if (!snap.exists()) return {};
    const members = snap.data().members || {};
    const out = {};
    Object.entries(members).forEach(([name, m]) => {
      out[name] = { xp: m.weekXp ?? m.xp ?? 0, roadmapPct: m.roadmapPct ?? 0, updated: m.updated };
    });
    return out;
  } catch {
    return null;
  }
}

export function addXp(state, amount, reason) {
  state.xp += amount;
  const wk = getWeekId();
  if (!state.weekXp[wk]) state.weekXp[wk] = { you: 0, partner: 0 };
  state.weekXp[wk].you += amount;
  saveState(state);
  syncRoom(state);
  return reason;
}

export function touchStreak(state) {
  const today = todayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);

  if (state.lastActiveDate === today) return;
  if (state.lastActiveDate === yKey) state.streak += 1;
  else state.streak = 1;
  state.lastActiveDate = today;
  state.daysLogged += 1;
  addXp(state, 10 * state.streak, "streak");
}

export function exportJson(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `prepduel-backup-${todayKey()}.json`;
  a.click();
}

export function importJson(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      cb({ ...defaultState(), ...JSON.parse(reader.result) });
    } catch {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
}
