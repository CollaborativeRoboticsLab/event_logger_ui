import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import CurrentSessionPage from "./pages/CurrentSessionPage";
import PastSessionsPage from "./pages/PastSessionsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<CurrentSessionPage />} />
        <Route path="/past" element={<PastSessionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
