import { usePrep } from "../../context/PrepContext.jsx";

export default function DuelTab({ active }) {
  const {
    leaderboardRows,
    partnerRoadmapText,
    partnerXpInput,
    setPartnerXpInput,
    handlePartnerXpSave,
  } = usePrep();

  return (
    <section id="tab-duel" className={`tab${active ? " active" : ""}`}>
      <div className="page-head">
        <h2>Duel board</h2>
        <p>Compete with honesty — same room code on both phones.</p>
      </div>

      <div className="card">
        <div id="leaderboard">
          {leaderboardRows.map((r) => (
            <div key={r.name} className="duel-bar-row">
              <div className="label">
                <span>
                  {r.medal} {r.name}
                </span>
                <span>
                  {r.xp} XP{r.roadmapPct != null ? ` · ${r.roadmapPct}% roadmap` : ""}
                </span>
              </div>
              <div className="duel-bar">
                <div className={`fill-${r.cls}`} style={{ width: `${r.width}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p id="partner-roadmap" className="small muted" style={{ marginTop: 10 }}>
          {partnerRoadmapText || ""}
        </p>
        <label className="small" style={{ marginTop: 14 }}>
          Partner XP (manual fallback)
          <div className="mock-input">
            <input
              type="number"
              id="partner-xp-input"
              min="0"
              placeholder="320"
              value={partnerXpInput}
              onChange={(e) => setPartnerXpInput(e.target.value)}
            />
            <button type="button" id="partner-xp-save" className="btn" onClick={handlePartnerXpSave}>
              Update
            </button>
          </div>
        </label>
      </div>

      <div className="card">
        <div className="card-title">XP rules</div>
        <ul className="xp-rules">
          <li>
            Schedule block → <strong>+15 XP</strong>
          </li>
          <li>
            Topic done → <strong>+25 XP</strong>
          </li>
          <li>
            Quiz correct → <strong>+10 XP</strong>
          </li>
          <li>
            Perfect day → <strong>+50 XP</strong>
          </li>
          <li>
            Streak → <strong>+10 × days</strong>
          </li>
        </ul>
      </div>
    </section>
  );
}
