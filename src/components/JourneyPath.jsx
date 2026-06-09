import { useEffect, useMemo, useRef, useState } from "react";
import { usePrep } from "../context/PrepContext.jsx";
import TopicIcon from "./TopicIcon.jsx";

function buildTrackItems(nodes) {
  const items = [];
  let lastWeek = null;
  nodes.forEach((node, i) => {
    if (node.week !== lastWeek) {
      items.push({ type: "week", week: node.week, key: `week-${node.week}` });
      lastWeek = node.week;
    }
    items.push({ type: "node", ...node, index: i, key: node.topicId });
  });
  return items;
}

export default function JourneyPath({ nodes, progress }) {
  const { switchTab } = usePrep();
  const trackRef = useRef(null);
  const [scrollHint, setScrollHint] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selected, setSelected] = useState(null);
  const [burst, setBurst] = useState(0);

  const items = useMemo(() => buildTrackItems(nodes), [nodes]);

  const focusKey = useMemo(() => {
    const today = nodes.find((n) => n.classes.includes("today"));
    if (today) return today.topicId;
    const prog = nodes.find((n) => n.status === "progress");
    if (prog) return prog.topicId;
    const next = nodes.find((n) => n.status !== "done");
    return next?.topicId || nodes[0]?.topicId;
  }, [nodes]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.topicId === selected) || null,
    [nodes, selected]
  );

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  };

  const handleStepTap = (node) => {
    setSelected((prev) => (prev === node.topicId ? null : node.topicId));
    if (node.status === "done") setBurst((b) => b + 1);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !focusKey) return;
    const timer = setTimeout(() => {
      const target = el.querySelector(`[data-topic="${focusKey}"]`);
      if (target) {
        const left = target.offsetLeft - el.clientWidth / 2 + target.offsetWidth / 2;
        el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [focusKey, items.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    const hintTimer = setTimeout(() => setScrollHint(false), 3200);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      clearTimeout(hintTimer);
    };
  }, [items.length]);

  return (
    <div className="journey-wrap">
      <div className="journey-summary">
        <div className="journey-summary-stat">
          <span className="journey-summary-num">{progress.done}</span>
          <span className="journey-summary-lbl">done</span>
        </div>
        <div className="journey-summary-bar">
          <div className="journey-summary-fill" style={{ width: `${progress.pct}%` }} />
        </div>
        <div className="journey-summary-stat">
          <span className="journey-summary-num">{progress.total - progress.done}</span>
          <span className="journey-summary-lbl">left</span>
        </div>
      </div>

      <div className={`journey-scroller${scrollHint ? " show-hint" : ""}`}>
        <div className={`journey-fade left${canScrollLeft ? " visible" : ""}`} aria-hidden="true" />
        <div className={`journey-fade right${canScrollRight ? " visible" : ""}`} aria-hidden="true" />

        {scrollHint && (
          <div className="journey-scroll-hint" aria-hidden="true">
            <span>Scroll your path</span>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M5 12h12M13 8l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        <div className="journey-track" ref={trackRef} role="list">
          {items.map((item, itemIdx) => {
            if (item.type === "week") {
              return (
                <div
                  key={item.key}
                  className="journey-week-sep"
                  role="separator"
                  aria-label={`Week ${item.week}`}
                >
                  <span className="journey-week-sep-line" />
                  <span className="journey-week-sep-pill">Week {item.week}</span>
                  <span className="journey-week-sep-line" />
                </div>
              );
            }

            const node = item;
            const prevItem = items[itemIdx - 1];
            const showConnector = prevItem?.type === "node";
            const isFocus = node.topicId === focusKey;
            const isSelected = selected === node.topicId;
            const delay = Math.min((node.index ?? 0) * 0.04, 0.6);

            return (
              <div
                key={item.key}
                className="journey-cell enter-step"
                role="listitem"
                style={{ animationDelay: `${delay}s` }}
              >
                {showConnector && (
                  <div
                    className={`journey-connector${node.lineFilled ? " filled" : ""}`}
                    aria-hidden="true"
                  />
                )}
                <button
                  type="button"
                  className={`journey-step ${node.classes}${isFocus ? " focus" : ""}${isSelected ? " selected" : ""}`}
                  data-topic={node.topicId}
                  title={node.topicName}
                  onClick={() => handleStepTap(node)}
                >
                  <div className={`journey-dot${node.track === "corporate" ? " corp" : " cil"}`}>
                    {node.status === "done" ? (
                      <span className="journey-check">✓</span>
                    ) : node.status === "progress" ? (
                      <TopicIcon iconKey={node.iconKey} className="in-progress" />
                    ) : (
                      <TopicIcon iconKey={node.iconKey} />
                    )}
                    {node.status === "progress" && <span className="journey-pulse-ring" />}
                    {node.classes.includes("today") && <span className="journey-today-ring" />}
                  </div>
                  <span className="journey-label">{node.label}</span>
                  <span className={`journey-track-tag ${node.track}`}>
                    {node.track === "corporate" ? "Corp" : "CIL"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedNode && (
        <div className="journey-detail enter-pop">
          <div className="journey-detail-head">
            <div className={`journey-detail-icon ${selectedNode.track}`}>
              <TopicIcon iconKey={selectedNode.iconKey} />
            </div>
            <div>
              <div className="journey-detail-title">{selectedNode.topicName}</div>
              <div className="journey-detail-meta small muted">
                Week {selectedNode.week} · Step {selectedNode.order} ·{" "}
                {selectedNode.track === "corporate" ? "Corporate" : "CIL"}
              </div>
            </div>
          </div>
          {selectedNode.must?.length > 0 && (
            <ul className="journey-detail-must">
              {selectedNode.must.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="btn ghost journey-detail-btn"
            onClick={() => switchTab("topics")}
          >
            Open in roadmap →
          </button>
        </div>
      )}

      <div className="journey-legend">
        <span className="journey-legend-item">
          <i className="legend-dot done" /> Done
        </span>
        <span className="journey-legend-item">
          <i className="legend-dot progress" /> Active
        </span>
        <span className="journey-legend-item">
          <i className="legend-dot today" /> Today
        </span>
        <span className="journey-legend-item">
          <i className="legend-dot ahead" /> Ahead
        </span>
      </div>

      {burst > 0 && <div className="journey-confetti" key={burst} aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="journey-confetti-bit" style={{ "--i": i }} />
        ))}
      </div>}
    </div>
  );
}
