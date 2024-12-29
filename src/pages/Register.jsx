import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Auth.css";
import FullName from "../components/icon/FullName.jsx";

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                email,
                password,
                firstName: username,
                lastName: ''
            });

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            // Редирект на профиль
            navigate('/profile');
        } catch (error) {
            console.error("Registration error:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="auth-container">
            <h2 className="login-title"><FullName/></h2>
            <h1 className="login-auth-form-title">Sign Up</h1>
            <div className="login-auth-form-descripption">Welcome! Please create your account</div>
            <form onSubmit={handleRegister} className="auth-form">
                <div className="title-for-input">Email</div>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <div className="title-for-input">Username</div>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <div className="title-for-input">Password</div>
                <input
                    type="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="title-for-input">Confirm Password</div>
                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="submit">Create Account</button>
            </form>
            <div className="footer-text-login">Already have an account? <button className="sign-up-text" onClick={() => navigate('/login')}
            >Log In</button>
            </div>
        </div>
    );
};

export default Register;
