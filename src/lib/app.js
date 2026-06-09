import {
  SCHEDULE_BLOCKS,
  WEEK_ROTATION,
  DAY_PLANS,
  BADGES,
  RESOURCES,
  TOPICS,
  QUIZZES,
  DEFAULT_ALARMS,
} from "./data.js";
import {
  loadState,
  saveState,
  addXp,
  touchStreak,
  todayKey,
  getWeekId,
  initFirebase,
  fetchLeaderboard,
  syncRoom,
  subscribeRoom,
  applyRoomData,
  exportJson,
  importJson,
} from "./store.js";
import {
  getEffectiveDay,
  getPrepCycleDayNumber,
  getDayPlan,
  getRoadmapItems,
  countRoadmapProgress,
  syncTopicsFromDay,
  isTopicScheduledToday,
  getTopicById,
} from "./roadmap.js";
import { requestPermission, startAlarmLoop, nextAlarmTime } from "./notify.js";
import { applyTimeTheme, applyColorMode, getMotivation } from "./theme.js";
import {
  startFocus,
  startBreak,
  pauseFocus,
  resumeFocus,
  stopFocus,
  tickFocus,
  formatTimer,
  defaultFocusState,
} from "./focus.js";
import { presenceLabel } from "./presence.js";
import { initAmbient, staggerTabContent } from "./ambient.js";

let state = loadState();
if (!state.focus) state.focus = defaultFocusState();
let activeQuiz = null;
let quizIndex = 0;
let quizScore = 0;
let topicFilter = "all";
let lastRoomData = null;
let focusTickId = null;

function $(sel) {
  return document.querySelector(sel);
}

function $$(sel) {
  return document.querySelectorAll(sel);
}

function init() {
  if (!state.profile.name) {
    $("#setup-overlay").classList.remove("hidden");
  } else {
    renderAll();
  }

  applyColorMode(state.colorMode || "dark");
  applyTimeTheme();
  setInterval(applyTimeTheme, 60_000);

  bindNav();
  bindSetup();
  bindFocus();
  bindToday();
  bindTopics();
  bindQuiz();
  bindSettings();
  registerSW();
  initAmbient();
  startPresenceHeartbeat();

  initFirebase().then((fb) => {
    updateSyncStatus(fb);
    if (fb && state.roomCode) {
      subscribeRoom(state, (roomData) => {
        applyRoomData(state, roomData);
        renderDuelPreview();
        renderLeaderboard(roomData.members ? Object.fromEntries(
          Object.entries(roomData.members).map(([n, m]) => [n, { xp: m.weekXp ?? m.xp, roadmapPct: m.roadmapPct }])
        ) : null);
        updatePartnerRoadmap(roomData);
        lastRoomData = roomData;
        renderBuddy();
      });
      syncRoom(state);
      refreshLeaderboard();
    }
  });

  startAlarmLoop(state, () => {
    saveState(state);
    $("#next-alarm").classList.add("alarm-fire");
    setTimeout(() => $("#next-alarm").classList.remove("alarm-fire"), 2000);
  });

  setInterval(refreshLeaderboard, 60000);
  updateSyncStatus(null);
  updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
  const btn = $("#theme-toggle");
  if (!btn) return;
  btn.textContent = state.colorMode === "light" ? "◐" : "○";
  btn.title = state.colorMode === "light" ? "Switch to dark" : "Switch to light";
}

function bindSetup() {
  $("#setup-save").onclick = () => {
    const name = $("#setup-name").value.trim() || "You";
    const partner = $("#setup-partner").value.trim() || "Partner";
    const roomCode = ($("#setup-room").value.trim() || "PREPDUEL").toUpperCase();
    state.profile = { name, partner };
    state.roomCode = roomCode;
    saveState(state);
    $("#setup-overlay").classList.add("hidden");
    renderAll();
    initFirebase().then((fb) => {
      updateSyncStatus(fb);
      if (fb) {
        subscribeRoom(state, onRoomLive);
        syncRoom(state);
      }
    });
  };
}

function onRoomLive(roomData) {
  applyRoomData(state, roomData);
  lastRoomData = roomData;
  updatePartnerRoadmap(roomData);
  renderBuddy();
  renderDuelPreview();
  renderLeaderboard(
    roomData.members
      ? Object.fromEntries(
          Object.entries(roomData.members).map(([n, m]) => [
            n,
            { xp: m.weekXp ?? m.xp, roadmapPct: m.roadmapPct },
          ])
        )
      : null
  );
}

