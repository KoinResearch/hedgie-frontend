import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FullName from "../components/icon/FullName.jsx";
import "./Login.css";

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                token,
                newPassword: password
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="auth-container">
            <h2 className="login-title"><FullName/></h2>
            <h1 className="login-auth-form-title">Reset Password</h1>
            <div className="login-auth-form-descripption">Please enter your new password</div>
            {success ? (
                <div className="success-message">
                    Password has been reset successfully! Redirecting to login...
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="title-for-input">New Password</div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                    />

                    <div className="title-for-input">Confirm New Password</div>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                    />

                    <button type="submit">Reset Password</button>
                </form>
            )}
            <div className="footer-text-login">
                Remember your password? <button className="sign-up-text" onClick={() => navigate('/login')}>Log in</button>
            </div>
        </div>
    );
};

export default ResetPassword;