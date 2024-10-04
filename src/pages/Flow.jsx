// src/pages/Flow.jsx
import React from 'react';
import FlowFilters from '../components/ForFlowPage/FlowFilters.jsx'; // Импортируем FlowFilters
import "./Flow.css"
const Flow = () => {
    return (
        <div className="flow-container">
            <h1>Option Flow</h1>
            <p>Displays trades since the last settlement at UTC, with filters to search by currency, type, expiration, position size, and premium.</p>
            <FlowFilters /> {/* Добавляем FlowFilters */}
        </div>
    );
};
export default Flow;
