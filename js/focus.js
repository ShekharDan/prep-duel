/** Focus timer — pomodoro + block study sessions */

import { SCHEDULE_BLOCKS } from "./data.js";

const DEFAULT_FOCUS = 25 * 60;
const DEFAULT_BREAK = 5 * 60;

export function defaultFocusState() {
  return {
    active: false,
    mode: "idle",
    blockId: null,
    label: "",
    totalSec: 0,
    remainingSec: 0,
    startedAt: null,
    pausedAt: null,
    sessionsToday: 0,
  };
}

export function getBlockMinutes(blockId) {
  const b = SCHEDULE_BLOCKS.find((x) => x.id === blockId);
  return b?.minutes || 25;
}

export function startFocus(state, blockId = null, customMinutes = null) {
  if (!state.focus) state.focus = defaultFocusState();
  const mins = customMinutes ?? (blockId ? getBlockMinutes(blockId) : 25);
  const block = blockId ? SCHEDULE_BLOCKS.find((b) => b.id === blockId) : null;
  state.focus = {
    active: true,
    mode: "focus",
    blockId,
    label: block ? block.title : "Focus session",
    totalSec: mins * 60,
    remainingSec: mins * 60,
    startedAt: Date.now(),
    pausedAt: null,
    sessionsToday: state.focus.sessionsToday || 0,
  };
  return state.focus;
}

export function startBreak(state, minutes = 5) {
  if (!state.focus) state.focus = defaultFocusState();
  state.focus.active = true;
  state.focus.mode = "break";
  state.focus.blockId = null;
  state.focus.label = "Break — stretch, water, breathe";
  state.focus.totalSec = minutes * 60;
  state.focus.remainingSec = minutes * 60;
  state.focus.startedAt = Date.now();
  state.focus.pausedAt = null;
  return state.focus;
}

export function pauseFocus(state) {
  if (!state.focus?.active || state.focus.mode === "paused") return;
  state.focus.pausedAt = Date.now();
  state.focus.mode = "paused";
}

export function resumeFocus(state) {
  if (!state.focus?.pausedAt) return;
  state.focus.mode = state.focus.blockId ? "focus" : state.focus.label.includes("Break") ? "break" : "focus";
  state.focus.pausedAt = null;
}

export function stopFocus(state) {
  if (!state.focus) return;
  const wasFocus = state.focus.mode === "focus" && state.focus.remainingSec < state.focus.totalSec;
  if (wasFocus) state.focus.sessionsToday = (state.focus.sessionsToday || 0) + 1;
  state.focus.active = false;
  state.focus.mode = "idle";
  state.focus.blockId = null;
  state.focus.remainingSec = 0;
  state.focus.pausedAt = null;
}

export function tickFocus(state) {
  if (!state.focus?.active || state.focus.mode === "paused") return state.focus;
  if (state.focus.remainingSec <= 0) {
    if (state.focus.mode === "focus") {
      state.focus.sessionsToday = (state.focus.sessionsToday || 0) + 1;
      startBreak(state, 5);
    } else {
      stopFocus(state);
    }
    return state.focus;
  }
  state.focus.remainingSec -= 1;
  return state.focus;
}

export function formatTimer(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function focusPresence(state) {
  const f = state.focus || defaultFocusState();
  const studying = f.active && (f.mode === "focus" || f.mode === "paused");
  return {
    studying,
    focusMode: f.mode,
    blockId: f.blockId,
    blockLabel: f.label || null,
    timerRemaining: f.remainingSec || 0,
    timerTotal: f.totalSec || 0,
  };
}
