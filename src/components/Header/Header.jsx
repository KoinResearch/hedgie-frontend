import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import Logo from '../../assets/Logo.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Avatar from '../../assets/Avatar.jsx';

const Header = () => {
	const { isAuthenticated } = useAuth();
	const userData = JSON.parse(localStorage.getItem('user') || '{}');
	const navigate = useNavigate();

	const UserAvatar = ({ email }) => {
		const firstLetter = email ? email[0].toUpperCase() : '?';
		return <div className="user-avatar">{firstLetter}</div>;
	};

	const handleMobileAvatarClick = () => {
		if (isAuthenticated) {
			navigate('/profile');
		} else {
			navigate('/login');
		}
	};

	const navigationItems = [
		{ to: '/metrics', label: 'Metrics' },
		{ to: '/flow', label: 'Flow' },
		{ to: '/blockflow', label: 'BlockFlow', isNew: true },
		{ to: '/datalab', label: 'DataLab' },
	];

	const renderNavigationLinks = () => (
		<nav className="header__nav">
			{navigationItems.map(({ to, label, isNew }) => (
				<NavLink
					key={to}
					to={to}
					className={({ isActive }) =>
						`header__nav-link ${isActive ? 'header__nav-link--active' : ''} ${isNew ? 'header__nav-link--new' : ''}`
					}
				>
					{label}
				</NavLink>
			))}
		</nav>
	);

	const renderAuthSection = () => {
		if (isAuthenticated) {
			return (
				<NavLink
					to="/profile"
					className="header__profile-link"
				>
					<UserAvatar email={userData.email} />
				</NavLink>
			);
		}

		return (
			<>
				<NavLink
					to="/login"
					className="header__login-link"
				>
					Log in
				</NavLink>
				<NavLink
					to="/register"
					className="header__register-link"
				>
					Sign up
				</NavLink>
			</>
		);
	};

	return (
		<header className="header">
			<div className="header__container">
				<div className="header__left">
					<div
						className="header__logo"
						onClick={() => navigate('/metrics')}
					>
						<Logo className="header__logo-icon" />
					</div>
					{renderNavigationLinks()}
				</div>

				<nav className="header__right">{renderAuthSection()}</nav>
				<div
					className="header__avatar-mobile"
					onClick={handleMobileAvatarClick}
				>
					{isAuthenticated ? <UserAvatar email={userData.email} /> : <Avatar />}
				</div>
			</div>
		</header>
	);
};

export default Header;
