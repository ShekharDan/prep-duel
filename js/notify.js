import { DEFAULT_ALARMS } from "./data.js";

export function requestPermission() {
  if (!("Notification" in window)) {
    alert("Notifications not supported on this browser.");
    return Promise.resolve(false);
  }
  return Notification.requestPermission().then((p) => p === "granted");
}

export function showNotification(title, body) {
  if (Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/prep-duel/icon-192.png", tag: "prepduel" });
    } catch {
      /* mobile may block without SW */
    }
  }
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

export function startAlarmLoop(state, onFire) {
  setInterval(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const current = `${hh}:${mm}`;
    const today = now.toISOString().slice(0, 10);
    const alarms = state.alarms || DEFAULT_ALARMS;

    for (const a of alarms) {
      if (!a.enabled || a.time !== current) continue;
      const key = `${today}-${a.id}`;
      if (state.firedAlarms[key]) continue;
      state.firedAlarms[key] = true;
      showNotification(`PrepDuel — ${a.label}`, "Time to study! Open the app and check Today tab.");
      onFire(a);
    }
  }, 30000);
}

export function nextAlarmTime(alarms) {
  const list = alarms || DEFAULT_ALARMS;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  let best = null;
  let bestDiff = Infinity;

  for (const a of list.filter((x) => x.enabled)) {
    const [h, m] = a.time.split(":").map(Number);
    let mins = h * 60 + m;
    if (mins <= nowMins) mins += 24 * 60;
    const diff = mins - nowMins;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = a;
    }
  }
  if (!best) return "No alarms enabled";
  const h = Math.floor(bestDiff / 60);
  const m = bestDiff % 60;
  return `${best.label} at ${best.time} (in ${h ? h + "h " : ""}${m}m)`;
}
