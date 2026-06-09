import { usePrep } from "../context/PrepContext.jsx";

export default function TopBar() {
  const { state, phaseLabel, handleThemeToggle, themeToggleIcon, themeToggleTitle } = usePrep();

  return (
    <header className="topbar">
      <div className="brand">
        Prep<span className="brand-accent">Duel</span>
        <span id="phase-pill" className="phase-pill">
          {phaseLabel}
        </span>
      </div>
      <div className="top-stats">
        <span id="streak-badge" className="pill">
          {state.streak}d streak
        </span>
        <span id="xp-badge" className="pill accent">
          XP {state.xp}
        </span>
        <button
          type="button"
          id="theme-toggle"
          className="icon-btn"
          title={themeToggleTitle}
          aria-label="Toggle theme"
          onClick={handleThemeToggle}
        >
          {themeToggleIcon}
        </button>
      </div>
    </header>
  );
}
