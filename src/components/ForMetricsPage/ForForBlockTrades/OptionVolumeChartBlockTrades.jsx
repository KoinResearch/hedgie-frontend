import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const OptionVolumeChartBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [trades, setTrades] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/popular-options/${asset.toLowerCase()}`);
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
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        🏆
                        Top Traded Options - Past 24h
                    </h2>
                    <div className="asset-option-buttons">
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
                </div>
                <div className="flow-option-dedicated"></div>
            </div>
            <div className="graph">
            <Plot
                data={[
                    {
                        x: instrumentNames,
                        y: tradeCounts,
                        type: 'bar',
                        marker: {
                            color: 'rgba(0,119,255,0.8)',
                            line: {
                                color: 'rgba(0,119,255,1)',
                                width: 2,
                            },
                            gradient: {
                                type: 'vertical',
                                colorscale: [
                                    [0, 'rgba(0,119,255,0.5)'],
                                    [1, 'rgba(0,119,255,1)'],
                                ],
                            },
                        },
                    },
                ]}
                layout={{
                    paper_bgcolor: '#151518',
                    plot_bgcolor: '#151518',
                    font: {
                        family: 'Arial, sans-serif',
                        size: 14,
                        color: '#FFFFFF',
                    },
                    xaxis: {
                        tickangle: -45,
                        tickfont: {
                            size: 12,
                            color: '#FFFFFF',
                        },
                    },
                    yaxis: {
                        title: {
                            text: 'Trade Counts',
                            font: {
                                size: 14,
                                color: '#FFFFFF',
                            },
                        },
                        gridcolor: '#393E47',
                        tickfont: {
                            color: '#FFFFFF',
                        },
                    },
                    autosize: true,
                    margin: {
                        l: 50,
                        r: 20,
                        b: 100,
                        t: 20,
                        pad: 4,
                    },
                }}
                useResizeHandler={true}
                style={{width: '100%', height: '100%'}}
            />
                </div>
        </div>
    );
};

export default OptionVolumeChartBlockTrades;