function updateSyncStatus(fb) {
  const el = $("#firebase-status");
  if (!el) return;
  if (!fb) {
    el.textContent = "Solo — data saved on this phone";
    el.style.background = "#475569";
    return;
  }
  if (state.roomCode) {
    el.textContent = `Synced · room ${state.roomCode}`;
    el.style.background = "#22c55e";
  } else {
    el.textContent = "Firebase ready — set room code in Settings";
    el.style.background = "#6366f1";
  }
  const persist = $("#persist-status");
  if (persist) persist.textContent = "✓ Progress auto-saves on this device";
}

function updatePartnerRoadmap(roomData) {
  const el = $("#partner-roadmap");
  if (!el || !roomData?.members) return;
  const pName = state.profile.partner;
  const p = pName ? roomData.members[pName] : null;
  if (!p) {
    el.textContent = `${pName || "Partner"} hasn't synced yet — same room code on her phone`;
    return;
  }
  el.textContent = `${pName}: ${p.roadmapPct ?? 0}% roadmap · ${p.weekXp ?? p.xp ?? 0} XP this week`;
}

function switchTab(tabId) {
  $$("#main-nav .dock-btn[data-tab]").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tabId);
  });
  $("#dock-more")?.classList.remove("active");
  $$(".tab").forEach((t) => t.classList.remove("active"));
  const panel = $(`#tab-${tabId}`);
  if (panel) panel.classList.add("active");
  closeMoreSheet();
  requestAnimationFrame(staggerTabContent);
}

function bindNav() {
  $$("#main-nav .dock-btn[data-tab]").forEach((btn) => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });

  $$(".sheet-item").forEach((btn) => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });

  $("#open-more")?.addEventListener("click", openMoreSheet);
  $("#dock-more")?.addEventListener("click", openMoreSheet);
  $("#sheet-overlay")?.addEventListener("click", closeMoreSheet);
}

function openMoreSheet() {
  $$("#main-nav .dock-btn").forEach((b) => b.classList.remove("active"));
  $("#dock-more")?.classList.add("active");
  $("#sheet-overlay")?.classList.add("open");
  $("#more-sheet")?.classList.add("open");
}

function closeMoreSheet() {
  $("#sheet-overlay")?.classList.remove("open");
  $("#more-sheet")?.classList.remove("open");
}

function renderAll() {
  applyColorMode(state.colorMode || "dark");
  applyTimeTheme();
  renderHome();
  renderFocus();
  renderToday();
  renderWeek();
  renderTopics();
  renderQuizList();
  renderResources();
  renderLeaderboard();
  renderAlarms();
  renderSettings();
  requestAnimationFrame(staggerTabContent);
}

function startPresenceHeartbeat() {
  setInterval(() => {
    if (document.visibilityState === "visible" && state.profile.name) {
      syncRoom(state);
    }
  }, 45_000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncRoom(state);
  });
}

function renderMotivation() {
  const m = getMotivation(state);
  const greet = $("#greeting");
  const head = $("#motivate-headline");
  if (greet) greet.textContent = m.greeting;
  if (head) head.textContent = m.headline;
}

function renderJourney() {
  const el = $("#journey-path");
  if (!el) return;
  const items = getRoadmapItems();
  const todayIds = new Set(
    getRoadmapItems()
      .filter((i) => isTopicScheduledToday(i.topicId, state))
      .map((i) => i.topicId)
  );
  let html = "";
  items.forEach((item, idx) => {
    const st = state.topicStatus[item.topic.id] || "empty";
    const cls = [st];
    if (todayIds.has(item.topic.id)) cls.push("today");
    if (st === "empty" && !todayIds.has(item.topic.id)) cls.push("ahead");
    if (idx > 0) {
      const prevSt = state.topicStatus[items[idx - 1].topic.id];
      html += `<div class="journey-line ${prevSt === "done" ? "filled" : ""}"></div>`;
    }
    const short = item.topic.name.split("—").pop()?.trim().slice(0, 10) || `S${item.order}`;
    html += `
      <div class="journey-node ${cls.join(" ")}" title="${item.topic.name}">
        <div class="journey-dot"></div>
        <div class="journey-label">${short}</div>
      </div>`;
  });
  el.innerHTML = html;
  const roadmap = countRoadmapProgress(state.topicStatus || {});
  const meta = $("#goal-meta");
  if (meta) {
    meta.textContent = `${roadmap.done} steps climbed · ${roadmap.total - roadmap.done} ahead · ${roadmap.progress} in progress now`;
  }
}

