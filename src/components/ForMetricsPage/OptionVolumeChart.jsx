import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const OptionVolumeChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [trades, setTrades] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/popular-options/${asset.toLowerCase()}`);
                setTrades(response.data);
            } catch (error) {
                console.error('Error fetching option volume data:', error);
                setError(error.message);
            }
        };

        fetchData();
    }, [asset]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (trades.length === 0) {
        return <div>No data available</div>;
    }

    const instrumentNames = trades.map(trade => trade.instrument_name);
    const tradeCounts = trades.map(trade => trade.trade_count);

    return (
        <div>
            <h2>{asset} Option Volume - Past 24h</h2>
            <div>
                <button onClick={() => setAsset('BTC')} className={asset === 'BTC' ? 'active' : ''}>
                    BTC
                </button>
                <button onClick={() => setAsset('ETH')} className={asset === 'ETH' ? 'active' : ''}>
                    ETH
                </button>
            </div>
            <h3>Top Traded Options - {asset}</h3>
            <Plot
                data={[
                    {
                        x: instrumentNames,
                        y: tradeCounts,
                        type: 'bar',
                    },
                ]}
                layout={{ width: 600, height: 400, title: 'Top Traded Options' }}
            />
        </div>
    );
};

export default OptionVolumeChart;
