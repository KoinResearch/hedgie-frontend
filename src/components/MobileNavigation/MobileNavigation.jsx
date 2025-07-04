import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './MobileNavigation.css';
import MetricIcon from '../../assets/MetricIcon';
import FlowIcon from '../../assets/FlowIcon';
import BlockFlowIcon from '../../assets/BlockFlowIcon';
import DataLabIcon from '../../assets/DataLabIcon';
import { isAuthPage } from '../../utils/authUtils';

const MobileNavigation = () => {
	const location = useLocation();
	const [hideNav, setHideNav] = useState(sessionStorage.getItem('hideMobileNavigation') === 'true');

	useEffect(() => {
		const handler = () => {
			setHideNav(sessionStorage.getItem('hideMobileNavigation') === 'true');
		};
		window.addEventListener('hideMobileNavigationChange', handler);
		return () => window.removeEventListener('hideMobileNavigationChange', handler);
	}, []);

	if (hideNav) return null;
	if (isAuthPage(location.pathname)) return null;

	const navigationItems = [
		{ to: '/metrics', label: 'Metrics', icon: MetricIcon },
		{ to: '/flow', label: 'Flow', icon: FlowIcon },
		{ to: '/blockflow', label: 'BlockFlow', icon: BlockFlowIcon },
		{ to: '/datalab', label: 'DataLab', icon: DataLabIcon },
	];

	return (
		<nav className="mobile-navigation">
			{navigationItems.map(({ to, label, icon: IconComponent }) => (
				<NavLink
					key={to}
					to={to}
					className={({ isActive }) => `mobile-navigation__item ${isActive ? 'mobile-navigation__item--active' : ''}`}
				>
					{({ isActive }) => (
						<>
							<span className="mobile-navigation__icon">
								<IconComponent color={isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(157, 166, 181, 1)'} />
							</span>
							<span className="mobile-navigation__label">{label}</span>
						</>
					)}
				</NavLink>
			))}
		</nav>
	);
};

export default MobileNavigation;