function localYouPresence() {
  const f = state.focus || defaultFocusState();
  return {
    updated: Date.now(),
    studying: f.active && (f.mode === "focus" || f.mode === "paused"),
    focusMode: f.mode,
    blockLabel: f.label,
    timerRemaining: f.remainingSec,
  };
}

function renderBuddy(roomData = lastRoomData) {
  const youName = state.profile.name || "You";
  const pName = state.profile.partner || "Partner";
  const members = roomData?.members || {};
  const youM = members[youName] || localYouPresence();
  const pM = members[pName];

  const youL = presenceLabel(youM, youName);
  const pL = pM ? presenceLabel(pM, pName) : { dot: "offline", text: `${pName} — open the app with same room code` };

  const row = (l) =>
    `<div class="buddy-row"><span class="status-dot ${l.dot}"></span><span class="small">${l.text}</span></div>`;

  const buddyEl = $("#buddy-status");
  if (buddyEl) buddyEl.innerHTML = row(youL) + row(pL);
  const panel = $("#focus-buddy-panel");
  if (panel) {
    panel.innerHTML = `<div class="card-title">Buddy status</div>${row(youL)}${row(pL)}`;
  }
}

const RING_LEN = 339.292;

function renderFocus() {
  const f = state.focus || defaultFocusState();
  const display = $("#focus-timer-display");
  const ring = $("#focus-ring");
  const modeEl = $("#focus-mode-label");
  const blockEl = $("#focus-block-label");
  const select = $("#focus-block-select");

  if (select && !select.options.length) {
    select.innerHTML =
      `<option value="">Custom 25 min</option>` +
      SCHEDULE_BLOCKS.map(
        (b) => `<option value="${b.id}">${b.time} · ${b.minutes}m — ${b.title}</option>`
      ).join("");
  }

  const rem = f.remainingSec || (f.active ? 0 : 25 * 60);
  const total = f.totalSec || 25 * 60;
  if (display) display.textContent = formatTimer(rem);
  if (ring && total) {
    const pct = rem / total;
    ring.style.strokeDashoffset = String(RING_LEN * (1 - pct));
    ring.style.stroke = f.mode === "break" ? "var(--secondary)" : "var(--primary)";
  }
  if (modeEl) {
    const labels = { idle: "Ready", focus: "Focus mode", break: "Break time", paused: "Paused" };
    modeEl.textContent = labels[f.mode] || "Ready";
  }
  if (blockEl) blockEl.textContent = f.label || "Pick a block or start a 25m sprint";
  document.body.classList.toggle("focus-active", f.active && f.mode === "focus");

  const pauseBtn = $("#focus-pause");
  const resumeBtn = $("#focus-resume");
  const stopBtn = $("#focus-stop");
  const startBtn = $("#focus-start");
  const active = f.active && f.mode !== "idle";
  if (pauseBtn) pauseBtn.classList.toggle("hidden", !active || f.mode === "paused" || f.mode === "break");
  if (resumeBtn) resumeBtn.classList.toggle("hidden", f.mode !== "paused");
  if (stopBtn) stopBtn.classList.toggle("hidden", !active);
  if (startBtn) startBtn.classList.toggle("hidden", active && f.mode !== "paused");
}

function bindFocus() {
  $("#focus-start")?.addEventListener("click", () => {
    const blockId = $("#focus-block-select")?.value || null;
    startFocus(state, blockId || null);
    saveState(state);
    syncRoom(state);
    startFocusLoop();
    renderFocus();
    renderBuddy();
  });
  $("#focus-break")?.addEventListener("click", () => {
    startBreak(state, 5);
    saveState(state);
    syncRoom(state);
    startFocusLoop();
    renderFocus();
    renderBuddy();
  });
  $("#focus-pause")?.addEventListener("click", () => {
    pauseFocus(state);
    saveState(state);
    syncRoom(state);
    renderFocus();
    renderBuddy();
  });
  $("#focus-resume")?.addEventListener("click", () => {
    resumeFocus(state);
    saveState(state);
    syncRoom(state);
    startFocusLoop();
    renderFocus();
    renderBuddy();
  });
  $("#focus-stop")?.addEventListener("click", () => {
    stopFocus(state);
    saveState(state);
    syncRoom(state);
    stopFocusLoop();
    renderFocus();
    renderBuddy();
  });
  if (state.focus?.active) startFocusLoop();
}

