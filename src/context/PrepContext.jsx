import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SCHEDULE_BLOCKS,
  TODAY_BLOCKS,
  WEEK_ROTATION,
  DAY_PLANS,
  BADGES,
  RESOURCES,
  QUIZZES,
  DEFAULT_ALARMS,
} from "../lib/data.js";
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
} from "../lib/store.js";
import { getTopicIconKey } from "../lib/topicIcons.js";
import {
  getEffectiveDay,
  getPrepCycleDayNumber,
  getDayPlan,
  getRoadmapItems,
  countRoadmapProgress,
  syncTopicsFromDay,
  isTopicScheduledToday,
  getTopicById,
} from "../lib/roadmap.js";
import { requestPermission, startAlarmLoop, nextAlarmTime } from "../lib/notify.js";
import { applyTimeTheme, applyColorMode, getMotivation, getTimePhase } from "../lib/theme.js";
import {
  startFocus,
  startBreak,
  pauseFocus,
  resumeFocus,
  stopFocus,
  tickFocus,
  formatTimer,
  defaultFocusState,
} from "../lib/focus.js";
import { presenceLabel } from "../lib/presence.js";
import { initAmbient, staggerTabContent } from "../lib/ambient.js";

export const RING_LEN = 339.292;

const PHASE_LABELS = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

const PrepContext = createContext(null);

function weekBlocksData(dayPlan) {
  const sessions = [
    { key: "morning", label: "Morning session" },
    { key: "evening", label: "Evening session" },
  ];
  let total = 0;
  const blocks = [];
  sessions.forEach((sess) => {
    blocks.push({ type: "session", label: sess.label });
    SCHEDULE_BLOCKS.filter((b) => b.session === sess.key).forEach((b) => {
      const bp = dayPlan?.blocks[b.id];
      total += b.minutes;
      blocks.push({
        type: "block",
        time: b.time,
        minutes: b.minutes,
        title: b.title,
        focus: bp?.focus || "—",
        task: bp?.tasks?.[0] || null,
      });
    });
  });
  return { blocks, total };
}

