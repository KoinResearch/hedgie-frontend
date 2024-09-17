import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KeyMetrics.css';

const KeyMetrics = () => {
    const [asset, setAsset] = useState('BTC');
    const [metrics, setMetrics] = useState({
        avg_price: 0,
        total_nominal_volume: 0, // Исправляем имя поля на корректное
        total_premium: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/key-metrics/${asset.toLowerCase()}`);
                const data = response.data;

                setMetrics({
                    avg_price: Number(data.avg_price) || 0,
                    total_nominal_volume: Number(data.total_nominal_volume) || 0, // Правильное имя
                    total_premium: Number(data.total_premium) || 0,
                });
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [asset]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="metrics-container">
            <h2>Key Metrics - Past 24h</h2>
            <div className="asset-buttons">
                <button onClick={() => setAsset('BTC')} className={asset === 'BTC' ? 'active' : ''}>BTC</button>
                <button onClick={() => setAsset('ETH')} className={asset === 'ETH' ? 'active' : ''}>ETH</button>
            </div>
            <div className="metrics-grid">
                <div className="metric-block purple">
                    <div className="icon-container">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="metric-content">
                        <p className="metric-value">{metrics.avg_price.toFixed(2)} $</p>
                        <p className="metric-label">Average Price</p>
                    </div>
                </div>
                <div className="metric-block blue">
                    <div className="icon-container">
                        <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="metric-content">
                        <p className="metric-value">{metrics.total_nominal_volume.toFixed(2)}</p> {/* Исправлено */}
                        <p className="metric-label">Total Volume</p>
                    </div>
                </div>
                <div className="metric-block red">
                    <div className="icon-container">
                        <i className="fas fa-coins"></i>
                    </div>
                    <div className="metric-content">
                        <p className="metric-value">{metrics.total_premium.toFixed(2)} $</p>
                        <p className="metric-label">Total Premium</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyMetrics;
