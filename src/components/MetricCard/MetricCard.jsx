import React from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './MetricCard.css';
import Skeleton from '../Skeleton/Skeleton.jsx';

const MetricCard = ({ config, value, loading, error }) => {
	const { icon, labelIcon, tooltipId, tooltipContent, desktopLabel, mobileLabel } = config;

	return (
		<div className="metric-card">
			<div className="metric-card__icon">
				<i className={icon}></i>
			</div>
			<div className="metric-card__content">
				{loading ? (
					<Skeleton />
				) : error ? (
					<div className="metric-card__error">
						<p>Error: {error}</p>
					</div>
				) : (
					<>
						<p
							className="metric-card__label"
							id={tooltipId}
							data-tooltip-html={tooltipContent}
						>
							<div className="metric-card__label-icon">{labelIcon}</div>
							<span className="desktop">{desktopLabel}</span>
							<span className="mobile">{mobileLabel}</span>
						</p>
						<Tooltip anchorId={tooltipId} />
						<p className="metric-card__value">
							{Number(value).toLocaleString(undefined, {
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							})}{' '}
							$
						</p>
					</>
				)}
			</div>
		</div>
	);
};

export default MetricCard;