function startFocusLoop() {
  stopFocusLoop();
  focusTickId = setInterval(() => {
    tickFocus(state);
    saveState(state);
    renderFocus();
    renderBuddy();
    if (state.focus?.active) syncRoom(state);
    else stopFocusLoop();
  }, 1000);
}

function stopFocusLoop() {
  if (focusTickId) clearInterval(focusTickId);
  focusTickId = null;
}

function weekBlocksHtml(dayPlan) {
  const sessions = [
    { key: "morning", label: "Morning session" },
    { key: "evening", label: "Evening session" },
  ];
  let total = 0;
  let html = "";
  sessions.forEach((sess) => {
    const blocks = SCHEDULE_BLOCKS.filter((b) => b.session === sess.key);
    html += `<div class="week-session-label">${sess.label}</div>`;
    blocks.forEach((b) => {
      const bp = dayPlan?.blocks[b.id];
      const focus = bp?.focus || "—";
      const mins = b.minutes;
      total += mins;
      html += `
        <div class="week-block-row">
          <div class="week-block-time">${b.time}<br>${mins}m</div>
          <div>
            <strong>${b.title}</strong> → ${focus}
            ${bp?.tasks?.[0] ? `<div class="muted">${bp.tasks[0]}</div>` : ""}
          </div>
        </div>`;
    });
  });
  html += `<div class="week-total">Total: ${total} min (${(total / 60).toFixed(1)} hr)</div>`;
  return html;
}

function renderHome() {
  renderMotivation();
  renderJourney();
  renderBuddy();
  $("#streak-badge").textContent = `${state.streak}d streak`;
  $("#xp-badge").textContent = `XP ${state.xp}`;

  const today = todayKey();
  const log = state.dailyLog[today] || {};
  const done = SCHEDULE_BLOCKS.filter((b) => log[b.id]).length;
  const pct = Math.round((done / SCHEDULE_BLOCKS.length) * 100);
  $("#today-pct").textContent = `${pct}%`;
  const todayBar = $("#today-bar");
  if (todayBar) {
    todayBar.style.width = `${pct}%`;
    todayBar.parentElement?.classList.toggle("is-complete", pct >= 100);
  }

  const roadmap = countRoadmapProgress(state.topicStatus || {});
  const goalEl = $("#goal-pct");
  const goalBar = $("#goal-bar");
  if (goalEl) goalEl.textContent = `${roadmap.pct}%`;
  if (goalBar) {
    goalBar.style.width = `${roadmap.pct}%`;
    goalBar.parentElement?.classList.toggle("is-growing", roadmap.pct > 0 && roadmap.pct < 100);
  }
  renderDuelPreview();
  renderBadges();
  $("#next-alarm").textContent = nextAlarmTime(state.alarms || DEFAULT_ALARMS);
}

function renderDuelPreview() {
  const wk = getWeekId();
  const you = state.weekXp[wk]?.you || 0;
  const partner = state.weekXp[wk]?.partner || state.partnerXpLocal || 0;
  const max = Math.max(you, partner, 1);
  const youName = state.profile.name || "You";
  const pName = state.profile.partner || "Partner";

  $("#duel-preview").innerHTML = `
    <div class="duel-bar-row">
      <div class="label"><span>${youName}</span><span>${you} XP</span></div>
      <div class="duel-bar"><div class="fill-you" style="width:${(you / max) * 100}%"></div></div>
    </div>
    <div class="duel-bar-row">
      <div class="label"><span>${pName}</span><span>${partner} XP</span></div>
      <div class="duel-bar"><div class="fill-partner" style="width:${(partner / max) * 100}%"></div></div>
    </div>
  `;
  const lead = you > partner ? youName : partner > you ? pName : "Tie";
  $("#duel-status").textContent =
    you === partner && you === 0
      ? "Study together — honest blocks beat fake hustle"
      : you >= partner
        ? `You're ahead — pull ${pName} up, don't flex`
        : `${pName} is ahead — one focused evening can flip it`;
}

