import { usePrep } from "../context/PrepContext.jsx";

const SHEET_ITEMS = [
  { tab: "topics", label: "Path", icon: "M4 6h16v2H4V6zm0 5h10v2H4v-2zm0 5h14v2H4v-2z", color: "cil" },
  { tab: "duel", label: "Duel", icon: "M6 6l4 12 2-6 2 6 4-12H6z", color: "partner" },
  { tab: "quiz", label: "Tests", icon: "M7 4h10v2H7V4zm12 4H5a1 1 0 0 0-1 1v11h16V9a1 1 0 0 0-1-1z", color: "warn" },
  { tab: "resources", label: "Resources", icon: "M10 6H6a2 2 0 0 0-2 2v10h12V8l-6-2zM14 6V4l4 4h-4z", color: "primary" },
  { tab: "settings", label: "Settings", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 4a8 8 0 0 1-.3 2.1l2 1.6-2 3.4-2.4-1a8 8 0 0 1-3.4 2l-.4 2.6H9.1l-.4-2.6a8 8 0 0 1-3.4-2l-2.4 1-2-3.4 2-1.6A8 8 0 0 1 4 12a8 8 0 0 1 8-8z", color: "muted" },
];

export default function MoreSheet() {
  const { moreOpen, switchTab, closeMoreSheet } = usePrep();

  return (
    <>
      <div
        id="sheet-overlay"
        className={`sheet-overlay${moreOpen ? " open" : ""}`}
        onClick={closeMoreSheet}
      />
      <div id="more-sheet" className={`sheet${moreOpen ? " open" : ""}`}>
        <div className="sheet-handle" />
        <div className="card-title" style={{ marginBottom: 12 }}>
          More
        </div>
        <div className="sheet-grid">
          {SHEET_ITEMS.map((item) => (
            <button
              key={item.tab}
              type="button"
              className={`sheet-item sheet-item-${item.color}`}
              data-tab={item.tab}
              onClick={() => switchTab(item.tab)}
            >
              <svg className="sheet-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d={item.icon} fill="currentColor" />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
