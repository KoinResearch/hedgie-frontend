import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const ExpirationActivityChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [strike, setStrike] = useState('all');  // Устанавливаем начальное значение как 'all'
    const [data, setData] = useState({calls: [], puts: []});
    const [strikes, setStrikes] = useState([]);  // Список доступных страйков
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Получение доступных страйков при изменении актива
    useEffect(() => {
        const fetchStrikes = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/strikes/${asset.toLowerCase()}`);
                setStrikes(response.data);
            } catch (err) {
                console.error('Error fetching strikes:', err);
            }
        };

        fetchStrikes();
    }, [asset]);

    // Получение активности по дате истечения и страйку
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Если выбран 'all', не добавляем страйк в URL
                let url = `${import.meta.env.VITE_API_URL}/api/metrics/expiration-activity/${asset.toLowerCase()}`;
                if (strike && strike !== 'all') {
                    url += `/${strike}`;  // Добавляем страйк в запрос, если он выбран
                }

                const response = await axios.get(url);
                setData(response.data);
                setLoading(false);
                console.log('Fetched data:', response.data);
            } catch (err) {
                console.error('Error fetching expiration activity data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, strike]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Подготовка данных для графика
    const expirationDates = [...new Set([...data.calls.map(d => d.expiration_date), ...data.puts.map(d => d.expiration_date)])];

    const callCounts = expirationDates.map(date => {
        const call = data.calls.find(d => d.expiration_date === date);
        return call ? call.trade_count : 0;
    });

    const putCounts = expirationDates.map(date => {
        const put = data.puts.find(d => d.expiration_date === date);
        return put ? put.trade_count : 0;
    });



    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        📉
                        Volume By Expiration - Past 24h
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
                        <select value={strike} onChange={(e) => setStrike(e.target.value || 'all')}>
                            <option value="all">All Strikes</option>
                            {/* Устанавливаем 'all' для всех страйков */}
                            {strikes.map((s) => (
                                <option key={s} value={s}>{s}</option>
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
            <div>
            <Plot
                data={[
                    {
                        x: expirationDates,
                        y: callCounts,
                        type: 'bar',
                        name: 'Calls',
                        marker: {
                            color: 'rgba(39,174,96,0.8)', // Зеленый цвет для Calls
                        },
                    },
                    {
                        x: expirationDates,
                        y: putCounts,
                        type: 'bar',
                        name: 'Puts',
                        marker: {
                            color: 'rgba(231,76,60,0.8)', // Красный цвет для Puts
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
                            text: 'Expiration Date',
                            font: {
                                size: 14,
                                color: '#FFFFFF',
                            },
                        },
                        tickangle: -45,
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
                        l: 50,
                        r: 10,
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

export default ExpirationActivityChart;
