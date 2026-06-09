import { SCHEDULE_BLOCKS } from "../../lib/data.js";
import { usePrep } from "../../context/PrepContext.jsx";

function BuddyRow({ dot, text }) {
  return (
    <div className="buddy-row">
      <span className={`status-dot ${dot}`} />
      <span className="small">{text}</span>
    </div>
  );
}

export default function FocusTab({ active }) {
  const {
    focusDisplay,
    focusBlockId,
    setFocusBlockId,
    handleFocusStart,
    handleFocusBreak,
    handleFocusPause,
    handleFocusResume,
    handleFocusStop,
    buddyRows,
  } = usePrep();

  return (
    <section id="tab-focus" className={`tab${active ? " active" : ""}`}>
      <div className="page-head">
        <h2>Focus room</h2>
        <p>Deep work timer — your partner sees when you&apos;re studying.</p>
      </div>

      <div className="card focus-timer-card">
        <div id="focus-mode-label" className="focus-mode-label">
          {focusDisplay.modeLabel}
        </div>

        <div className="timer-ring-wrap">
          <svg className="timer-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle className="ring-bg" cx="60" cy="60" r="54" />
            <circle
              className="ring-progress"
              id="focus-ring"
              cx="60"
              cy="60"
              r="54"
              style={{
                strokeDashoffset: focusDisplay.ringOffset,
                stroke: focusDisplay.ringColor,
              }}
            />
          </svg>
          <div id="focus-timer-display" className="focus-timer-display">
            {focusDisplay.timerText}
          </div>
        </div>

        <div id="focus-block-label" className="small muted">
          {focusDisplay.blockLabel}
        </div>

        <label className="small">
          Study block
          <select
            id="focus-block-select"
            value={focusBlockId}
            onChange={(e) => setFocusBlockId(e.target.value)}
          >
            <option value="">Custom 25 min</option>
            {SCHEDULE_BLOCKS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.time} · {b.minutes}m — {b.title}
              </option>
            ))}
          </select>
        </label>

        <div className="focus-actions">
          <button
            id="focus-start"
            type="button"
            className={`btn primary${focusDisplay.showStart ? "" : " hidden"}`}
            onClick={handleFocusStart}
          >
            Start focus
          </button>
          <button id="focus-break" type="button" className="btn" onClick={handleFocusBreak}>
            Break 5m
          </button>
          <button
            id="focus-pause"
            type="button"
            className={`btn${focusDisplay.showPause ? "" : " hidden"}`}
            onClick={handleFocusPause}
          >
            Pause
          </button>
          <button
            id="focus-resume"
            type="button"
            className={`btn primary${focusDisplay.showResume ? "" : " hidden"}`}
            onClick={handleFocusResume}
          >
            Resume
          </button>
          <button
            id="focus-stop"
            type="button"
            className={`btn ghost${focusDisplay.showStop ? "" : " hidden"}`}
            onClick={handleFocusStop}
          >
            Stop
          </button>
        </div>
      </div>

      <div className="card" id="focus-buddy-panel">
        <div className="card-title">Buddy status</div>
        {buddyRows.map((row, i) => (
          <BuddyRow key={i} dot={row.dot} text={row.text} />
        ))}
      </div>
    </section>
  );
}
