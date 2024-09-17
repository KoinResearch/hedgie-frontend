// src/components/ForMetricsPage/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <ul>
                <li><Link to="overview">Overview</Link></li>
                <li><Link to="block-trades">Block Trades</Link></li>
                <li><Link to="open-interest">Open Interest</Link></li>
                <li><Link to="volume">Volume</Link></li>
            </ul>
        </div>
    );
};

export default Sidebar;
