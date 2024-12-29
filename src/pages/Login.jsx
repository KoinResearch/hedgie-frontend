import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import FullName from "../components/icon/FullName.jsx";
import {useAuth} from "../components/AuthContext.jsx";
import {GoogleLogin} from "@react-oauth/google";
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                email,
                password
            });

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Обновляем глобальное состояние
            login(response.data.user);

            navigate('/profile');
        } catch (error) {
            console.error("Login error:", error);
            alert(error.response?.data?.message || "Login failed");
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('Google response:', credentialResponse); // Для отладки

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/google`,
                { credential: credentialResponse.credential }
            );

            console.log('Server response:', response.data); // Для отладки

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            login(response.data.user);
            navigate('/profile');
        } catch (error) {
            console.error('Google login error:', error.response?.data || error);
            alert('Failed to login with Google');
        }
    };


    return (
        <div className="auth-container">
            <h2 className="login-title"><FullName/></h2>
            <h1 className="login-auth-form-title">Log in</h1>
            <div className="login-auth-form-descripption">Welcome back! Please Log in to your account</div>
            <form onSubmit={handleLogin} className="auth-form">
                <div className="title-for-input">Email</div>
                <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <div className="title-for-input">Password</div>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    className="forgot-text"
                    onClick={() => navigate('/forgot-password')}
                >
                    Forgot password
                </button>
                <button type="submit">Log in</button>
                <div className="social-login">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            console.log('Google Login Failed');
                        }}
                        useOneTap={false}
                        auto_select={false}
                        cookiePolicy={'single_host_origin'}
                        text="signin_with"
                        theme="filled_black"
                        locale="ru"
                        type="standard"
                        shape="rectangular"
                        width="360"
                        prompt="select_account"        // Добавляем это
                        cancel_on_tap_outside={false}  // И это
                        select_account={true}          // И это
                    />
                </div>
            </form>
            <div className="footer-text-login">Don't have an account? <button
                className="sign-up-text"
                onClick={() => navigate('/register')}
            >
                Sign up
            </button>
            </div>
        </div>
    );
};

export default Login;
