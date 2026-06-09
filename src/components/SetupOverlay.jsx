import { useState } from "react";
import { usePrep } from "../context/PrepContext.jsx";

export default function SetupOverlay() {
  const { showSetup, handleSetupSave } = usePrep();
  const [name, setName] = useState("");
  const [partner, setPartner] = useState("");
  const [room, setRoom] = useState("");

  return (
    <div id="setup-overlay" className={`overlay${showSetup ? "" : " hidden"}`}>
      <div className="modal">
        <h2>Welcome to PrepDuel</h2>
        <p className="small muted">
          Your progress saves on this phone. Same <strong>room code</strong> + Firebase = live duel
          with your GF.
        </p>
        <label>
          Your name{" "}
          <input
            id="setup-name"
            type="text"
            placeholder="Chandra"
            maxLength={24}
            value={name}
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
          Room code (both phones, same code){" "}
          <input
            id="setup-room"
            type="text"
            placeholder="e.g. DAN2026"
            maxLength={16}
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </label>
        <button
          id="setup-save"
          type="button"
          className="btn primary full"
          onClick={() => handleSetupSave(name, partner, room)}
        >
          Start studying
        </button>
      </div>
    </div>
  );
}
