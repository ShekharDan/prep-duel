import { usePrep } from "../../context/PrepContext.jsx";

export default function BacklogTab({ active }) {
  const { backlogItems, handleBacklogComplete, handleBacklogSkip } = usePrep();

  return (
    <section id="tab-backlog" className={`tab${active ? " active" : ""}`}>
      <div className="page-head">
        <h2>Backlog</h2>
        <p>Jo blocks miss ho gaye — yahan se catch up karo ya skip karo.</p>
      </div>

      {backlogItems.length === 0 ? (
        <div className="card backlog-empty">
          <div className="backlog-empty-icon">✓</div>
          <p className="card-title" style={{ marginBottom: 6 }}>
            All clear
          </p>
          <p className="small muted">Koi pending block nahi — aaj ka plan Today tab pe follow karo.</p>
        </div>
      ) : (
        <>
          <p className="pill accent prep-banner">
            {backlogItems.length} block{backlogItems.length === 1 ? "" : "s"} pending
          </p>
          <div className="backlog-list">
            {backlogItems.map((item, i) => (
              <article
                key={item.key}
                className={`card backlog-item track-${item.track}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="backlog-item-head">
                  <span className="backlog-date">{item.dateLabel}</span>
                  {item.cycleDay != null && (
                    <span className="pill small">Prep Day {item.cycleDay}</span>
                  )}
                  {item.isToday && <span className="pill small accent">Today</span>}
                </div>
                <div className="block-header">
                  <span className="block-time">{item.time}</span>
                  <span className="block-mins">{item.minutes}m</span>
                  <span className={`block-track-pill ${item.track}`}>
                    {item.track === "corporate" ? "Corp" : item.track === "cil" ? "CIL" : "Both"}
                  </span>
                </div>
                <div className="block-title">
                  {item.title}
                  {item.focus}
                </div>
                {item.tasks.length > 0 && (
                  <ul className="block-tasks small">
                    {item.tasks.map((t, j) => (
                      <li key={j}>{t}</li>
                    ))}
                  </ul>
                )}
                {item.topicNames && (
                  <div className="block-topics small muted">Topics: {item.topicNames}</div>
                )}
                <div className="backlog-actions">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => handleBacklogComplete(item.dateKey, item.blockId)}
                  >
                    Done (+{item.xp} XP)
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => handleBacklogSkip(item.dateKey, item.blockId)}
                  >
                    Skip
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
