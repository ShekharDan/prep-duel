import { useState } from "react";
import { usePrep } from "../../context/PrepContext.jsx";

export default function SettingsTab({ active }) {
  const {
    state,
    alarms,
    syncStatus,
    handleColorMode,
    handleSetProfile,
    handleSyncNow,
    handleEnableNotify,
    handleExportData,
    handleImportData,
    handleAlarmTimeChange,
    handleAlarmEnabledChange,
    handleLogout,
  } = usePrep();

  const [name, setName] = useState(state.profile.name || "");
  const [partner, setPartner] = useState(state.profile.partner || "");
  const [room, setRoom] = useState(state.roomCode || "");

  return (
    <section id="tab-settings" className={`tab${active ? " active" : ""}`}>
      <div className="page-head">
        <h2>Settings</h2>
      </div>

      <div className="card">
        <div className="card-title">Schedule</div>
        <p className="small muted">
          Prep cycle starts <strong>{state.prepStartDate}</strong> (Day 1 = Tuesday plan)
        </p>
      </div>

      <div className="card">
        <div className="card-title">Appearance</div>
        <div className="theme-switch">
          <button
            type="button"
            className={`theme-opt${(state.colorMode || "dark") === "dark" ? " active" : ""}`}
            data-color="dark"
            onClick={() => handleColorMode("dark")}
          >
            Dark
          </button>
          <button
            type="button"
            className={`theme-opt${state.colorMode === "light" ? " active" : ""}`}
            data-color="light"
            onClick={() => handleColorMode("light")}
          >
            Light
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Profile</div>
        <label>
          Your name{" "}
          <input id="set-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Partner name{" "}
          <input
            id="set-partner"
            type="text"
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
          />
        </label>
        <label>
          Room code{" "}
          <input
            id="set-room"
            type="text"
            placeholder="DAN2026"
            maxLength={16}
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </label>
        <button
          id="set-profile"
          type="button"
          className="btn"
          onClick={() => handleSetProfile(name, partner, room)}
        >
          Save profile
        </button>
        <button id="sync-now" type="button" className="btn primary full" onClick={handleSyncNow}>
          Sync now
        </button>
        {state.sessionJoined && (
          <p className="small muted session-hint" style={{ marginTop: 10 }}>
            Signed in as <strong>{state.profile.name}</strong>
            {state.roomCode ? ` · room ${state.roomCode}` : ""}
          </p>
        )}
        <button
          id="logout"
          type="button"
          className="btn ghost full"
          style={{ marginTop: 8 }}
          onClick={() => {
            if (window.confirm("Log out? You'll need to enter name & room again. Study progress stays saved.")) {
              handleLogout();
            }
          }}
        >
          Log out
        </button>
      </div>

      <div className="card">
        <div className="card-title">Alarms</div>
        <p className="muted small">Add to Home Screen for best results.</p>
        <div id="alarm-list">
          {alarms.map((a) => (
            <div key={a.id} className="alarm-row">
              <span>{a.label}</span>
              <input
                type="time"
                data-alarm={a.id}
                value={a.time}
                onChange={(e) => handleAlarmTimeChange(a.id, e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  data-alarm-on={a.id}
                  checked={a.enabled}
                  onChange={(e) => handleAlarmEnabledChange(a.id, e.target.checked)}
                />{" "}
                On
              </label>
            </div>
          ))}
        </div>
        <button
          id="enable-notify"
          type="button"
          className="btn primary full"
          style={{ marginTop: 8 }}
          onClick={handleEnableNotify}
        >
          Enable notifications
        </button>
      </div>

      <div className="card">
        <div className="card-title">Share with GF (free)</div>
        <ol className="small muted" style={{ paddingLeft: 18 }}>
          <li>
            Link: <code>shekhardan.github.io/prep-duel</code>
          </li>
          <li>Same room code, different names</li>
          <li>Firebase for live duel (optional)</li>
        </ol>
        <p id="firebase-status" className="pill" style={{ marginTop: 10, background: syncStatus.background }}>
          {syncStatus.text}
        </p>
      </div>

      <div className="card">
        <div className="card-title">Backup</div>
        <button id="export-data" type="button" className="btn" onClick={handleExportData}>
          Export JSON
        </button>
        <label className="file-label btn ghost">
          Import
          <input
            type="file"
            id="import-data"
            accept=".json"
            hidden
            onChange={(e) => {
              handleImportData(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </section>
  );
}
