import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';
import Pen from '../assets/Pen';
import Avatar from '../assets/Avatar';
import Lock from '../assets/Lock';
import Arrow from '../assets/Arrow';

const Profile = () => {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [authProcessing, setAuthProcessing] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { login, user } = useAuth();

	useEffect(() => {
		const handleTwitterAuth = async () => {
			const urlParams = new URLSearchParams(location.search);
			const twitterAuthToken = urlParams.get('twitter_auth');

			if (twitterAuthToken) {
				console.log('🟦 Processing Twitter auth token...');
				setAuthProcessing(true);

				try {
					const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/twitter/exchange`, {
						tempToken: twitterAuthToken
					});

					console.log('🟦 Twitter auth successful');

					localStorage.setItem('accessToken', response.data.accessToken);
					localStorage.setItem('refreshToken', response.data.refreshToken);
					localStorage.setItem('user', JSON.stringify(response.data.user));

					login(response.data.user);
					setUserData(response.data.user);

					navigate('/profile', { replace: true });

				} catch (error) {
					console.error('Twitter auth exchange error:', error);
					navigate('/login?error=twitter_exchange_failed');
				} finally {
					setAuthProcessing(false);
					setLoading(false);
				}
			} else if (user) {
				setUserData(user);
				setLoading(false);
			} else {
				const storedUser = localStorage.getItem('user');
				const storedToken = localStorage.getItem('accessToken');

				if (storedUser && storedToken) {
					try {
						const parsedUser = JSON.parse(storedUser);
						setUserData(parsedUser);
						login(parsedUser);
					} catch (error) {
						console.error('Error parsing stored user:', error);
						navigate('/login');
					}
				} else {
					navigate('/login');
				}
				setLoading(false);
			}
		};

		handleTwitterAuth();
	}, [location, navigate, login, user]);

	if (loading || authProcessing) {
		return (
			<div className="profile">
				<div className="profile__content">
					<div style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '200px',
						color: 'white',
						fontSize: '16px'
					}}>
						{authProcessing ? 'Completing authentication...' : 'Loading profile...'}
					</div>
				</div>
			</div>
		);
	}

	const handleLogout = () => {
		localStorage.clear();
		login(null);
		window.location.href = '/login';
	};

	const handleEditProfile = () => {
		console.log('Edit profile clicked');
		alert('Edit profile functionality will be implemented soon');
	};

	const handleChangePassword = () => {
		console.log('Change password clicked');
		alert('Change password functionality will be implemented soon');
	};

	const formatDate = (dateString) => {
		if (!dateString) return '1/1/2025';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				month: 'numeric',
				day: 'numeric',
				year: 'numeric',
			});
		} catch (error) {
			return '1/1/2025';
		}
	};

	const displayName = userData?.firstName || userData?.username || userData?.first_name || 'User';
	const displayEmail = userData?.email || 'user@example.com';
	const displayRole = userData?.role || 'USER';
	const memberSince = userData?.createdAt || userData?.created_at || new Date().toISOString();

	return (
		<div className="profile">
			<div className="profile__content">
				<div
					className="profile__edit-btn"
					onClick={handleEditProfile}
				>
					<Pen /> Edit Profile
				</div>

				<div className="profile__info">
					<Avatar
						width={56}
						height={56}
					/>
					<div className="profile__info-username">
						{displayName}
						<span className="profile__info-username-role">{displayRole}</span>
					</div>
					<div className="profile__info-email">{displayEmail}</div>
				</div>

				<div className="profile__since">
					<div className="profile__since-left">Member since:</div>
					<div className="profile__since-right">{formatDate(memberSince)}</div>
				</div>

				<div
					className="profile__change-password-btn"
					onClick={handleChangePassword}
				>
					<div className="profile__change-password-btn-left">
						<Lock /> Change Password
					</div>
					<div className="profile__change-password-btn-right">
						<Arrow />
					</div>
				</div>

				<div className="profile__footer">
					<div
						className="profile__logout-btn"
						onClick={handleLogout}
					>
						Log Out
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
