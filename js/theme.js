/** Time-of-day accent + light/dark mode */

import { countRoadmapProgress } from "./roadmap.js";

export function getTimePhase(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

const PHASE_COPY = {
  morning: { label: "Morning", greeting: (n) => `Good morning, ${n}` },
  afternoon: { label: "Afternoon", greeting: (n) => `Afternoon, ${n}` },
  evening: { label: "Evening", greeting: (n) => `Evening session, ${n}` },
  night: { label: "Night", greeting: (n) => `Night study, ${n}` },
};

export function applyColorMode(mode = "dark") {
  const m = mode === "light" ? "light" : "dark";
  document.documentElement.dataset.color = m;
  document.body.dataset.color = m;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = m === "light" ? "#f6f5f2" : "#141316";
  return m;
}

export function applyTimeTheme() {
  const phase = getTimePhase();
  document.documentElement.dataset.phase = phase;
  document.body.dataset.phase = phase;
  const pill = document.getElementById("phase-pill");
  if (pill) pill.textContent = PHASE_COPY[phase].label;
  return phase;
}

export function getMotivation(state) {
  const roadmap = countRoadmapProgress(state.topicStatus || {});
  const pct = roadmap.pct;
  const left = roadmap.total - roadmap.done;
  const phase = getTimePhase();
  const copy = PHASE_COPY[phase];

  let headline = "One block done beats a perfect plan never started.";
  if (pct === 0) headline = "Start with one block. Momentum comes after action.";
  else if (pct < 30) headline = "Early phase — consistency matters more than speed.";
  else if (pct < 60) headline = "You're past the hard start. Keep the routine.";
  else if (pct < 100) headline = `${left} topics left in the roadmap. Finish in small daily wins.`;
  else headline = "Roadmap complete. Shift to mocks and interview depth.";

  return {
    phase,
    greeting: copy.greeting(state.profile.name || "there"),
    headline,
    roadmap,
  };
}