export function PrepProvider({ children }) {
  const [state, setStateRaw] = useState(() => {
    const s = loadState();
    if (!s.focus) s.focus = defaultFocusState();
    return s;
  });
  const [activeTab, setActiveTab] = useState("home");
  const [moreOpen, setMoreOpen] = useState(false);
  const [topicFilter, setTopicFilter] = useState("all");
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChosen, setQuizChosen] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [lastRoomData, setLastRoomData] = useState(null);
  const [remoteLeaderboard, setRemoteLeaderboard] = useState(null);
  const [fbReady, setFbReady] = useState(null);
  const [alarmPulse, setAlarmPulse] = useState(false);
  const [timePhase, setTimePhase] = useState(getTimePhase);
  const [focusBlockId, setFocusBlockId] = useState("");
  const [energyDraft, setEnergyDraft] = useState(null);
  const [mockP1, setMockP1] = useState("");
  const [mockP2, setMockP2] = useState("");
  const [partnerXpInput, setPartnerXpInput] = useState("");
  const [toast, setToast] = useState(null);
  const [confettiBurst, setConfettiBurst] = useState(0);

  const focusTickRef = useRef(null);
  const toastTimerRef = useRef(null);
  const appRef = useRef(null);
  const stateRef = useRef(state);

  const showToast = useCallback((message, variant = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, variant });
    if (variant === "celebrate") setConfettiBurst((n) => n + 1);
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const mutateState = useCallback((fn) => {
    setStateRaw((prev) => {
      fn(prev);
      saveState(prev);
      return { ...prev };
    });
  }, []);

  const showSetup = !state.profile.name;

  const onRoomLive = useCallback(
    (roomData) => {
      mutateState((s) => applyRoomData(s, roomData));
      setLastRoomData(roomData);
    },
    [mutateState]
  );

  const refreshLeaderboard = useCallback(async () => {
    const remote = await fetchLeaderboard(state);
    setRemoteLeaderboard(remote);
  }, [state]);

  const switchTab = useCallback((tabId) => {
    setActiveTab(tabId);
    setMoreOpen(false);
  }, []);

  const openMoreSheet = useCallback(() => {
    setMoreOpen(true);
  }, []);

  const closeMoreSheet = useCallback(() => {
    setMoreOpen(false);
  }, []);

  const handleSetupSave = useCallback(
    (name, partner, roomCode) => {
      mutateState((s) => {
        s.profile = { name: name.trim() || "You", partner: partner.trim() || "Partner" };
        s.roomCode = (roomCode.trim() || "PREPDUEL").toUpperCase();
      });
      initFirebase().then((fb) => {
        setFbReady(fb);
        if (fb) {
          const s = stateRef.current;
          subscribeRoom(s, onRoomLive);
          syncRoom(s);
        }
      });
    },
    [mutateState, onRoomLive]
  );

  const startFocusLoop = useCallback(() => {
    if (focusTickRef.current) clearInterval(focusTickRef.current);
    focusTickRef.current = setInterval(() => {
      setStateRaw((prev) => {
        tickFocus(prev);
        saveState(prev);
        if (prev.focus?.active) syncRoom(prev);
        else if (focusTickRef.current) {
          clearInterval(focusTickRef.current);
          focusTickRef.current = null;
        }
        return { ...prev };
      });
    }, 1000);
  }, []);

  const stopFocusLoop = useCallback(() => {
    if (focusTickRef.current) {
      clearInterval(focusTickRef.current);
      focusTickRef.current = null;
    }
  }, []);

  const handleFocusStart = useCallback(() => {
    mutateState((s) => {
      startFocus(s, focusBlockId || null);
      syncRoom(s);
    });
    startFocusLoop();
  }, [mutateState, focusBlockId, startFocusLoop]);

  const handleFocusBreak = useCallback(() => {
    mutateState((s) => {
      startBreak(s, 5);
      syncRoom(s);
    });
    startFocusLoop();
  }, [mutateState, startFocusLoop]);

  const handleFocusPause = useCallback(() => {
    mutateState((s) => {
      pauseFocus(s);
      syncRoom(s);
    });
  }, [mutateState]);

  const handleFocusResume = useCallback(() => {
    mutateState((s) => {
      resumeFocus(s);
      syncRoom(s);
    });
    startFocusLoop();
  }, [mutateState, startFocusLoop]);

  const handleFocusStop = useCallback(() => {
    mutateState((s) => {
      stopFocus(s);
      syncRoom(s);
    });
    stopFocusLoop();
  }, [mutateState, stopFocusLoop]);

  const handleBlockToggle = useCallback(
    (blockId, checked) => {
      const today = todayKey();
      mutateState((s) => {
        if (!s.dailyLog[today]) s.dailyLog[today] = {};
        const was = s.dailyLog[today][blockId];
        s.dailyLog[today][blockId] = checked;
        if (checked && !was) {
          const block = SCHEDULE_BLOCKS.find((x) => x.id === blockId);
          if (block) addXp(s, block.xp, "block");
        }
        syncTopicsFromDay(s, today);
        syncRoom(s);
      });
    },
    [mutateState]
  );

  const handleSaveDay = useCallback(() => {
    const today = todayKey();
    const energy = energyDraft ?? state.dailyLog[today]?.energy ?? 3;
    let allDone = false;
    mutateState((s) => {
      if (!s.dailyLog[today]) s.dailyLog[today] = {};
      s.dailyLog[today].energy = Number(energy);
      allDone = TODAY_BLOCKS.every((b) => s.dailyLog[today][b.id]);
      if (allDone) {
        addXp(s, 50, "perfect-day");
        s.perfectDays = (s.perfectDays || 0) + 1;
      }
      syncTopicsFromDay(s, today);
      touchStreak(s);
      syncRoom(s);
    });
    setEnergyDraft(null);
    showToast(
      allDone ? "Perfect day! +50 XP bonus" : "Day saved — roadmap synced",
      allDone ? "celebrate" : "success"
    );
  }, [mutateState, state, energyDraft, showToast]);

  const handleAddMockP1 = useCallback(() => {
    const v = Number(mockP1);
    if (!v) return;
    mutateState((s) => {
      s.mocks.paper1.push({ date: todayKey(), score: v });
      addXp(s, 30, "mock");
    });
    setMockP1("");
  }, [mutateState, mockP1]);

  const handleAddMockP2 = useCallback(() => {
    const v = Number(mockP2);
    if (!v) return;
    mutateState((s) => {
      s.mocks.paper2.push({ date: todayKey(), score: v });
      addXp(s, 30, "mock");
    });
    setMockP2("");
  }, [mutateState, mockP2]);

  const handleTopicStatus = useCallback(
    (id, st) => {
      mutateState((s) => {
        const prev = s.topicStatus[id];
        s.topicStatus[id] = st;
        if (st === "done" && prev !== "done") addXp(s, 25, "topic");
        syncRoom(s);
      });
    },
    [mutateState]
  );

  const startQuiz = useCallback((id) => {
    setActiveQuizId(id);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizChosen(null);
    setQuizFinished(false);
  }, []);

  const handleQuizBack = useCallback(() => {
    setActiveQuizId(null);
    setQuizFinished(false);
    setQuizAnswered(false);
    setQuizChosen(null);
  }, []);

  const handleQuizAnswer = useCallback(
    (chosen) => {
      const activeQuiz = activeQuizId ? QUIZZES[activeQuizId] : null;
      if (!activeQuiz || quizAnswered) return;
      const correct = activeQuiz.questions[quizIndex].a;
      setQuizChosen(chosen);
      setQuizAnswered(true);
      if (chosen === correct) {
        setQuizScore((s) => s + 1);
        mutateState((s) => {
          s.quizCorrect++;
          addXp(s, 10, "quiz");
        });
      }
    },
    [activeQuizId, quizIndex, quizAnswered, mutateState]
  );

  const handleQuizNext = useCallback(() => {
    const activeQuiz = activeQuizId ? QUIZZES[activeQuizId] : null;
    if (!activeQuiz) return;
    const next = quizIndex + 1;
    if (next >= activeQuiz.questions.length) {
      setQuizFinished(true);
    } else {
      setQuizIndex(next);
      setQuizAnswered(false);
      setQuizChosen(null);
    }
  }, [activeQuizId, quizIndex]);

  const handleQuizRetry = useCallback(() => {
    if (activeQuizId) startQuiz(activeQuizId);
  }, [activeQuizId, startQuiz]);

  const handleSetProfile = useCallback(
    (name, partner, roomCode) => {
      const code = (roomCode.trim() || "").toUpperCase();
      mutateState((s) => {
        s.profile.name = name.trim() || "You";
        s.profile.partner = partner.trim() || "Partner";
        s.roomCode = code;
      });
      initFirebase().then((fb) => {
        setFbReady(fb);
        if (fb && code) {
          const s = stateRef.current;
          subscribeRoom(s, onRoomLive);
          syncRoom(s);
        }
      });
      showToast("Profile updated — same room code on both phones");
    },
    [mutateState, onRoomLive, showToast]
  );

  const handleSyncNow = useCallback(async () => {
    const ok = await syncRoom(state);
    showToast(
      ok ? "Synced to cloud" : "Sync failed — check Firebase & room code",
      ok ? "success" : "error"
    );
    refreshLeaderboard();
  }, [state, refreshLeaderboard, showToast]);

  const handleEnableNotify = useCallback(async () => {
    const ok = await requestPermission();
    showToast(
      ok ? "Notifications enabled" : "Permission denied — keep tab open for alarms",
      ok ? "success" : "error"
    );
  }, [showToast]);

  const handleExportData = useCallback(() => {
    exportJson(state);
  }, [state]);

  const handleImportData = useCallback(
    (file) => {
      if (!file) return;
      importJson(file, (s) => {
        if (!s.focus) s.focus = defaultFocusState();
        setStateRaw(s);
        saveState(s);
        showToast("Import complete");
      });
    },
    [showToast]
  );

  const handleColorMode = useCallback(
    (mode) => {
      mutateState((s) => {
        s.colorMode = mode;
      });
      applyColorMode(mode);
    },
    [mutateState]
  );

  const handleThemeToggle = useCallback(() => {
    const next = state.colorMode === "light" ? "dark" : "light";
    mutateState((s) => {
      s.colorMode = next;
    });
    applyColorMode(next);
  }, [mutateState, state.colorMode]);

  const handlePartnerXpSave = useCallback(() => {
    const v = Number(partnerXpInput);
    if (!v && v !== 0) return;
    mutateState((s) => {
      s.partnerXpLocal = v;
      const wk = getWeekId();
      if (!s.weekXp[wk]) s.weekXp[wk] = { you: 0, partner: 0 };
      s.weekXp[wk].partner = v;
    });
  }, [mutateState, partnerXpInput]);

  const handleAlarmTimeChange = useCallback(
    (id, time) => {
      mutateState((s) => {
        const alarms = s.alarms || DEFAULT_ALARMS;
        const a = alarms.find((x) => x.id === id);
        if (a) a.time = time;
        s.alarms = alarms;
      });
    },
    [mutateState]
  );

  const handleAlarmEnabledChange = useCallback(
    (id, enabled) => {
      mutateState((s) => {
        const alarms = s.alarms || DEFAULT_ALARMS;
        const a = alarms.find((x) => x.id === id);
        if (a) a.enabled = enabled;
        s.alarms = alarms;
      });
    },
    [mutateState]
  );

  const localYouPresence = useCallback(() => {
    const f = state.focus || defaultFocusState();
    return {
      updated: Date.now(),
      studying: f.active && (f.mode === "focus" || f.mode === "paused"),
      focusMode: f.mode,
      blockLabel: f.label,
      timerRemaining: f.remainingSec,
    };
  }, [state.focus]);

  const motivation = useMemo(() => getMotivation(state), [state]);

  const journeyNodes = useMemo(() => {
    const items = getRoadmapItems();
    const todayIds = new Set(
      items.filter((i) => isTopicScheduledToday(i.topicId, state)).map((i) => i.topicId)
    );
    return items.map((item, idx) => {
      const st = state.topicStatus[item.topic.id] || "empty";
      const cls = [];
      if (st === "done") cls.push("done");
      else if (st === "progress") cls.push("progress");
      else cls.push("ahead");
      if (todayIds.has(item.topic.id)) cls.push("today");
      const prevSt = idx > 0 ? state.topicStatus[items[idx - 1].topic.id] : null;
      const part = (item.topic.name.split("—").pop() || item.topic.name).trim();
      const label =
        part.length <= 14
          ? part
          : part.split(/\s+/).length >= 2 && `${part.split(/\s+/)[0]} ${part.split(/\s+/)[1]}`.length <= 14
            ? `${part.split(/\s+/)[0]} ${part.split(/\s+/)[1]}`
            : `${part.slice(0, 12)}…`;
      return {
        topicId: item.topic.id,
        topicName: item.topic.name,
        classes: cls.join(" "),
        lineFilled: prevSt === "done",
        label,
        week: item.week,
        track: item.topic.track || "cil",
        order: item.order,
        status: st,
        iconKey: getTopicIconKey(item.topic.id, item.topic.track),
        must: item.topic.must || [],
      };
    });
  }, [state]);

  const roadmapProgress = useMemo(
    () => countRoadmapProgress(state.topicStatus || {}),
    [state.topicStatus]
  );

  const buddyRows = useMemo(() => {
    const youName = state.profile.name || "You";
    const pName = state.profile.partner || "Partner";
    const members = lastRoomData?.members || {};
    const youM = members[youName] || localYouPresence();
    const pM = members[pName];
    const youL = presenceLabel(youM, youName);
    const pL = pM
      ? presenceLabel(pM, pName)
      : { dot: "offline", text: `${pName} — open the app with same room code` };
    return [
      { dot: youL.dot, text: youL.text },
      { dot: pL.dot, text: pL.text },
    ];
  }, [state.profile, lastRoomData, localYouPresence]);

  const todayProgress = useMemo(() => {
    const today = todayKey();
    const log = state.dailyLog[today] || {};
    const done = TODAY_BLOCKS.filter((b) => log[b.id]).length;
    const pct = Math.round((done / TODAY_BLOCKS.length) * 100);
    return { pct, isComplete: pct >= 100 };
  }, [state.dailyLog]);

  const duelPreview = useMemo(() => {
    const wk = getWeekId();
    const you = state.weekXp[wk]?.you || 0;
    const partner = state.weekXp[wk]?.partner || state.partnerXpLocal || 0;
    const max = Math.max(you, partner, 1);
    const youName = state.profile.name || "You";
    const pName = state.profile.partner || "Partner";
    let status;
    if (you === partner && you === 0) {
      status = "Study together — honest blocks beat fake hustle";
    } else if (you >= partner) {
      status = `You're ahead — pull ${pName} up, don't flex`;
    } else {
      status = `${pName} is ahead — one focused evening can flip it`;
    }
    return {
      youName,
      pName,
      you,
      partner,
      youWidth: (you / max) * 100,
      partnerWidth: (partner / max) * 100,
      status,
    };
  }, [state]);

  const badgeItems = useMemo(() => {
    const stats = {
      xp: state.xp,
      streak: state.streak,
      daysLogged: state.daysLogged,
      quizCorrect: state.quizCorrect,
      topicsDone: Object.values(state.topicStatus).filter((s) => s === "done").length,
      perfectDays: state.perfectDays,
    };
    return BADGES.map((b) => ({ name: b.name, earned: b.need(stats) }));
  }, [state]);

  const focusDisplay = useMemo(() => {
    const f = state.focus || defaultFocusState();
    const rem = f.remainingSec || (f.active ? 0 : 25 * 60);
    const total = f.totalSec || 25 * 60;
    const pct = total ? rem / total : 1;
    const labels = { idle: "Ready", focus: "Focus mode", break: "Break time", paused: "Paused" };
    const active = f.active && f.mode !== "idle";
    return {
      f,
      rem,
      total,
      pct,
      ringOffset: RING_LEN * (1 - pct),
      ringColor: f.mode === "break" ? "var(--secondary)" : "var(--primary)",
      modeLabel: labels[f.mode] || "Ready",
      blockLabel: f.label || "Pick a block or start a 25m sprint",
      timerText: formatTimer(rem),
      focusActive: f.active && f.mode === "focus",
      showPause: active && f.mode !== "paused" && f.mode !== "break",
      showResume: f.mode === "paused",
      showStop: active,
      showStart: !(active && f.mode !== "paused"),
    };
  }, [state.focus]);

  const todayDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  const todaySchedule = useMemo(() => {
    const today = todayKey();
    const log = state.dailyLog[today] || {};
    const dayName = getEffectiveDay(state);
    const cycleDay = getPrepCycleDayNumber(state);
    const plan = getDayPlan(dayName);
    const prepBanner =
      cycleDay != null
        ? `Prep Day ${cycleDay} — ${dayName} (evening session · started ${state.prepStartDate})`
        : "";
    const blocks = TODAY_BLOCKS.map((b) => {
      const blockPlan = plan.blocks[b.id];
      const focus = blockPlan?.focus ? ` → ${blockPlan.focus}` : "";
      const tasks = blockPlan?.tasks || [];
      const topicNames = (blockPlan?.topicIds || [])
        .map((id) => getTopicById(id)?.name || id)
        .join(", ");
      return {
        id: b.id,
        time: b.time,
        minutes: b.minutes,
        title: b.title,
        track: b.track,
        focus,
        tasks,
        topicNames,
        xp: b.xp,
        checked: !!log[b.id],
        done: !!log[b.id],
      };
    });
    const energy = energyDraft ?? log.energy ?? 3;
    return { prepBanner, blocks, energy, cycleDay };
  }, [state, energyDraft]);

  const weekPlan = useMemo(() => {
    const todayPlanDay = getEffectiveDay(state);
    return WEEK_ROTATION.map((w) => {
      const dayPlan = DAY_PLANS[w.day];
      const dsa = dayPlan?.blocks["m-dsa"]?.focus || "DSA";
      const isToday = w.day === todayPlanDay;
      return {
        cycleDay: w.cycleDay,
        label: w.label,
        day: w.day,
        p2: w.p2,
        p1: w.p1,
        dsa,
        isToday,
        ...weekBlocksData(dayPlan),
      };
    });
  }, [state]);

  const topicItems = useMemo(() => {
    const items = getRoadmapItems();
    const filtered =
      topicFilter === "all" ? items : items.filter((i) => i.topic.track === topicFilter);
    return filtered.map((item) => {
      const t = item.topic;
      const st = state.topicStatus[t.id] || "empty";
      const icon = st === "done" ? "✅" : st === "progress" ? "🟡" : "⬜";
      const scheduledToday = isTopicScheduledToday(t.id, state);
      return {
        id: t.id,
        name: t.name,
        track: t.track,
        week: item.week,
        day: item.day,
        order: item.order,
        status: st,
        icon,
        scheduledToday,
        questions: t.must,
      };
    });
  }, [state, topicFilter]);

  const quizCategories = useMemo(
    () =>
      Object.entries(QUIZZES).map(([id, q]) => ({
        id,
        title: q.title,
        count: q.questions.length,
      })),
    []
  );

  const activeQuiz = activeQuizId ? QUIZZES[activeQuizId] : null;
  const currentQuestion =
    activeQuiz && !quizFinished && quizIndex < activeQuiz.questions.length
      ? activeQuiz.questions[quizIndex]
      : null;

  const leaderboardRows = useMemo(() => {
    const wk = getWeekId();
    const youName = state.profile.name || "You";
    const pName = state.profile.partner || "Partner";
    let youXp = state.weekXp[wk]?.you || 0;
    let pXp = state.weekXp[wk]?.partner || state.partnerXpLocal || 0;
    const remote = remoteLeaderboard;
    if (remote) {
      if (remote[youName]) youXp = remote[youName].xp;
      if (remote[pName]) pXp = remote[pName].xp;
    }
    const rows = [
      { name: youName, xp: youXp, cls: "you" },
      { name: pName, xp: pXp, cls: "partner" },
    ].sort((a, b) => b.xp - a.xp);
    const maxXp = Math.max(rows[0]?.xp || 1, 1);
    return rows.map((r, i) => ({
      ...r,
      medal: i === 0 ? "🥇" : "🥈",
      width: (r.xp / maxXp) * 100,
      roadmapPct: remote?.[r.name]?.roadmapPct,
    }));
  }, [state, remoteLeaderboard]);

  const partnerRoadmapText = useMemo(() => {
    const pName = state.profile.partner;
    const p = pName ? lastRoomData?.members?.[pName] : null;
    if (!lastRoomData?.members) return null;
    if (!p) {
      return `${pName || "Partner"} hasn't synced yet — same room code on her phone`;
    }
    return `${pName}: ${p.roadmapPct ?? 0}% roadmap · ${p.weekXp ?? p.xp ?? 0} XP this week`;
  }, [state.profile.partner, lastRoomData]);

  const syncStatus = useMemo(() => {
    if (!fbReady) {
      return { text: "Solo — data saved on this phone", background: "#475569" };
    }
    if (state.roomCode) {
      return { text: `Synced · room ${state.roomCode}`, background: "#22c55e" };
    }
    return { text: "Firebase ready — set room code in Settings", background: "#6366f1" };
  }, [fbReady, state.roomCode]);

  const alarms = state.alarms || DEFAULT_ALARMS;
  const nextAlarmText = useMemo(() => nextAlarmTime(alarms), [alarms]);

  const themeToggleIcon = state.colorMode === "light" ? "◐" : "○";
  const themeToggleTitle =
    state.colorMode === "light" ? "Switch to dark" : "Switch to light";

  useEffect(() => {
    applyColorMode(state.colorMode || "dark");
    const phase = applyTimeTheme();
    setTimePhase(phase);
    const interval = setInterval(() => {
      const p = applyTimeTheme();
      setTimePhase(p);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyColorMode(state.colorMode || "dark");
  }, [state.colorMode]);

  useEffect(() => {
    document.body.classList.toggle("focus-active", focusDisplay.focusActive);
    return () => document.body.classList.remove("focus-active");
  }, [focusDisplay.focusActive]);

  useEffect(() => {
    initFirebase().then((fb) => {
      setFbReady(fb);
      const s = stateRef.current;
      if (fb && s.roomCode) {
        subscribeRoom(s, (roomData) => {
          onRoomLive(roomData);
          setRemoteLeaderboard(
            roomData.members
              ? Object.fromEntries(
                  Object.entries(roomData.members).map(([n, m]) => [
                    n,
                    { xp: m.weekXp ?? m.xp, roadmapPct: m.roadmapPct },
                  ])
                )
              : null
          );
        });
        syncRoom(s);
        refreshLeaderboard();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startAlarmLoop(state, () => {
      saveState(state);
      setAlarmPulse(true);
      setTimeout(() => setAlarmPulse(false), 2000);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [refreshLeaderboard]);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      const s = stateRef.current;
      if (document.visibilityState === "visible" && s.profile.name) {
        syncRoom(s);
      }
    }, 45_000);
    const onVis = () => {
      if (document.visibilityState === "visible") syncRoom(stateRef.current);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (state.focus?.active) startFocusLoop();
    return () => stopFocusLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((e) => {
        console.warn("SW registration failed", e);
      });
    }
    initAmbient();
  }, []);

  useEffect(() => {
    requestAnimationFrame(staggerTabContent);
  }, [activeTab]);

  const value = {
    state,
    activeTab,
    moreOpen,
    topicFilter,
    activeQuizId,
    activeQuiz,
    quizIndex,
    quizScore,
    quizAnswered,
    quizChosen,
    quizFinished,
    currentQuestion,
    lastRoomData,
    remoteLeaderboard,
    fbReady,
    alarmPulse,
    toast,
    confettiBurst,
    showToast,
    timePhase,
    phaseLabel: PHASE_LABELS[timePhase] || "Morning",
    focusBlockId,
    energyDraft,
    mockP1,
    mockP2,
    partnerXpInput,
    appRef,
    showSetup,
    RING_LEN,
    motivation,
    journeyNodes,
    roadmapProgress,
    buddyRows,
    todayProgress,
    duelPreview,
    badgeItems,
    focusDisplay,
    todayDate,
    todaySchedule,
    weekPlan,
    topicItems,
    quizCategories,
    leaderboardRows,
    partnerRoadmapText,
    syncStatus,
    alarms,
    nextAlarmText,
    themeToggleIcon,
    themeToggleTitle,
    switchTab,
    openMoreSheet,
    closeMoreSheet,
    handleSetupSave,
    setFocusBlockId,
    handleFocusStart,
    handleFocusBreak,
    handleFocusPause,
    handleFocusResume,
    handleFocusStop,
    handleBlockToggle,
    setEnergyDraft,
    handleSaveDay,
    mockP1Input: mockP1,
    setMockP1Input: setMockP1,
    mockP2Input: mockP2,
    setMockP2Input: setMockP2,
    handleAddMockP1,
    handleAddMockP2,
    setTopicFilter,
    handleTopicStatus,
    startQuiz,
    handleQuizBack,
    handleQuizAnswer,
    handleQuizNext,
    handleQuizRetry,
    handleSetProfile,
    handleSyncNow,
    handleEnableNotify,
    handleExportData,
    handleImportData,
    handleColorMode,
    handleThemeToggle,
    setPartnerXpInput,
    handlePartnerXpSave,
    handleAlarmTimeChange,
    handleAlarmEnabledChange,
    resources: RESOURCES,
    mocks: state.mocks,
  };

  return <PrepContext.Provider value={value}>{children}</PrepContext.Provider>;
}

export function usePrep() {
  const ctx = useContext(PrepContext);
  if (!ctx) throw new Error("usePrep must be used within PrepProvider");
  return ctx;
}
