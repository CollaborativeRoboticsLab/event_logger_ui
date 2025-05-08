import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SessionPopup.css";

function SessionPopup({ onSelect }) {
  const [sessions, setSessions] = useState([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSerial, setNewSerial] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/sessions")
      .then((res) => {
        setSessions(res.data);
        setNewSerial(res.data.length > 0 ? res.data[0].serial + 1 : 0);
      });
  }, []);

  const handleCreateSession = async () => {
    const res = await axios.post("http://localhost:5000/api/sessions?listen=true", {
      name: newSessionName,
    });
    onSelect({ ...res.data, isNewSession: true });
  };

  const handleLoadSession = () => {
    if (selectedSession) {
      onSelect({ ...selectedSession, isNewSession: false });
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Create New Session</h2>
        <p>Serial: {newSerial}</p>
        <input
          placeholder="Enter unique session name"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
        />
        <button
          onClick={handleCreateSession}
          disabled={!newSessionName.trim()}
          title="Start a new live session"
        >
          Create New Session
        </button>

        <hr />

        <h2>Or Load Previous Session</h2>
        <div className="session-list">
          {sessions.map((session) => (
            <div
              key={session._id}
              className={`session-list-item ${selectedSession?._id === session._id ? "selected" : ""}`}
              onClick={() => setSelectedSession(session)}
              title={`Click to select session "${session.name}"`}
            >
              <strong>{session.name}</strong> — #{session.serial} —{" "}
              {new Date(session.createdAt).toLocaleString()}
            </div>
          ))}
        </div>

        <button
          onClick={handleLoadSession}
          disabled={!selectedSession}
          title="View past session"
        >
          Load Selected Session
        </button>
      </div>
    </div>
  );
}

export default SessionPopup;
