import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SettingsPage.css";

function SettingsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch session list
  useEffect(() => {
    axios.get("http://localhost:5000/api/sessions")
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Error loading sessions", err));
  }, []);

  // Select all toggle
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(sessions.map((s) => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Single row toggle
  const toggleSingle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete selected
  const handleDelete = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/sessions/delete", {
        ids: selectedIds,
      });
  
      alert(`Deleted ${res.data.deleted} sessions`);
      setSessions((prev) => prev.filter((s) => !selectedIds.includes(s._id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Error deleting sessions", err);
      alert("Failed to delete sessions. Check console for details.");
    }
  };

  return (
    <div className="settings-page">
      <h2>Manage Sessions</h2>
      <table className="session-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedIds.length === sessions.length && sessions.length > 0}
                onChange={toggleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Serial</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(session._id)}
                  onChange={() => toggleSingle(session._id)}
                />
              </td>
              <td>{session.name}</td>
              <td>#{session.serial}</td>
              <td>{new Date(session.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleDelete} disabled={selectedIds.length === 0}>
        Delete Selected
      </button>
    </div>
  );
}

export default SettingsPage;
