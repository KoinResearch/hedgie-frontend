// components/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Проверяем авторизацию при загрузке
        const token = localStorage.getItem('accessToken');
        const userData = JSON.parse(localStorage.getItem('user'));
        if (token && userData) {
            setIsAuthenticated(true);
            setUser(userData);
        }
    }, []);

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUser(null);
    };

    // Добавим в value все необходимые значения
    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        setIsAuthenticated,
        setUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};