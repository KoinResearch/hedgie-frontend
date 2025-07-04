import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FullName from '../../assets/FullName.jsx';
import Input from '../../components/Input/Input.jsx';
import './ForgotPassword.css';

const ForgotPassword = () => {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleForgotPassword = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
			setMessage('A password reset link has been sent to your email.');
		} catch (error) {
			console.error('Forgot password error:', error);
			setMessage(error.response?.data?.message || 'Failed to send password reset email.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="forgot-password">
			<div className="forgot-password__container">
				<div className="forgot-password__logo">
					<FullName />
				</div>

				<h1 className="forgot-password__title">Forgot Password</h1>
				<p className="forgot-password__description">Enter your email to receive a password reset link</p>

				<form
					onSubmit={handleForgotPassword}
					className="forgot-password__form"
				>
					<Input
						type="email"
						label="Email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<button
						type="submit"
						className="forgot-password__submit-btn"
						disabled={isLoading}
					>
						{isLoading ? 'Sending...' : 'Send Reset Link'}
					</button>

					{message && (
						<div
							className={`forgot-password__message ${
								message.includes('sent') ? 'forgot-password__message--success' : 'forgot-password__message--error'
							}`}
						>
							{message}
						</div>
					)}
				</form>

				<div className="forgot-password__footer">
					<span className="forgot-password__footer-text">Remember your password?</span>
					<button
						className="forgot-password__login-link"
						onClick={() => navigate('/login')}
					>
						Log in
					</button>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
