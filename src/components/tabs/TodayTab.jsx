import { usePrep } from "../../context/PrepContext.jsx";

const ENERGY_EMOJI = ["", "😴", "😐", "🙂", "😊", "🔥"];

export default function TodayTab({ active }) {
  const {
    todayDate,
    todaySchedule,
    setEnergyDraft,
    handleBlockToggle,
    handleSaveDay,
  } = usePrep();

  const doneCount = todaySchedule.blocks.filter((b) => b.done).length;
  const totalBlocks = todaySchedule.blocks.length;

  return (
    <section id="tab-today" className={`tab${active ? " active" : ""}`}>
      <div className="page-head">
        <h2>Today</h2>
        <p id="today-date">{todayDate}</p>
        <p className="small muted">Evening session · {totalBlocks} blocks after office</p>
      </div>

      {todaySchedule.prepBanner && (
        <p
          id="prep-day-banner"
          className="pill accent prep-banner"
        >
          {todaySchedule.prepBanner}
        </p>
      )}

      <div className="today-progress-chip">
        <span>{doneCount}/{totalBlocks} blocks</span>
        <div className="today-progress-mini">
          <div
            className="today-progress-mini-fill"
            style={{ width: `${totalBlocks ? (doneCount / totalBlocks) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div id="schedule-list">
        {todaySchedule.blocks.map((block, i) => (
          <label
            key={block.id}
            className={`schedule-block track-${block.track}${block.done ? " done" : ""}`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <input
              type="checkbox"
              data-block={block.id}
              checked={block.checked}
              onChange={(e) => handleBlockToggle(block.id, e.target.checked)}
            />
            <div className="schedule-block-body">
              <div className="block-header">
                <span className="block-time">{block.time}</span>
                <span className="block-mins">{block.minutes}m</span>
                <span className={`block-track-pill ${block.track}`}>
                  {block.track === "corporate" ? "Corp" : block.track === "cil" ? "CIL" : "Both"}
                </span>
              </div>
              <div className="block-title">
                {block.title}
                {block.focus}
              </div>
              {block.tasks.length > 0 && (
                <ul className="block-tasks small">
                  {block.tasks.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                </ul>
              )}
              {block.topicNames && (
                <div className="block-topics small muted">Topics: {block.topicNames}</div>
              )}
              <div className="block-desc">+{block.xp} XP</div>
            </div>
          </label>
        ))}
      </div>

      <div className="card energy-card">
        <label>
          Energy {ENERGY_EMOJI[todaySchedule.energy] || "🙂"}
          <input
            type="range"
            id="energy"
            min="1"
            max="5"
            value={todaySchedule.energy}
            onChange={(e) => setEnergyDraft(Number(e.target.value))}
          />
        </label>
        <span id="energy-val" className="energy-face">
          {ENERGY_EMOJI[todaySchedule.energy]}
        </span>
      </div>

      <button id="save-day" type="button" className="btn primary full" onClick={handleSaveDay}>
        Save day
      </button>
    </section>
  );
}
