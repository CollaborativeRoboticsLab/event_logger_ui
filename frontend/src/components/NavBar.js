import React from "react";
import { NavLink } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-link">Current Session</NavLink>
      <NavLink to="/past" className="nav-link">Past Sessions</NavLink>
      <NavLink to="/settings" className="nav-link">Settings</NavLink>
    </nav>
  );
}

export default NavBar;