function renderBadges() {
  const stats = {
    xp: state.xp,
    streak: state.streak,
    daysLogged: state.daysLogged,
    quizCorrect: state.quizCorrect,
    topicsDone: Object.values(state.topicStatus).filter((s) => s === "done").length,
    perfectDays: state.perfectDays,
  };
  $("#badge-list").innerHTML = BADGES.map(
    (b) => `<span class="badge ${b.need(stats) ? "earned" : ""}">${b.name}</span>`
  ).join("");
}

function renderToday() {
  const today = todayKey();
  $("#today-date").textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const log = state.dailyLog[today] || {};
  const dayName = getEffectiveDay(state);
  const cycleDay = getPrepCycleDayNumber(state);
  const plan = getDayPlan(dayName);

  const prepBanner = $("#prep-day-banner");
  if (prepBanner) {
    prepBanner.textContent =
      cycleDay != null
        ? `Prep Day ${cycleDay} — ${dayName} (evening session · started ${state.prepStartDate})`
        : "";
  }

  $("#schedule-list").innerHTML = SCHEDULE_BLOCKS.map((b) => {
    const blockPlan = plan.blocks[b.id];
    const focus = blockPlan?.focus ? ` → ${blockPlan.focus}` : "";
    const tasks = (blockPlan?.tasks || [])
      .map((t) => `<li>${t}</li>`)
      .join("");
    const topicNames = (blockPlan?.topicIds || [])
      .map((id) => getTopicById(id)?.name || id)
      .join(", ");
    const checked = log[b.id] ? "checked" : "";
    const done = log[b.id] ? "done" : "";
    return `
      <label class="schedule-block ${done}">
        <input type="checkbox" data-block="${b.id}" ${checked} />
        <div>
          <div class="block-time">${b.time}</div>
          <div class="block-title">${b.title}${focus}</div>
          ${tasks ? `<ul class="block-tasks small">${tasks}</ul>` : ""}
          ${topicNames ? `<div class="block-topics small muted">Topics: ${topicNames}</div>` : ""}
          <div class="block-desc">+${b.xp} XP</div>
        </div>
      </label>`;
  }).join("");

  $$("#schedule-list input").forEach((cb) => {
    cb.onchange = () => {
      const today = todayKey();
      if (!state.dailyLog[today]) state.dailyLog[today] = {};
      const id = cb.dataset.block;
      const was = state.dailyLog[today][id];
      state.dailyLog[today][id] = cb.checked;
      if (cb.checked && !was) addXp(state, SCHEDULE_BLOCKS.find((x) => x.id === id).xp, "block");
      syncTopicsFromDay(state, today);
      saveState(state);
      syncRoom(state);
      renderHome();
      renderTopics();
      cb.closest(".schedule-block").classList.toggle("done", cb.checked);
    };
  });

  const energy = state.dailyLog[today]?.energy || 3;
  $("#energy").value = energy;
  $("#energy-val").textContent = energy;
  $("#energy").oninput = (e) => {
    $("#energy-val").textContent = e.target.value;
  };
}

function bindToday() {
  $("#save-day").onclick = () => {
    const today = todayKey();
    if (!state.dailyLog[today]) state.dailyLog[today] = {};
    state.dailyLog[today].energy = Number($("#energy").value);
    const allDone = SCHEDULE_BLOCKS.every((b) => state.dailyLog[today][b.id]);
    if (allDone) {
      addXp(state, 50, "perfect-day");
      state.perfectDays = (state.perfectDays || 0) + 1;
    }
    syncTopicsFromDay(state, today);
    touchStreak(state);
    saveState(state);
    syncRoom(state);
    renderAll();
    alert(allDone ? "Perfect day! +50 XP bonus 🏆" : "Day saved. Topics synced to roadmap!");
  };
}

function renderWeek() {
  const todayPlanDay = getEffectiveDay(state);
  $("#mock-tracker").innerHTML = buildMockTrackerHtml();
  bindMockHandlers();

  $("#week-plan").innerHTML = WEEK_ROTATION.map((w) => {
    const dayPlan = DAY_PLANS[w.day];
    const dsa = dayPlan?.blocks["m-dsa"]?.focus || "DSA";
    const isToday = w.day === todayPlanDay;
    return `
    <div class="week-day ${isToday ? "today" : ""}">
      <strong>Day ${w.cycleDay}: ${w.label}</strong>${isToday ? " ← today" : ""}
      <div class="small muted">P-II: ${w.p2} · P-I: ${w.p1} · DSA: ${dsa}</div>
      <div class="week-blocks">${weekBlocksHtml(dayPlan)}</div>
    </div>`;
  }).join("");
}

