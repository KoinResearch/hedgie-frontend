import React from 'react';
import BlockFlowContent from '../components/BlockFlow/BlockFlowContent.jsx';
import './BlockFlow.css';

const BlockFlow = () => {
	return (
		<div className="block-flow">
			<h1 className="block-flow__title">Block Flow</h1>
			<p className="block-flow__description">
				Displays block trades since the last settlement at UTC, with filters to search by currency, type, expiration,
				position size, and premium.
			</p>
			<BlockFlowContent />
		</div>
	);
};

export default BlockFlow;
