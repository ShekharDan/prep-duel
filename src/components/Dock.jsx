import { usePrep } from "../context/PrepContext.jsx";

const DOCK_TABS = [
  {
    id: "home",
    label: "Home",
    path: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z",
  },
  {
    id: "today",
    label: "Today",
    path: "M7 4h10v2H7V4zm12 4H5a1 1 0 0 0-1 1v11h16V9a1 1 0 0 0-1-1zM9 12h2v2H9v-2zm4 0h2v2h-2v-2z",
  },
  {
    id: "week",
    label: "Week",
    path: "M5 5h14v3H5V5zm0 5h14v9H5v-9zm3 2v2h2v-2H8zm4 0v2h2v-2h-2z",
  },
  {
    id: "focus",
    label: "Focus",
    path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 2v5l4 2-.8 1.4L10 13V7h2z",
  },
];

export default function Dock() {
  const { activeTab, moreOpen, switchTab, openMoreSheet, backlogCount } = usePrep();

  return (
    <nav className="dock" id="main-nav">
      {DOCK_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-tab={tab.id}
          className={`dock-btn${activeTab === tab.id && !moreOpen ? " active" : ""}`}
          onClick={() => switchTab(tab.id)}
        >
          <svg className="dock-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d={tab.path} />
          </svg>
          <span>{tab.label}</span>
        </button>
      ))}
      <button
        type="button"
        id="dock-more"
        className={`dock-btn${moreOpen ? " active" : ""}`}
        onClick={openMoreSheet}
      >
        <svg className="dock-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 7h14v2H5V7zm0 5h14v2H5v-2zm0 5h14v2H5v-2z" />
        </svg>
        <span>More</span>
        {backlogCount > 0 && <span className="dock-badge">{backlogCount}</span>}
      </button>
    </nav>
  );
}
