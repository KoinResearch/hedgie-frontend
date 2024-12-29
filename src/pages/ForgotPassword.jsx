import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FullName from "../components/icon/FullName.jsx";
import "./Login.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
            setMessage('A password reset link has been sent to your email.');
        } catch (error) {
            console.error('Forgot password error:', error);
            setMessage(error.response?.data?.message || 'Failed to send password reset email.');
        }
    };

    return (
        <div className="auth-container">
            <h2 className="login-title"><FullName/></h2>
            <h1 className="login-auth-form-title">Forgot Password</h1>
            <div className="login-auth-form-descripption">
                Enter your email to receive a password reset link
            </div>
            <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="title-for-input">Email</div>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send Reset Link</button>
                {message && <div className="message">{message}</div>}
            </form>
            <div className="footer-text-login">
                Remember your password? <button className="sign-up-text" onClick={() => navigate('/login')}>Log in</button>
            </div>
        </div>
    );
};

export default ForgotPassword;