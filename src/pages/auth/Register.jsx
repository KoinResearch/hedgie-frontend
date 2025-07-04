import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import FullName from '../../assets/FullName.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Input from '../../components/Input/Input.jsx';

const Register = () => {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleRegister = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		setIsLoading(true);

		try {
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
				email,
				password,
				firstName: username,
				lastName: '',
			});

			localStorage.setItem('accessToken', response.data.accessToken);
			localStorage.setItem('refreshToken', response.data.refreshToken);
			localStorage.setItem('user', JSON.stringify(response.data.user));

			login(response.data.user);
			navigate('/profile');
		} catch (error) {
			console.error('Registration error:', error.response?.data?.message || error.message);
			setError(error.response?.data?.message || 'Registration failed');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="register">
			<div className="register__container">
				<div className="register__logo">
					<FullName />
				</div>

				<h1 className="register__title">Sign Up</h1>
				<p className="register__description">Welcome! Please create your account</p>

				<form
					onSubmit={handleRegister}
					className="register__form"
				>
					{error && <div className="register__error">{error}</div>}

					<Input
						type="email"
						label="Email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<Input
						type="text"
						label="Username"
						placeholder="Enter username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>

					<Input
						type="password"
						label="Password"
						placeholder="Create password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					<Input
						type="password"
						label="Confirm Password"
						placeholder="Confirm password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>

					<button
						type="submit"
						className="register__submit-btn"
						disabled={isLoading}
					>
						{isLoading ? 'Creating Account...' : 'Create Account'}
					</button>
				</form>

				<div className="register__footer">
					<span className="register__footer-text">Already have an account?</span>
					<button
						className="register__login-link"
						onClick={() => navigate('/login')}
					>
						Log In
					</button>
				</div>
			</div>
		</div>
	);
};

export default Register;
