import { usePrep } from "../../context/PrepContext.jsx";

export default function WeekTab({ active }) {
  const {
    weekPlan,
    mocks,
    mockP1Input,
    setMockP1Input,
    mockP2Input,
    setMockP2Input,
    handleAddMockP1,
    handleAddMockP2,
  } = usePrep();

  return (
    <section id="tab-week" className={`tab${active ? " active" : ""}`}>
      <div className="page-head">
        <h2>Week plan</h2>
        <p>6 hr/day with block timings</p>
      </div>

      <div id="week-plan">
        {weekPlan.map((day) => (
          <div key={day.day} className={`week-day${day.isToday ? " today" : ""}`}>
            <strong>
              Day {day.cycleDay}: {day.label}
            </strong>
            {day.isToday ? " ← today" : ""}
            <div className="small muted">
              P-II: {day.p2} · P-I: {day.p1} · DSA: {day.dsa}
            </div>
            <div className="week-blocks">
              {day.blocks.map((block, i) =>
                block.type === "session" ? (
                  <div key={`${day.day}-sess-${i}`} className="week-session-label">
                    {block.label}
                  </div>
                ) : (
                  <div key={`${day.day}-block-${i}`} className="week-block-row">
                    <div className="week-block-time">
                      {block.time}
                      <br />
                      {block.minutes}m
                    </div>
                    <div>
                      <strong>{block.title}</strong> → {block.focus}
                      {block.task && <div className="muted">{block.task}</div>}
                    </div>
                  </div>
                )
              )}
              <div className="week-total">
                Total: {day.total} min ({(day.total / 60).toFixed(1)} hr)
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Mock tracker</div>
        <div id="mock-tracker">
          <p className="small muted">Target: 65+ per paper</p>
          <div className="mock-input">
            <label>
              Paper I{" "}
              <input
                type="number"
                id="mock-p1"
                min="0"
                max="100"
                placeholder="/100"
                value={mockP1Input}
                onChange={(e) => setMockP1Input(e.target.value)}
              />
            </label>
            <button type="button" className="btn" id="add-mock-p1" onClick={handleAddMockP1}>
              Add
            </button>
          </div>
          <ul id="mock-p1-list" className="small">
            {(mocks.paper1 || []).map((s, i) => (
              <li key={i}>
                {s.date}: {s.score}/100
              </li>
            ))}
          </ul>
          <div className="mock-input">
            <label>
              Paper II{" "}
              <input
                type="number"
                id="mock-p2"
                min="0"
                max="100"
                placeholder="/100"
                value={mockP2Input}
                onChange={(e) => setMockP2Input(e.target.value)}
              />
            </label>
            <button type="button" className="btn" id="add-mock-p2" onClick={handleAddMockP2}>
              Add
            </button>
          </div>
          <ul id="mock-p2-list" className="small">
            {(mocks.paper2 || []).map((s, i) => (
              <li key={i}>
                {s.date}: {s.score}/100
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
