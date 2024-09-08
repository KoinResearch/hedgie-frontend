// src/pages/Flow.jsx
import React from 'react';
import FlowFilters from '../components/ForFlowPage/FlowFilters.jsx'; // Импортируем FlowFilters

const Flow = () => {
    return (
        <div style={styles.container}>
            <h1>Option Flow</h1>
            <p>Displays trades since the last settlement at 4 UTC, with filters to search by currency, type, expiration, position size, and premium.</p>
            <FlowFilters /> {/* Добавляем FlowFilters */}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
    },
};

export default Flow;
