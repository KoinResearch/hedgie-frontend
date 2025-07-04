import React from 'react';
import FlowContent from '../components/Flow/FlowContent';
import './Flow.css';

const Flow = () => {
	return (
		<div className="flow">
			<h1 className="flow__title">Option Flow</h1>
			<p className="flow__description">
				Displays trades since the last settlement at UTC, with filters to search by currency, type, expiration, position
				size, and premium.
			</p>
			<FlowContent />
		</div>
	);
};

export default Flow;
