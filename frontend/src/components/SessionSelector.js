import React, { useState } from "react";
import "./SessionSelector.css";

function SessionSelector({ sessions, selectedSession, onSelect }) {
    return (
        <div className="session-selector">
            {sessions.map((s) => (
                <button
                    key={s._id}
                    onClick={() => onSelect(s)}
                    className={`session-button ${selectedSession?._id === s._id ? "active" : ""}`}
                >
                    {s.createdAt.slice(0,10)} at {s.createdAt.slice(11,16)} &nbsp;&nbsp;&nbsp; {s.name}
                </button>
            ))}
        </div>
    );
}

export default SessionSelector;