function buildMockTrackerHtml() {
  return `
    <p class="small muted">Target: 65+ per paper</p>
    <div class="mock-input">
      <label>Paper I <input type="number" id="mock-p1" min="0" max="100" placeholder="/100" /></label>
      <button class="btn" id="add-mock-p1">Add</button>
    </div>
    <ul id="mock-p1-list" class="small">${(state.mocks.paper1 || [])
      .map((s) => `<li>${s.date}: ${s.score}/100</li>`)
      .join("")}</ul>
    <div class="mock-input">
      <label>Paper II <input type="number" id="mock-p2" min="0" max="100" placeholder="/100" /></label>
      <button class="btn" id="add-mock-p2">Add</button>
    </div>
    <ul id="mock-p2-list" class="small">${(state.mocks.paper2 || [])
      .map((s) => `<li>${s.date}: ${s.score}/100</li>`)
      .join("")}</ul>`;
}

function bindMockHandlers() {
  $("#add-mock-p1").onclick = () => {
    const v = Number($("#mock-p1").value);
    if (!v) return;
    state.mocks.paper1.push({ date: todayKey(), score: v });
    addXp(state, 30, "mock");
    saveState(state);
    renderWeek();
  };
  $("#add-mock-p2").onclick = () => {
    const v = Number($("#mock-p2").value);
    if (!v) return;
    state.mocks.paper2.push({ date: todayKey(), score: v });
    addXp(state, 30, "mock");
    saveState(state);
    renderWeek();
  };
}

function renderTopics() {
  const roadmap = countRoadmapProgress(state.topicStatus || {});
  const summary = $("#topic-roadmap-summary");
  if (summary) {
    summary.innerHTML = `
      <div class="progress-row">
        <div class="progress-label"><span>8-week goal</span><span>${roadmap.pct}%</span></div>
        <div class="bar"><div class="bar-fill accent" style="width:${roadmap.pct}%"></div></div>
      </div>
      <p class="small muted">${roadmap.done} done · ${roadmap.progress} in progress · ${roadmap.total - roadmap.done - roadmap.progress} left</p>`;
  }

  const items = getRoadmapItems();
  const filtered =
    topicFilter === "all" ? items : items.filter((i) => i.topic.track === topicFilter);

  $("#topic-list").innerHTML = filtered
    .map((item) => {
      const t = item.topic;
      const st = state.topicStatus[t.id] || "empty";
      const icon = st === "done" ? "✅" : st === "progress" ? "🟡" : "⬜";
      const todayTag = isTopicScheduledToday(t.id, state)
        ? '<span class="pill today-tag">Today</span>'
        : "";
      return `
      <div class="topic-item roadmap-item ${st} ${isTopicScheduledToday(t.id, state) ? "scheduled-today" : ""}">
        <div class="roadmap-step">
          <span class="roadmap-num">W${item.week}</span>
          <span class="roadmap-icon">${icon}</span>
        </div>
        <div class="roadmap-body">
          <div class="topic-head">
            <span>${t.name}</span>
            <span class="topic-track ${t.track}">${t.track.toUpperCase()}</span>
            ${todayTag}
          </div>
          <div class="small muted">${item.day} · step ${item.order}</div>
          <ul class="topic-questions">${t.must.map((q) => `<li>${q}</li>`).join("")}</ul>
          <div class="status-btns">
            <button data-id="${t.id}" data-st="empty" class="${st === "empty" ? "active-empty" : ""}">⬜</button>
            <button data-id="${t.id}" data-st="progress" class="${st === "progress" ? "active-progress" : ""}">🟡</button>
            <button data-id="${t.id}" data-st="done" class="${st === "done" ? "active-done" : ""}">✅</button>
          </div>
        </div>
      </div>`;
    })
    .join("");

  $$(".status-btns button").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const prev = state.topicStatus[id];
      state.topicStatus[id] = btn.dataset.st;
      if (btn.dataset.st === "done" && prev !== "done") addXp(state, 25, "topic");
      saveState(state);
      syncRoom(state);
      renderTopics();
      renderHome();
    };
  });
}

