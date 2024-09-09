import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './BTCETHBlockTrades.css';

const BTCETHBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [metrics, setMetrics] = useState({
        Call_Buys: 0,
        Call_Sells: 0,
        Put_Buys: 0,
        Put_Sells: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                console.log(`Fetching block trades data for ${asset}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/${asset.toLowerCase()}`);

                if (response.data) {
                    console.log('Data fetched:', response.data);
                    setMetrics(response.data);
                } else {
                    console.warn('No data available');
                    setMetrics({
                        Call_Buys: 0,
                        Call_Sells: 0,
                        Put_Buys: 0,
                        Put_Sells: 0,
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching block trades metrics:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [asset]);

    const assetSymbol = asset === 'BTC' ? '₿' : 'Ξ';

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="flow-container">
            <h2>{asset} Block Trades - Past 24h</h2>
            <div className="flow-content">
                <div className="metrics call-metrics">
                    <div className="metric call-buys">
                        <p className="metric-label">Call Buys</p>
                        <p className="metric-value">{assetSymbol}{metrics.Call_Buys}</p>
                    </div>
                    <div className="metric call-sells">
                        <p className="metric-label">Call Sells</p>
                        <p className="metric-value">{assetSymbol}{metrics.Call_Sells}</p>
                    </div>
                </div>
                <div className="chart">
                    <Plot
                        data={[
                            {
                                values: [metrics.Call_Sells, metrics.Put_Sells, metrics.Put_Buys, metrics.Call_Buys],
                                labels: ['Call Sells', 'Put Sells', 'Put Buys', 'Call Buys'],
                                type: 'pie',
                                hole: 0.4,
                                marker: {colors: ['#007bff', '#6f42c1', '#dc3545', '#28a745']},
                            },
                        ]}
                        layout={{showlegend: false, margin: {t: 0, b: 0, l: 0, r: 0}, autosize: true}}
                        useResizeHandler={true}
                        style={{width: '100%', height: '100%'}}
                    />
                </div>
                <div className="metrics put-metrics">
                    <div className="metric put-buys">
                        <p className="metric-label">Put Buys</p>
                        <p className="metric-value">{assetSymbol}{metrics.Put_Buys}</p>
                    </div>
                    <div className="metric put-sells">
                        <p className="metric-label">Put Sells</p>
                        <p className="metric-value">{assetSymbol}{metrics.Put_Sells}</p>
                    </div>
                </div>
            </div>
            <div className="asset-switcher">
                <button onClick={() => setAsset('BTC')} className={asset === 'BTC' ? 'active' : ''}>BTC</button>
                <button onClick={() => setAsset('ETH')} className={asset === 'ETH' ? 'active' : ''}>ETH</button>
            </div>
        </div>
    );
};

export default BTCETHBlockTrades;
