import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css'; // Обязательно подключите CSS для отображения тултипов
import './KeyMetrics.css';

const KeyMetrics = () => {
    const [asset, setAsset] = useState('BTC');
    const [metrics, setMetrics] = useState({
        avg_price: 0,
        total_nominal_volume: 0,
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
                    total_nominal_volume: Number(data.total_nominal_volume) || 0,
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
                    {loading && <div className="loading-container"><div className="spinner-small"></div></div>}
                        {error && <div className="error-container"><p>Error: {error}</p></div>}
                        {!loading && !error && (
                            <div className="metric-key-content">
                                <p className="metric-label" id="avgPrice" data-tooltip-content="Average price of transactions for 24h.">
                                    <div className="metric-label-image">🤑</div>
                                    Average Price
                                </p>
                                <Tooltip anchorId="avgPrice" />
                                <p className="metric-value">
                                    {Number(metrics.avg_price).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })} $
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="metric-key-block">
                    <div className="icon-container">
                        <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="metric-key-content">
                        {loading && <div className="loading-container"><div className="spinner-small"></div></div>}
                        {error && <div className="error-container"><p>Error: {error}</p></div>}
                        {!loading && !error && (
                            <div className="metric-key-content">
                                <p className="metric-label" id="totalVolume" data-tooltip-content="Nominal volume for 24h.">
                                    <div className="metric-label-image">📊</div>
                                    Total Volume
                                </p>
                                <Tooltip anchorId="totalVolume" />
                                <p className="metric-value">
                                    {Number(metrics.total_nominal_volume).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })} $
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="metric-key-block">
                    <div className="icon-container">
                        <i className="fas fa-coins"></i>
                    </div>
                    <div className="metric-key-content">
                        {loading && <div className="loading-container"><div className="spinner-small"></div></div>}
                        {error && <div className="error-container"><p>Error: {error}</p></div>}
                        {!loading && !error && (
                            <div className="metric-key-content">
                                <p className="metric-label" id="totalPremium" data-tooltip-content="Premium paid for 24h.">
                                    <div className="metric-label-image">📈</div>
                                    Total Premium
                                </p>
                                <Tooltip anchorId="totalPremium" />
                                <p className="metric-value">
                                    {Number(metrics.total_premium).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })} $
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyMetrics;