function bindTopics() {
  $$(".filter").forEach((f) => {
    f.onclick = () => {
      $$(".filter").forEach((x) => x.classList.remove("active"));
      f.classList.add("active");
      topicFilter = f.dataset.track;
      renderTopics();
    };
  });
}

function renderQuizList() {
  $("#quiz-categories").innerHTML = Object.entries(QUIZZES)
    .map(
      ([id, q]) => `
    <div class="quiz-cat" data-quiz="${id}">
      <span>${q.title}</span>
      <span class="muted">${q.questions.length} Q · +10 XP each</span>
    </div>`
    )
    .join("");

  $$(".quiz-cat").forEach((el) => {
    el.onclick = () => startQuiz(el.dataset.quiz);
  });
}

function bindQuiz() {
  $("#quiz-back").onclick = () => {
    $("#quiz-area").classList.add("hidden");
    $("#quiz-categories").classList.remove("hidden");
  };
  $("#quiz-next").onclick = () => {
    quizIndex++;
    showQuestion();
  };
}

function startQuiz(id) {
  activeQuiz = QUIZZES[id];
  quizIndex = 0;
  quizScore = 0;
  $("#quiz-categories").classList.add("hidden");
  $("#quiz-area").classList.remove("hidden");
  $("#quiz-result").classList.add("hidden");
  showQuestion();
}

function showQuestion() {
  if (!activeQuiz || quizIndex >= activeQuiz.questions.length) {
    finishQuiz();
    return;
  }
  const q = activeQuiz.questions[quizIndex];
  $("#quiz-progress").textContent = `${quizIndex + 1} / ${activeQuiz.questions.length}`;
  $("#quiz-question").textContent = q.q;
  $("#quiz-next").classList.add("hidden");
  $("#quiz-options").innerHTML = q.opts
    .map(
      (o, i) => `<button class="quiz-option" data-i="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`
    )
    .join("");

  $$(".quiz-option").forEach((btn) => {
    btn.onclick = () => {
      const chosen = Number(btn.dataset.i);
      const correct = activeQuiz.questions[quizIndex].a;
      $$(".quiz-option").forEach((b) => {
        b.disabled = true;
        const idx = Number(b.dataset.i);
        if (idx === correct) b.classList.add("correct");
        if (idx === chosen && chosen !== correct) b.classList.add("wrong");
      });
      if (chosen === correct) {
        quizScore++;
        state.quizCorrect++;
        addXp(state, 10, "quiz");
      }
      saveState(state);
      $("#quiz-next").classList.remove("hidden");
    };
  });
}

function finishQuiz() {
  const total = activeQuiz.questions.length;
  const pct = Math.round((quizScore / total) * 100);
  $("#quiz-question").textContent = "";
  $("#quiz-options").innerHTML = "";
  $("#quiz-next").classList.add("hidden");
  $("#quiz-result").classList.remove("hidden");
  $("#quiz-result").innerHTML = `
    <div class="result-score">${quizScore}/${total}</div>
    <p>${pct}% — ${pct >= 70 ? "Great! 🎉" : "Revise and retry"}</p>
    <button class="btn primary" id="retry-quiz">Try again</button>
  `;
  $("#retry-quiz").onclick = () => startQuiz(Object.keys(QUIZZES).find((k) => QUIZZES[k] === activeQuiz));
  renderHome();
}

function renderResources() {
  $("#resource-list").innerHTML = RESOURCES.map(
    (r) => `
    <div class="resource-item">
      <span class="topic-track ${r.track === "both" ? "cil" : r.track}">${r.track.toUpperCase()}</span>
      <div><a href="${r.url}" target="_blank" rel="noopener">${r.title}</a></div>
      <div class="small muted">${r.note}</div>
    </div>`
  ).join("");
}

async function refreshLeaderboard() {
  const remote = await fetchLeaderboard(state);
  renderLeaderboard(remote);
}

