import { usePrep } from "../../context/PrepContext.jsx";

export default function TopicsTab({ active }) {
  const { topicFilter, setTopicFilter, roadmapProgress, topicItems, handleTopicStatus } =
    usePrep();

  return (
    <section id="tab-topics" className={`tab${active ? " active" : ""}`}>
      <div className="page-head">
        <h2>Roadmap</h2>
        <p>Synced with your daily blocks</p>
      </div>

      <div id="topic-roadmap-summary" className="card">
        <div className="progress-row">
          <div className="progress-label">
            <span>8-week goal</span>
            <span>{roadmapProgress.pct}%</span>
          </div>
          <div className="bar">
            <div className="bar-fill accent" style={{ width: `${roadmapProgress.pct}%` }} />
          </div>
        </div>
        <p className="small muted">
          {roadmapProgress.done} done · {roadmapProgress.progress} in progress ·{" "}
          {roadmapProgress.total - roadmapProgress.done - roadmapProgress.progress} left
        </p>
      </div>

      <div className="filter-row">
        {["all", "cil", "corporate"].map((track) => (
          <button
            key={track}
            type="button"
            className={`filter${topicFilter === track ? " active" : ""}`}
            data-track={track}
            onClick={() => setTopicFilter(track)}
          >
            {track === "all" ? "All" : track === "cil" ? "CIL" : "Corporate"}
          </button>
        ))}
      </div>

      <div id="topic-list">
        {topicItems.map((t) => (
          <div
            key={t.id}
            className={`topic-item roadmap-item ${t.status}${
              t.scheduledToday ? " scheduled-today" : ""
            }`}
          >
            <div className="roadmap-step">
              <span className="roadmap-num">W{t.week}</span>
              <span className="roadmap-icon">{t.icon}</span>
            </div>
            <div className="roadmap-body">
              <div className="topic-head">
                <span>{t.name}</span>
                <span className={`topic-track ${t.track}`}>{t.track.toUpperCase()}</span>
                {t.scheduledToday && <span className="pill today-tag">Today</span>}
              </div>
              <div className="small muted">
                {t.day} · step {t.order}
              </div>
              <ul className="topic-questions">
                {t.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
              <div className="status-btns">
                <button
                  type="button"
                  data-id={t.id}
                  data-st="empty"
                  className={t.status === "empty" ? "active-empty" : ""}
                  onClick={() => handleTopicStatus(t.id, "empty")}
                >
                  ⬜
                </button>
                <button
                  type="button"
                  data-id={t.id}
                  data-st="progress"
                  className={t.status === "progress" ? "active-progress" : ""}
                  onClick={() => handleTopicStatus(t.id, "progress")}
                >
                  🟡
                </button>
                <button
                  type="button"
                  data-id={t.id}
                  data-st="done"
                  className={t.status === "done" ? "active-done" : ""}
                  onClick={() => handleTopicStatus(t.id, "done")}
                >
                  ✅
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
