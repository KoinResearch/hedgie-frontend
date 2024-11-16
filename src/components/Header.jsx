import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header-navigation">
            <div className="header-container">
                <div className="logo">
                    hedgie.org
                </div>
                <nav className="navigation">
                    <NavLink
                        to="/metrics"
                        className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                        Metrics
                    </NavLink>
                    <NavLink
                        to="/flow"
                        className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                        Flow
                    </NavLink>
                    <NavLink
                        to="/datalab"
                        className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                        DataLab
                    </NavLink>
                    <NavLink
                        to="/blockflow"
                        className={({isActive}) => isActive ? "nav-link active" : "nav-link new-item"}>
                        BlockFlow
                    </NavLink>
                </nav>
            </div>
        </header>
    );
};

export default Header;
