import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KeyMetricsBlockTrades.css';

const KeyMetricsBlockTrades = () => {
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
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/key-metrics/${asset.toLowerCase()}`);
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
        <div className="metrics-key-container">
            <div className="asset-key-buttons">
                <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                    <option value="BTC">Bitcoin</option>
                    <option value="ETH">Ethereum</option>
                </select>
                <span className="custom-arrow">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667" stroke-linecap="round"
                  stroke-linejoin="round"/>
        </svg>
    </span>
            </div>
            <div className="metrics-key-grid">
                <div className="metric-key-block">
                    <div className="icon-container">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="metric-key-content">
                        <p className="metric-label">
                            <div className="metric-label-image">🤑</div>
                            Average Price
                        </p>
                        <p className="metric-value">{metrics.avg_price.toFixed(2)} $</p>
                    </div>

                </div>
                <div className="metric-key-block">
                    <div className="icon-container">
                        <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="metric-key-content">
                        <p className="metric-label">
                            <div className="metric-label-image">📊</div>
                            Total Volume
                        </p>
                        <p className="metric-value">{metrics.total_nominal_volume.toFixed(2)}</p> {/* Исправлено */}
                    </div>
                </div>
                <div className="metric-key-block">
                    <div className="icon-container">
                        <i className="fas fa-coins"></i>
                    </div>
                    <div className="metric-key-content">
                        <p className="metric-label">
                            <div className="metric-label-image">📈</div>
                            Total Premium
                        </p>
                        <p className="metric-value">{metrics.total_premium.toFixed(2)} $</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyMetricsBlockTrades;
