import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';
import Pen from '../assets/Pen';
import Avatar from '../assets/Avatar';
import Lock from '../assets/Lock';
import Arrow from '../assets/Arrow';

const Profile = () => {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const { user } = useAuth();

	useEffect(() => {
		if (user) {
			setUserData(user);
			setLoading(false);
		} else {
			// Проверяем localStorage
			const storedUser = localStorage.getItem('user');
			const storedToken = localStorage.getItem('accessToken');

			if (storedUser && storedToken) {
				try {
					const parsedUser = JSON.parse(storedUser);
					setUserData(parsedUser);
				} catch (error) {
					console.error('Error parsing stored user:', error);
					navigate('/login');
				}
			} else {
				navigate('/login');
			}
			setLoading(false);
		}
	}, [user, navigate]);

	if (loading) {
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
						Loading profile...
					</div>
				</div>
			</div>
		);
	}

	const handleLogout = () => {
		localStorage.clear();
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
