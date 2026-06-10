/** Missed schedule blocks roll into backlog */

import { TODAY_BLOCKS } from "./data.js";
import {
  getDayPlan,
  getEffectiveDayForDate,
  getPrepCycleDayNumberForDate,
  getTopicById,
} from "./roadmap.js";
import { todayKey } from "./store.js";

export function backlogItemKey(dateKey, blockId) {
  return `${dateKey}:${blockId}`;
}

function addDays(dateKey, delta) {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function dateKeysThrough(startKey, endKey) {
  if (!startKey || !endKey || endKey < startKey) return [];
  const keys = [];
  let cur = startKey;
  while (cur <= endKey) {
    keys.push(cur);
    cur = addDays(cur, 1);
  }
  return keys;
}

function formatDateLabel(dateKey) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function buildBlockItem(state, dateKey, blockDef, blockPlan) {
  const focus = blockPlan?.focus ? ` → ${blockPlan.focus}` : "";
  const tasks = blockPlan?.tasks || [];
  const topicNames = (blockPlan?.topicIds || [])
    .map((id) => getTopicById(id)?.name || id)
    .join(", ");
  const dayName = getEffectiveDayForDate(state.prepStartDate, dateKey);
  const cycleDay = getPrepCycleDayNumberForDate(state.prepStartDate, dateKey);

  return {
    key: backlogItemKey(dateKey, blockDef.id),
    dateKey,
    blockId: blockDef.id,
    dateLabel: formatDateLabel(dateKey),
    dayName,
    cycleDay,
    time: blockDef.time,
    minutes: blockDef.minutes,
    title: blockDef.title,
    track: blockDef.track,
    focus,
    tasks,
    topicNames,
    xp: blockDef.xp,
    isToday: dateKey === todayKey(),
  };
}

/** Unchecked day blocks since prep start (includes today if incomplete) */
export function getBacklogItems(state) {
  const start = state?.prepStartDate;
  if (!start) return [];

  const today = todayKey();
  if (today < start) return [];

  const skipped = state.backlogSkipped || {};
  const log = state.dailyLog || {};
  const items = [];

  dateKeysThrough(start, today).forEach((dateKey) => {
    const dayName = getEffectiveDayForDate(start, dateKey);
    if (!dayName) return;
    const plan = getDayPlan(dayName);
    const dayLog = log[dateKey] || {};

    TODAY_BLOCKS.forEach((blockDef) => {
      if (dayLog[blockDef.id]) return;
      const key = backlogItemKey(dateKey, blockDef.id);
      if (skipped[key]) return;
      const blockPlan = plan.blocks[blockDef.id];
      items.push(buildBlockItem(state, dateKey, blockDef, blockPlan));
    });
  });

  return items.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return a.time.localeCompare(b.time);
  });
}

export function getBacklogCount(state) {
  return getBacklogItems(state).length;
}
