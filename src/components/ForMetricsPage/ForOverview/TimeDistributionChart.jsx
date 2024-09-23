import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const TimeDistributionChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [data, setData] = useState({ calls: [], puts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/time-distribution/${asset.toLowerCase()}`);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching time distribution data:', err);
                setError(err.message);
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

    // Подготовка данных для графика
    const hours = [...new Set([...data.calls.map(d => d.hour), ...data.puts.map(d => d.hour)])];

    // Форматирование числового значения часов в строку HH:MM
    const formattedHours = hours.map(hour => {
        const date = new Date();
        date.setHours(hour);
        date.setMinutes(0); // Чтобы отображать время только по часам
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    });

    const callCounts = hours.map(hour => {
        const call = data.calls.find(d => d.hour === hour);
        return call ? call.trade_count : 0;
    });

    const putCounts = hours.map(hour => {
        const put = data.puts.find(d => d.hour === hour);
        return put ? put.trade_count : 0;
    });

    const avgIndexPrices = hours.map(hour => {
        const call = data.calls.find(d => d.hour === hour);
        return call ? call.avg_index_price : 0;
    });

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        📦
                        Historical Volume - Past 24h
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
                            x: formattedHours,
                            y: callCounts,
                            type: 'bar',
                            name: 'Calls',
                            marker: {
                                color: 'rgba(39,174,96,0.8)', // Зеленый для Calls
                            },
                        },
                        {
                            x: formattedHours,
                            y: putCounts,
                            type: 'bar',
                            name: 'Puts',
                            marker: {
                                color: 'rgba(231,76,60,0.8)', // Красный для Puts
                            },
                        },
                        {
                            x: formattedHours,
                            y: avgIndexPrices,
                            type: 'line',
                            name: 'Index Price',
                            yaxis: 'y2',
                            line: {
                                color: 'rgba(255,255,255,0.8)', // Белый для линии
                                width: 2,
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
                            title: {
                                text: 'Time (HH:MM)',
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
                        yaxis2: {
                            title: {
                                text: 'Index Price',
                                font: {
                                    size: 14,
                                    color: '#FFFFFF',
                                },
                            },
                            overlaying: 'y',
                            side: 'right',
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF',
                            },
                        },
                        barmode: 'group', // Группировка столбцов
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
                            l: 50,
                            r: 50, // Увеличиваем отступ для правой оси
                            b: 100,
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

export default TimeDistributionChart;
