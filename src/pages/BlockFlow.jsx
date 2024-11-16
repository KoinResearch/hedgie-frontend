import React from 'react';
import BlockFlowFilters from '../components/ForBlockFlowPage/BlockFlowFilters.jsx';
import "./BlockFlow.css"
const BlockFlow = () => {
    return (
        <div className="flow-container">
            <h1>Block Flow</h1>
            <p>Displays trades since the last settlement at UTC, with filters to search by currency, type, expiration, position size, and premium.</p>
            <BlockFlowFilters />
        </div>
    );
};
export default BlockFlow;
