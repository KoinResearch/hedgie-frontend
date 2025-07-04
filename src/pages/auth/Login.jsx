import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import FullName from '../../assets/FullName.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';
import Input from '../../components/Input/Input.jsx';

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
				password,
			});

			localStorage.setItem('accessToken', response.data.accessToken);
			localStorage.setItem('refreshToken', response.data.refreshToken);
			localStorage.setItem('user', JSON.stringify(response.data.user));

			login(response.data.user);
			navigate('/profile');
		} catch (error) {
			console.error('Login error:', error);
			alert(error.response?.data?.message || 'Login failed');
		}
	};

	const handleGoogleSuccess = async (credentialResponse) => {
		try {
			console.log('Google response:', credentialResponse);

			const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
				credential: credentialResponse.credential,
			});

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
		<div className="login">
			<div className="login__container">
				<h2 className="login__logo">
					<FullName />
				</h2>
				<h1 className="login__title">Log in</h1>
				<p className="login__description">Welcome back! Please Log in to your account</p>

				<form
					onSubmit={handleLogin}
					className="login__form"
				>
					<Input
						type="email"
						label="Email"
						placeholder="Enter email address"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<Input
						type="password"
						label="Password"
						placeholder="Enter password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					<div className="login__forgot-container">
						<button
							type="button"
							className="login__forgot-link"
							onClick={() => navigate('/forgot-password')}
						>
							Forgot password
						</button>
					</div>

					<button
						type="submit"
						className="login__submit-btn"
					>
						Log in
					</button>

					<div className="login__social">
						<GoogleLogin
							onSuccess={handleGoogleSuccess}
							onError={() => {
								console.log('Google Login Failed');
							}}
							useOneTap={false}
							auto_select={false}
							prompt="select_account"
							text="signin_with"
							theme="filled_black"
							locale="ru"
							type="standard"
							shape="circle"
							size="large"
							ux_mode="popup"
							context="signin"
						/>
					</div>
				</form>

				<div className="login__footer">
					<span className="login__footer-text">Don't have an account?</span>
					<button
						className="login__signup-link"
						onClick={() => navigate('/register')}
					>
						Sign up
					</button>
				</div>
			</div>
		</div>
	);
};

export default Login;
