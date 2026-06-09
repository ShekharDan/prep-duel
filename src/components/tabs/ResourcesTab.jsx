import { usePrep } from "../../context/PrepContext.jsx";

export default function ResourcesTab({ active }) {
  const { resources } = usePrep();

  return (
    <section id="tab-resources" className={`tab${active ? " active" : ""}`}>
      <div className="page-head">
        <h2>Resources</h2>
      </div>
      <div id="resource-list">
        {resources.map((r, i) => (
          <div key={i} className="resource-item">
            <span className={`topic-track ${r.track === "both" ? "cil" : r.track}`}>
              {r.track.toUpperCase()}
            </span>
            <div>
              <a href={r.url} target="_blank" rel="noopener">
                {r.title}
              </a>
            </div>
            <div className="small muted">{r.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
