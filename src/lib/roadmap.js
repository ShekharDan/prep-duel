/** Roadmap helpers — daily plans ↔ topics sync */

import { DAY_PLANS, TOPICS, ROADMAP_ORDER, PREP_CYCLE_DAYS, TODAY_BLOCKS } from "./data.js";

const TODAY_BLOCK_IDS = new Set(TODAY_BLOCKS.map((b) => b.id));

export function getDayName(date = new Date()) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function isPrepStarted(state, date = new Date()) {
  const startKey = state?.prepStartDate;
  if (!startKey) return false;
  const start = new Date(`${startKey}T12:00:00`);
  const cur = new Date(`${toDateKey(date)}T12:00:00`);
  return cur >= start;
}

/** Which plan day to use — cycle starts on prepStartDate (Day 1 = Wednesday plan) */
export function getEffectiveDay(state, date = new Date()) {
  const startKey = state?.prepStartDate;
  if (!startKey) return getDayName(date);

  const start = new Date(`${startKey}T12:00:00`);
  const cur = new Date(`${toDateKey(date)}T12:00:00`);
  const diffDays = Math.floor((cur - start) / 86400000);
  if (diffDays < 0) return null;
  return PREP_CYCLE_DAYS[diffDays % PREP_CYCLE_DAYS.length];
}

export function getEffectiveDayForDate(prepStartDate, dateKey) {
  if (!prepStartDate || !dateKey) return null;
  const start = new Date(`${prepStartDate}T12:00:00`);
  const cur = new Date(`${dateKey}T12:00:00`);
  const diffDays = Math.floor((cur - start) / 86400000);
  if (diffDays < 0) return null;
  return PREP_CYCLE_DAYS[diffDays % PREP_CYCLE_DAYS.length];
}

export function getPrepCycleDayNumber(state, date = new Date()) {
  const startKey = state?.prepStartDate;
  if (!startKey) return null;
  const start = new Date(`${startKey}T12:00:00`);
  const cur = new Date(`${toDateKey(date)}T12:00:00`);
  const diffDays = Math.floor((cur - start) / 86400000);
  return diffDays < 0 ? null : (diffDays % PREP_CYCLE_DAYS.length) + 1;
}

export function getPrepCycleDayNumberForDate(prepStartDate, dateKey) {
  if (!prepStartDate || !dateKey) return null;
  const start = new Date(`${prepStartDate}T12:00:00`);
  const cur = new Date(`${dateKey}T12:00:00`);
  const diffDays = Math.floor((cur - start) / 86400000);
  return diffDays < 0 ? null : (diffDays % PREP_CYCLE_DAYS.length) + 1;
}

export function getDayPlan(dayName) {
  return DAY_PLANS[dayName] || DAY_PLANS.Wednesday;
}

export function getTopicById(id) {
  return TOPICS.find((t) => t.id === id);
}

export function getTodayTopicIds(state, date = new Date()) {
  if (!isPrepStarted(state, date)) return [];
  const dayName = getEffectiveDay(state, date);
  if (!dayName) return [];
  const plan = getDayPlan(dayName);
  const ids = new Set();
  Object.entries(plan.blocks).forEach(([blockId, b]) => {
    if (!TODAY_BLOCK_IDS.has(blockId)) return;
    (b.topicIds || []).forEach((id) => ids.add(id));
  });
  return [...ids];
}

export function getBlockTopicIds(blockId, state, date = new Date()) {
  const plan = getDayPlan(getEffectiveDay(state, date));
  return plan.blocks[blockId]?.topicIds || [];
}

export function getRoadmapItems() {
  return ROADMAP_ORDER.map((entry, index) => {
    const topic = getTopicById(entry.topicId);
    return {
      order: index + 1,
      week: entry.week,
      day: entry.day,
      topicId: entry.topicId,
      topic: topic || { id: entry.topicId, name: entry.topicId, track: "cil", must: [] },
    };
  });
}

export function countRoadmapProgress(topicStatus) {
  const total = ROADMAP_ORDER.length;
  const done = ROADMAP_ORDER.filter((e) => topicStatus[e.topicId] === "done").length;
  const progress = ROADMAP_ORDER.filter((e) => topicStatus[e.topicId] === "progress").length;
  return { total, done, progress, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function isTopicUnlocked(topicId, topicStatus) {
  const idx = ROADMAP_ORDER.findIndex((e) => e.topicId === topicId);
  if (idx <= 0) return true;
  const prev = ROADMAP_ORDER[idx - 1];
  return topicStatus[prev.topicId] === "done" || topicStatus[topicId] !== "empty";
}

export function syncTopicsFromDay(state, logKey = null, date = new Date()) {
  const today = logKey || toDateKey(date);
  const log = state.dailyLog[today] || {};
  const dayName = getEffectiveDay(state, date);
  const plan = getDayPlan(dayName);
  if (!state.topicStatus) state.topicStatus = {};

  Object.entries(plan.blocks).forEach(([blockId, blockPlan]) => {
    if (!TODAY_BLOCK_IDS.has(blockId) || !log[blockId]) return;
    (blockPlan.topicIds || []).forEach((tid) => {
      if (state.topicStatus[tid] !== "done") state.topicStatus[tid] = "progress";
    });
  });

  const topicToBlocks = {};
  Object.entries(plan.blocks).forEach(([blockId, blockPlan]) => {
    if (!TODAY_BLOCK_IDS.has(blockId)) return;
    (blockPlan.topicIds || []).forEach((tid) => {
      if (!topicToBlocks[tid]) topicToBlocks[tid] = [];
      topicToBlocks[tid].push(blockId);
    });
  });
  Object.entries(topicToBlocks).forEach(([tid, blockIds]) => {
    if (blockIds.every((bid) => log[bid])) state.topicStatus[tid] = "done";
  });
}

export function isTopicScheduledToday(topicId, state, date = new Date()) {
  return getTodayTopicIds(state, date).includes(topicId);
}