function renderLeaderboard(remote) {
  const wk = getWeekId();
  const youName = state.profile.name || "You";
  const pName = state.profile.partner || "Partner";
  let youXp = state.weekXp[wk]?.you || 0;
  let pXp = state.weekXp[wk]?.partner || state.partnerXpLocal || 0;

  if (remote) {
    if (remote[youName]) youXp = remote[youName].xp;
    if (remote[pName]) pXp = remote[pName].xp;
  }

  const rows = [
    { name: youName, xp: youXp, cls: "you" },
    { name: pName, xp: pXp, cls: "partner" },
  ].sort((a, b) => b.xp - a.xp);

  $("#leaderboard").innerHTML = rows
    .map((r, i) => {
      const rm = remote?.[r.name]?.roadmapPct;
      const rmTxt = rm != null ? ` · ${rm}% roadmap` : "";
      return `
    <div class="duel-bar-row">
      <div class="label"><span>${i === 0 ? "🥇" : "🥈"} ${r.name}</span><span>${r.xp} XP${rmTxt}</span></div>
      <div class="duel-bar"><div class="fill-${r.cls}" style="width:${(r.xp / Math.max(rows[0].xp, 1)) * 100}%"></div></div>
    </div>`;
    })
    .join("");

  renderDuelPreview();
}

function renderAlarms() {
  const alarms = state.alarms || DEFAULT_ALARMS;
  $("#alarm-list").innerHTML = alarms
    .map(
      (a) => `
    <div class="alarm-row">
      <span>${a.label}</span>
      <input type="time" data-alarm="${a.id}" value="${a.time}" />
      <label><input type="checkbox" data-alarm-on="${a.id}" ${a.enabled ? "checked" : ""} /> On</label>
    </div>`
    )
    .join("");

  $$("#alarm-list input[type=time]").forEach((inp) => {
    inp.onchange = () => {
      const a = alarms.find((x) => x.id === inp.dataset.alarm);
      if (a) a.time = inp.value;
      state.alarms = alarms;
      saveState(state);
      $("#next-alarm").textContent = nextAlarmTime(alarms);
    };
  });
  $$("#alarm-list input[type=checkbox]").forEach((cb) => {
    cb.onchange = () => {
      const a = alarms.find((x) => x.id === cb.dataset.alarmOn);
      if (a) a.enabled = cb.checked;
      state.alarms = alarms;
      saveState(state);
    };
  });
}

function renderSettings() {
  $("#set-name").value = state.profile.name || "";
  $("#set-partner").value = state.profile.partner || "";
  const roomEl = $("#set-room");
  if (roomEl) roomEl.value = state.roomCode || "";
  $$(".theme-opt").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.color === (state.colorMode || "dark"));
  });
}

function bindSettings() {
  $("#set-profile").onclick = () => {
    state.profile.name = $("#set-name").value.trim() || "You";
    state.profile.partner = $("#set-partner").value.trim() || "Partner";
    state.roomCode = ($("#set-room").value.trim() || "").toUpperCase();
    saveState(state);
    initFirebase().then((fb) => {
      updateSyncStatus(fb);
      if (fb && state.roomCode) {
        subscribeRoom(state, onRoomLive);
        syncRoom(state);
      }
    });
    renderAll();
    alert("Profile updated — both phones need the same room code");
  };

  $("#sync-now")?.addEventListener("click", async () => {
    const ok = await syncRoom(state);
    alert(ok ? "Synced to cloud!" : "Sync failed — check Firebase config & room code");
    refreshLeaderboard();
  });

  $("#enable-notify").onclick = async () => {
    const ok = await requestPermission();
    alert(ok ? "Notifications enabled!" : "Permission denied — use alarms in-app when tab open.");
  };

  $("#export-data").onclick = () => exportJson(state);
  $("#import-data").onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    importJson(f, (s) => {
      state = s;
      saveState(state);
      renderAll();
      alert("Import done");
    });
  };

  $$(".theme-opt").forEach((btn) => {
    btn.onclick = () => {
      state.colorMode = btn.dataset.color;
      applyColorMode(state.colorMode);
      saveState(state);
      renderSettings();
    };
  });

  $("#theme-toggle")?.addEventListener("click", () => {
    state.colorMode = state.colorMode === "light" ? "dark" : "light";
    applyColorMode(state.colorMode);
    saveState(state);
    renderSettings();
    updateThemeToggleIcon();
  });

  $("#partner-xp-save")?.addEventListener("click", () => {
    const v = Number($("#partner-xp-input").value);
    if (!v && v !== 0) return;
    state.partnerXpLocal = v;
    const wk = getWeekId();
    if (!state.weekXp[wk]) state.weekXp[wk] = { you: 0, partner: 0 };
    state.weekXp[wk].partner = v;
    saveState(state);
    renderAll();
  });
}

async function registerSW() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (e) {
      console.warn("SW registration failed", e);
    }
  }
}

init();
