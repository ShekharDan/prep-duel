import { usePrep } from "../../context/PrepContext.jsx";
import JourneyPath from "../JourneyPath.jsx";
import StatRing from "../StatRing.jsx";

function BuddyRow({ dot, text }) {
  return (
    <div className="buddy-row">
      <span className={`status-dot ${dot}`} />
      <span className="small">{text}</span>
    </div>
  );
}

export default function HomeTab({ active }) {
  const {
    motivation,
    todayProgress,
    roadmapProgress,
    journeyNodes,
    buddyRows,
    duelPreview,
    badgeItems,
    nextAlarmText,
    alarmPulse,
    state,
  } = usePrep();

  const earnedBadges = badgeItems.filter((b) => b.earned).length;

  return (
    <section id="tab-home" className={`tab${active ? " active" : ""}`}>
      <div className="hero card hero-motivate">
        <div className="hero-top">
          <div>
            <p className="hero-eyebrow">PrepDuel · CIL × Corporate</p>
            <h1 id="greeting">{motivation.greeting}</h1>
          </div>
          {state.streak > 0 && (
            <span className="hero-streak" title="Study streak">
              🔥 {state.streak}d
            </span>
          )}
        </div>
        <p id="motivate-headline" className="motivate-headline">
          {motivation.headline}
        </p>

        <div className="stat-row stat-row-rings">
          <StatRing
            value={`${todayProgress.pct}%`}
            label="Today"
            pct={todayProgress.pct}
            color="var(--primary)"
          />
          <StatRing
            value={`${roadmapProgress.pct}%`}
            label="Roadmap"
            pct={roadmapProgress.pct}
            color="var(--cil)"
          />
        </div>

        <div className="progress-row">
          <div className="progress-label">
            <span>Daily progress</span>
            <span>{todayProgress.pct}%</span>
          </div>
          <div className={`bar${todayProgress.isComplete ? " is-complete" : ""}`}>
            <div id="today-bar" className="bar-fill" style={{ width: `${todayProgress.pct}%` }} />
          </div>
        </div>

        <div className="progress-row" style={{ marginTop: 10 }}>
          <div className="progress-label">
            <span>8-week journey</span>
            <span>{roadmapProgress.pct}%</span>
          </div>
          <div
            className={`bar bar-roadmap${
              roadmapProgress.pct > 0 && roadmapProgress.pct < 100 ? " is-growing" : ""
            }`}
          >
            <div id="goal-bar" className="bar-fill" style={{ width: `${roadmapProgress.pct}%` }} />
          </div>
        </div>

        <p id="goal-meta" className="small muted" style={{ marginTop: 10 }}>
          {roadmapProgress.done} steps climbed · {roadmapProgress.total - roadmapProgress.done}{" "}
          ahead · {roadmapProgress.progress} in progress now
        </p>

        <p id="persist-status" className="small muted persist-line">
          ✓ Auto-saves on this device
        </p>
      </div>

      <div className="card journey-card">
        <div className="card-title">Your path</div>
        <p className="small muted">Tap any step for details · auto-scrolls to today</p>
        <JourneyPath nodes={journeyNodes} progress={roadmapProgress} />
      </div>

      <div className="card buddy-card" id="study-buddy">
        <div className="card-title">Study together</div>
        <div id="buddy-status">
          {buddyRows.map((row, i) => (
            <BuddyRow key={i} dot={row.dot} text={row.text} />
          ))}
        </div>
        <p className="honor-note small muted">
          Timer sync is optional — use it if it helps you stay honest.
        </p>
      </div>

      <div className="grid-2">
        <div className="card duel-card">
          <div className="card-title">Weekly duel</div>
          <div id="duel-preview" className="duel-bars">
            <div className="duel-bar-row">
              <div className="label">
                <span>{duelPreview.youName}</span>
                <span>{duelPreview.you} XP</span>
              </div>
              <div className="duel-bar">
                <div className="fill-you" style={{ width: `${duelPreview.youWidth}%` }} />
              </div>
            </div>
            <div className="duel-bar-row">
              <div className="label">
                <span>{duelPreview.pName}</span>
                <span>{duelPreview.partner} XP</span>
              </div>
              <div className="duel-bar">
                <div
                  className="fill-partner"
                  style={{ width: `${duelPreview.partnerWidth}%` }}
                />
              </div>
            </div>
          </div>
          <p id="duel-status" className="muted small">
            {duelPreview.status}
          </p>
        </div>

        <div className="card badge-card">
          <div className="card-title">
            Badges <span className="badge-count">{earnedBadges}/{badgeItems.length}</span>
          </div>
          <div id="badge-list" className="badges">
            {badgeItems.map((b) => (
              <span key={b.name} className={`badge${b.earned ? " earned" : ""}`}>
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card alarm-card">
        <div className="card-title">Next alarm</div>
        <p id="next-alarm" className={`alarm-text${alarmPulse ? " alarm-fire" : ""}`}>
          {nextAlarmText}
        </p>
      </div>
    </section>
  );
}
