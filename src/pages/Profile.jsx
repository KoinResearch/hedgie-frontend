import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import './Profile.css';
import Pen from '../assets/Pen';
import Avatar from '../assets/Avatar';
import Lock from '../assets/Lock';
import Arrow from '../assets/Arrow';

const Profile = () => {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(false);

	// useEffect(() => {
	// 	const fetchUserData = async () => {
	// 		try {
	// 			const response = await api.get('/api/auth/me');
	// 			setUserData(response.data.user);
	// 		} catch (error) {
	// 			console.error('Failed to fetch user data:', error);
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};

	// 	fetchUserData();
	// }, []);

	if (loading) {
		return (
			<div className="profile">
				<div className="profile__loading">
					<div className="profile__spinner"></div>
				</div>
			</div>
		);
	}

	const getInitials = (name) => {
		return name
			? name
					.split(' ')
					.map((word) => word[0])
					.join('')
					.toUpperCase()
			: 'U';
	};

	const handleLogout = () => {
		localStorage.clear();
		window.location.href = '/';
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
						{userData?.username || 'Username'}{' '}
						<span className="profile__info-username-role">{userData?.role || 'User'}</span>
					</div>
					<div className="profile__info-email">{userData?.email || 'Username@gmail.com'}</div>
				</div>
				<div className="profile__since">
					<div className="profile__since-left">Member since:</div>
					<div className="profile__since-right">{formatDate(userData?.createdAt || userData?.email)}</div>
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
	);
};

export default Profile;
