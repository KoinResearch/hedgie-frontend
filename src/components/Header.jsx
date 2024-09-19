import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                hedgie.org
            </div>
            <nav className="navigation">
                <NavLink
                    to="/metrics"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Metrics
                </NavLink>
                <NavLink
                    to="/flow"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link new-item"}>
                    Flow
                </NavLink>
                <NavLink
                    to="/datalab"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link new-item"}>
                    DataLab
                </NavLink>
            </nav>
            <div className="auth-links">
                <NavLink
                    to="/signin"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Sign In
                </NavLink>
                <NavLink
                    to="/signup"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Sign Up
                </NavLink>
            </div>
        </header>
    );
};

export default Header;
