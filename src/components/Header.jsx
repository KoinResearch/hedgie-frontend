import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import Logo from './icon/Logo.jsx';
import {useAuth} from "./AuthContext.jsx";

const Header = () => {
    const { isAuthenticated, user } = useAuth();
    // Проверяем наличие токена для определения статуса аутентификации
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <header className="header-navigation">
            <div className="header-container">
                <div className="left-side">
                    <div className="logo-container">
                        <Logo className="logo"/>
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
                            to="/blockflow"
                            className={({isActive}) => isActive ? "nav-link active" : "nav-link new-item"}>
                            BlockFlow
                        </NavLink>
                        <NavLink
                            to="/datalab"
                            className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                            DataLab
                        </NavLink>
                    </nav>
                </div>
                <nav className="right-side">
                    {isAuthenticated ? (
                        // Если пользователь авторизован
                        <NavLink
                            to="/profile"
                            className="nav-link-profile">
                            Profile {userData.email ? `(${userData.email})` : ''}
                        </NavLink>
                    ) : (
                        // Если пользователь не авторизован
                        <>
                            <NavLink
                                to="/login"
                                className="nav-link-login">
                                Log in
                            </NavLink>
                            <NavLink
                                to="/register"
                                className="nav-link-register">
                                Sign up
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;