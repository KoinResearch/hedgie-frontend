import React from 'react';
import { Camera, ShieldAlert } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './FlowOptionBase.css';

const FlowOptionBase = ({
	title,
	icon,
	tooltipContent,
	children,
	controls = [],
	onDownload,
	downloadId,
	tooltipId
}) => {
	return (
		<div className="flow-option">
			<div className="flow-option__header">
				<div className="flow-option__header-container">
					<h2 className="flow-option__title">
						{icon} {title}
					</h2>

					{onDownload && (
						<>
							<Camera
								className="flow-option__icon"
								id={downloadId}
								onClick={onDownload}
								data-tooltip-html="Export image"
							/>
							<Tooltip
								anchorId={downloadId}
								html={true}
							/>
						</>
					)}

					{tooltipContent && (
						<>
							<ShieldAlert
								className="flow-option__icon"
								id={tooltipId}
								data-tooltip-html={tooltipContent}
							/>
							<Tooltip
								anchorId={tooltipId}
								html={true}
							/>
						</>
					)}

					<div className="flow-option__header-controls-desktop">{controls}</div>
				</div>
				<div className="flow-option__header-controls-mobile">{controls}</div>
				<div className="flow-option__divider"></div>
			</div>
			{children}
		</div>
	);
};

export default FlowOptionBase;
