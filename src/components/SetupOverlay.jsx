import { useState } from "react";
import { usePrep } from "../context/PrepContext.jsx";

export default function SetupOverlay() {
  const { showSetup, handleSetupSave } = usePrep();
  const [name, setName] = useState("");
  const [partner, setPartner] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  if (!showSetup) return null;

  const onJoin = () => {
    if (!name.trim() || !partner.trim() || !room.trim()) {
      setError("All three fields are required to join your room.");
      return;
    }
    setError("");
    handleSetupSave(name, partner, room);
  };

  return (
    <div id="setup-overlay" className="overlay setup-overlay" role="dialog" aria-modal="true">
      <div className="modal setup-modal">
        <div className="setup-badge">PrepDuel</div>
        <h2>Join your study room</h2>
        <p className="small muted">
          Enter once — we&apos;ll remember you on this device until you log out. Same{" "}
          <strong>room code</strong> on both phones = live duel.
        </p>

        {error && <p className="setup-error small">{error}</p>}

        <label>
          Your name{" "}
          <input
            id="setup-name"
            type="text"
            placeholder="Chandra"
            maxLength={24}
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Partner name{" "}
          <input
            id="setup-partner"
            type="text"
            placeholder="Her name"
            maxLength={24}
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
          />
        </label>
        <label>
          Room code{" "}
          <input
            id="setup-room"
            type="text"
            placeholder="e.g. DAN2026"
            maxLength={16}
            value={room}
            onChange={(e) => setRoom(e.target.value.toUpperCase())}
          />
        </label>

        <button id="setup-save" type="button" className="btn primary full" onClick={onJoin}>
          Join room
        </button>

        <p className="setup-note small muted">
          XP, streak &amp; roadmap stay saved on this phone even after logout.
        </p>
      </div>
    </div>
  );
}
