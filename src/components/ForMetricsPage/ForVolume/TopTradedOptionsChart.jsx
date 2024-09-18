import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './TopTradedOptionsChart.css'; // Подключение CSS

const TopTradedOptionsChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/popular-options/${asset.toLowerCase()}`);
                setTrades(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching top traded options data:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (trades.length === 0) {
        return <div>No data available</div>;
    }

    const instrumentNames = trades.map(trade => trade.instrument_name);
    const tradeCounts = trades.map(trade => trade.trade_count);

    return (
        <div className="chart-container">
            <h2 className="chart-title">Top Traded Options</h2>
            <div className="chart-controls">
                <button onClick={() => setAsset('BTC')} className={`asset-button ${asset === 'BTC' ? 'active' : ''}`}>BTC</button>
                <button onClick={() => setAsset('ETH')} className={`asset-button ${asset === 'ETH' ? 'active' : ''}`}>ETH</button>
            </div>
            <div className="plot-container">
                <Plot
                    data={[
                        {
                            x: instrumentNames,
                            y: tradeCounts,
                            type: 'bar',
                            marker: { color: '#636E72' },
                        },
                    ]}
                    layout={{
                        autosize: true,
                        xaxis: {
                            title: '',
                            tickangle: -45,
                        },
                        yaxis: {
                            title: 'Number of Trades',
                        },
                        showlegend: false,
                        margin: { l: 50, r: 50, b: 120, t: 30 },
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <div className="chart-description">
                <h3>Description</h3>
                <p>The top traded options in the last 24h.</p>
            </div>
        </div>
    );
};

export default TopTradedOptionsChart;
