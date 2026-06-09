/** Study buddy presence — honor system, heartbeat-based */

import { focusPresence } from "./focus.js";

const ONLINE_MS = 90_000;

export function buildPresence(state) {
  const focus = focusPresence(state);
  return {
    online: true,
    updated: Date.now(),
    ...focus,
  };
}

export function isOnline(member, now = Date.now()) {
  if (!member?.updated) return false;
  return now - member.updated < ONLINE_MS;
}

export function isStudying(member, now = Date.now()) {
  return isOnline(member, now) && member.studying === true;
}

export function presenceLabel(member, name = "Partner") {
  if (!member?.updated) return { dot: "offline", text: `${name} — not synced yet` };
  const ago = Math.round((Date.now() - member.updated) / 1000);
  if (!isOnline(member)) {
    const mins = Math.max(1, Math.round(ago / 60));
    return { dot: "offline", text: `${name} — away (${mins}m ago)` };
  }
  if (member.studying) {
    const left = member.timerRemaining ? ` · ${formatShort(member.timerRemaining)} left` : "";
    const block = member.blockLabel ? ` on ${member.blockLabel}` : "";
    if (member.focusMode === "paused") {
      return { dot: "pause", text: `${name} — paused${block}${left}` };
    }
    if (member.focusMode === "break") {
      return { dot: "break", text: `${name} — on break ☕` };
    }
    return { dot: "study", text: `${name} — studying${block}${left}` };
  }
  return { dot: "online", text: `${name} — online, not in focus mode` };
}

function formatShort(sec) {
  const m = Math.ceil(sec / 60);
  return `${m}m`;
}
