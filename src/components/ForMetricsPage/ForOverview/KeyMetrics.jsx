import React, {useState, useEffect} from 'react';
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
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z"
                                    fill="#162C49"/>
                                <path
                                    d="M17 21V29M21.5 21V29M26.5 21V29M31 21V29M15 30.6L15 31.4C15 31.96 15 32.2401 15.109 32.454C15.2049 32.6421 15.3578 32.7951 15.546 32.891C15.7599 33 16.0399 33 16.6 33H31.4C31.9601 33 32.2401 33 32.454 32.891C32.6422 32.7951 32.7951 32.6421 32.891 32.454C33 32.2401 33 31.96 33 31.4V30.6C33 30.0399 33 29.7599 32.891 29.546C32.7951 29.3578 32.6422 29.2049 32.454 29.109C32.2401 29 31.9601 29 31.4 29H16.6C16.0399 29 15.7599 29 15.546 29.109C15.3578 29.2049 15.2049 29.3578 15.109 29.546C15 29.7599 15 30.0399 15 30.6ZM23.6529 15.0771L16.2529 16.7216C15.8059 16.8209 15.5823 16.8706 15.4155 16.9908C15.2683 17.0968 15.1527 17.2409 15.0811 17.4076C15 17.5965 15 17.8255 15 18.2835L15 19.4C15 19.96 15 20.2401 15.109 20.454C15.2049 20.6421 15.3578 20.7951 15.546 20.891C15.7599 21 16.0399 21 16.6 21H31.4C31.9601 21 32.2401 21 32.454 20.891C32.6422 20.7951 32.7951 20.6421 32.891 20.454C33 20.2401 33 19.96 33 19.4V18.2835C33 17.8255 33 17.5965 32.9188 17.4076C32.8473 17.2409 32.7317 17.0968 32.5845 16.9908C32.4177 16.8706 32.1942 16.8209 31.7471 16.7216L24.3471 15.0771C24.2176 15.0483 24.1528 15.0339 24.0874 15.0282C24.0292 15.0231 23.9708 15.0231 23.9126 15.0282C23.8472 15.0339 23.7824 15.0483 23.6529 15.0771Z"
                                    stroke="#5491DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
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
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z"
                                    fill="#162C49"/>
                                <path
                                    d="M24.9999 14L16.0933 24.6879C15.7445 25.1064 15.5701 25.3157 15.5674 25.4925C15.5651 25.6461 15.6336 25.7923 15.7531 25.8889C15.8906 26 16.163 26 16.7079 26H23.9999L22.9999 34L31.9064 23.3121C32.2552 22.8936 32.4296 22.6843 32.4323 22.5075C32.4346 22.3539 32.3661 22.2077 32.2466 22.1111C32.1091 22 31.8367 22 31.2918 22H23.9999L24.9999 14Z"
                                    stroke="#5491DF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
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
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z"
                                    fill="#162C49"/>
                                <g filter="url(#filter0_d_33_1755)">
                                    <path
                                        d="M29.8778 32.0902C28.1693 33.3315 26.1117 34 23.9999 34C21.8881 34 19.8305 33.3315 18.1221 32.0902M28.3836 15.0121C30.2817 15.9378 31.838 17.4407 32.8294 19.3053C33.8208 21.1699 34.1965 23.3005 33.9026 25.3917M14.0973 25.3916C13.8034 23.3004 14.1791 21.1698 15.1705 19.3052C16.162 17.4406 17.7182 15.9377 19.6163 15.012M29.4999 24C29.4999 27.0376 27.0375 29.5 23.9999 29.5C20.9623 29.5 18.4999 27.0376 18.4999 24C18.4999 20.9624 20.9623 18.5 23.9999 18.5C27.0375 18.5 29.4999 20.9624 29.4999 24Z"
                                        stroke="#5491DF" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                </g>
                                <defs>
                                    <filter id="filter0_d_33_1755" x="8" y="12" width="32" height="32"
                                            filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                        <feColorMatrix in="SourceAlpha" type="matrix"
                                                       values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                       result="hardAlpha"/>
                                        <feOffset dy="4"/>
                                        <feGaussianBlur stdDeviation="2"/>
                                        <feComposite in2="hardAlpha" operator="out"/>
                                        <feColorMatrix type="matrix"
                                                       values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                                        <feBlend mode="normal" in2="BackgroundImageFix"
                                                 result="effect1_dropShadow_33_1755"/>
                                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_33_1755"
                                                 result="shape"/>
                                    </filter>
                                </defs>
                            </svg>

                            Total Premium
                        </p>
                        <p className="metric-value">{metrics.total_premium.toFixed(2)} $</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyMetrics;
