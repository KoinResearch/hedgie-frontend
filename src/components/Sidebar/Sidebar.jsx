import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';
import DataLabIcon from '../../assets/DataLabIcon';
import BlockFlowIcon from '../../assets/BlockFlowIcon';
import FlowIcon from '../../assets/FlowIcon';
import MetricIcon from '../../assets/MetricIcon';

const iconMap = {
	overview: DataLabIcon,
	blockTrades: BlockFlowIcon,
	openInterest: FlowIcon,
	volume: MetricIcon,
};

const Sidebar = ({ items = [] }) => {
	const location = useLocation();

	const isActive = (itemPath) => {
		const currentPath = location.pathname;
		if (itemPath === 'overview') {
			return currentPath === '/metrics' || currentPath === '/metrics/' || currentPath === '/metrics/overview';
		}
		return currentPath === `/metrics/${itemPath}`;
	};

	return (
		<div className="sidebar">
			<ul className="sidebar__list">
				{items.map((item) => {
					const IconComponent = iconMap[item.key] || DataLabIcon;
					const active = isActive(item.path);

					return (
						<li
							key={item.key}
							className="sidebar__item"
						>
							<NavLink
								to={item.path}
								className={`sidebar__link ${active ? 'sidebar__link--active' : ''}`}
							>
								<span className="sidebar__icon">
									<IconComponent />
								</span>
								{item.title.replace(' Dashboard', '')}
							</NavLink>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default Sidebar;
