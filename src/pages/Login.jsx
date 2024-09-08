import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Auth.css";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5003/api/login', {
                email,
                password
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.token); // Сохраняем токен в локальное хранилище
                navigate('/home'); // Перенаправление на домашнюю страницу
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("There was an error logging in!", error);
            alert("Login failed");
        }
    };

    return (
        <div className="auth-container">
            <h1>Sign in to your account</h1>
            <form onSubmit={handleLogin} className="auth-form">
                <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default Login;
