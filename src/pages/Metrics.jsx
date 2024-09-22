// src/pages/Metrics.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/ForMetricsPage/Sidebar';
import Overview from '../subpages/Overview';
import BlockTrades from '../subpages/BlockTrades';
import OpenInterest from '../subpages/OpenInterest';
import Volume from '../subpages/Volume';
import './Metrics.css';

const Metrics = () => {
    return (
        <div className="metrics-page-container">
            <Sidebar />
            <div className="content">
                <div className="divider"></div> {/* Разделитель */}
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="block-trades" element={<BlockTrades />} />
                    <Route path="open-interest" element={<OpenInterest />} />
                    <Route path="volume" element={<Volume />} />
                </Routes>
            </div>
        </div>
    );
};

export default Metrics;
