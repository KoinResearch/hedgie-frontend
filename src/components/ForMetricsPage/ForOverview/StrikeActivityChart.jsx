import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const StrikeActivityChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]); // Для хранения доступных дат экспирации

    // Fetch available expirations when the asset changes
    useEffect(() => {
        const fetchExpirations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`);
                setExpirations(['All Expirations', ...response.data]); // Добавляем "All Expirations" в начало списка
            } catch (err) {
                console.error('Error fetching expirations:', err);
            }
        };
        fetchExpirations();
    }, [asset]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(`Fetching strike activity for ${asset} with expiration ${expiration}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/strike-activity/${asset.toLowerCase()}?expiration=${expiration}`);
                console.log('Fetched raw data:', response.data);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching strike activity data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, expiration]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Разделение данных по Call и Put
    const callData = data.filter(d => d.option_type === 'C');
    const putData = data.filter(d => d.option_type === 'P');

    // Подготовка данных для отображения
    const strikePrices = callData.map(d => d.strike_price);
    const callTradeCounts = callData.map(d => d.trade_count);
    const putTradeCounts = putData.map(d => {
        const matchingCall = callData.find(call => call.strike_price === d.strike_price);
        return matchingCall ? d.trade_count : d.trade_count;
    });


    // <div>
    //     <select onChange={(e) => setExpiration(e.target.value)} value={expiration}>
    //         {expirations.map(exp => (
    //             <option key={exp} value={exp}>
    //                 {exp}
    //             </option>
    //         ))}
    //     </select>
    // </div>
    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        📈
                        Volume By Strike Price - Past 24h
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
                    <div className="asset-option-buttons">
                        <select onChange={(e) => setExpiration(e.target.value)} value={expiration}>
                            {expirations.map(exp => (
                                <option key={exp} value={exp}>
                                    {exp}
                                </option>
                            ))}
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
            <div className="graph"> {/* Контейнер для графика */}
                <Plot
                    data={[
                        {
                            x: strikePrices,
                            y: callTradeCounts,
                            type: 'bar',
                            marker: {
                                color: 'rgba(39,174,96, 0.8)', // Зеленый цвет для Calls
                            },
                            name: 'Calls',
                        },
                        {
                            x: strikePrices,
                            y: putTradeCounts,
                            type: 'bar',
                            marker: {
                                color: 'rgba(231,76,60, 0.8)', // Красный цвет для Puts
                            },
                            name: 'Puts',
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
                            title: {
                                text: 'Strike Price',
                                font: {
                                    size: 14,
                                    color: '#FFFFFF',
                                },
                            },
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF',
                            },
                        },
                        yaxis: {
                            title: {
                                text: 'Number of Trades',
                                font: {
                                    size: 14,
                                    color: '#FFFFFF',
                                },
                            },
                            gridcolor: '#393E47',
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF',
                            },
                        },
                        barmode: 'group', // Группировка баров
                        legend: {
                            x: 0.01,
                            y: 1.1,
                            orientation: 'h',
                            font: {
                                size: 12,
                                color: '#FFFFFF',
                            },
                        },
                        margin: {
                            l: 40,
                            r: 10,
                            b: 40,
                            t: 20,
                            pad: 4,
                        },
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};

export default StrikeActivityChart;
