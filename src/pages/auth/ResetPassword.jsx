import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FullName from '../../assets/FullName.jsx';
import Input from '../../components/Input/Input.jsx';
import './ResetPassword.css';

const ResetPassword = () => {
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { token } = useParams();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		setIsLoading(true);

		try {
			await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
				token,
				newPassword: password,
			});

			setSuccess(true);
			setTimeout(() => {
				navigate('/login');
			}, 3000);
		} catch (error) {
			setError(error.response?.data?.message || 'Failed to reset password');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="reset-password">
			<div className="reset-password__container">
				<div className="reset-password__logo">
					<FullName />
				</div>

				<h1 className="reset-password__title">Reset Password</h1>
				<p className="reset-password__description">Please enter your new password</p>

				{success ? (
					<div className="reset-password__success">Password has been reset successfully! Redirecting to login...</div>
				) : (
					<form
						onSubmit={handleSubmit}
						className="reset-password__form"
					>
						{error && <div className="reset-password__error">{error}</div>}

						<Input
							type="password"
							label="New Password"
							placeholder="Enter new password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>

						<Input
							type="password"
							label="Confirm New Password"
							placeholder="Confirm new password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>

						<button
							type="submit"
							className="reset-password__submit-btn"
							disabled={isLoading}
						>
							{isLoading ? 'Resetting...' : 'Reset Password'}
						</button>
					</form>
				)}

				<div className="reset-password__footer">
					<span className="reset-password__footer-text">Remember your password?</span>
					<button
						className="reset-password__login-link"
						onClick={() => navigate('/login')}
					>
						Log in
					</button>
				</div>
			</div>
		</div>
	);
};

export default ResetPassword;
