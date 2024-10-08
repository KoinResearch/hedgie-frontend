import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import './FlowFilters.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const FlowFilters = () => {
    const [asset, setAsset] = useState('BTC');
    const [tradeType, setTradeType] = useState('Buy/Sell');
    const [optionType, setOptionType] = useState('Call/Put');
    const [expiration, setExpiration] = useState('All Expirations');
    const [expirations, setExpirations] = useState([]);
    const [trades, setTrades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1); // Текущая страница
    const [totalPages, setTotalPages] = useState(1); // Общее количество страниц

    const [putCallRatio, setPutCallRatio] = useState(0);
    const [totalPuts, setTotalPuts] = useState(0);
    const [totalCalls, setTotalCalls] = useState(0);
    const [putsPercentage, setPutsPercentage] = useState(0);
    const [callsPercentage, setCallsPercentage] = useState(0);

    const [sizeOrder, setSizeOrder] = useState('All Sizes');
    const [premiumOrder, setPremiumOrder] = useState('All Premiums');

    // Загружаем даты экспирации
    useEffect(() => {
        const fetchExpirations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`);
                setExpirations(response.data);
            } catch (error) {
                console.error('Error fetching expiration dates:', error);
            }
        };

        fetchExpirations();
    }, [asset]);

    // Логика загрузки метрик (только по активу)
    useEffect(() => {
        const fetchMetrics = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/trades`, {
                    params: {
                        asset,
                        tradeType,
                        optionType,
                        expiration,
                        sizeOrder,
                        premiumOrder,
                        page,
                    },
                });

                console.log('Response data:', response.data); // Вывод данных в консоль

                const { putCallRatio, totalPuts, totalCalls, putsPercentage, callsPercentage, totalPages, trades } = response.data;
                setPutCallRatio(putCallRatio || 0);
                setTotalPuts(totalPuts || 0);
                setTotalCalls(totalCalls || 0);
                setPutsPercentage(putsPercentage || 0);
                setCallsPercentage(callsPercentage || 0);
                setTotalPages(totalPages || 1);
                setTrades(trades || []);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [asset, tradeType, optionType, expiration, sizeOrder, premiumOrder, page]);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const putCallData = {
        labels: ['Put', 'Call'],
        datasets: [
            {
                data: [putCallRatio, 1 - putCallRatio],
                backgroundColor: ['#ff3e3e', '#00cc96'],
                borderWidth: 0,
            },
        ],
    };

    const totalCallsData = {
        labels: ['Calls %', ''],
        datasets: [
            {
                data: [callsPercentage, 100 - callsPercentage],
                backgroundColor: ['#00cc96', '#333'],
                borderWidth: 0,
            },
        ],
    };

    const totalPutsData = {
        labels: ['Puts %', ''],
        datasets: [
            {
                data: [putsPercentage, 100 - putsPercentage],
                backgroundColor: ['#ff3e3e', '#333'],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        cutout: '70%',
        plugins: {
            tooltip: {
                enabled: false,
            },
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="flow-main-container">
            {/* Фильтры */}
            <div className="flow-filters">
                <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                </select>
                <select value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
                    <option value="Buy/Sell">Buy/Sell</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                </select>
                <select value={optionType} onChange={(e) => setOptionType(e.target.value)}>
                    <option value="Call/Put">Call/Put</option>
                    <option value="Call">Call</option>
                    <option value="Put">Put</option>
                </select>
                <select value={expiration} onChange={(e) => setExpiration(e.target.value)}>
                    <option value="All Expirations">All Expirations</option>
                    {expirations.map((exp) => (
                        <option key={exp} value={exp}>{exp}</option>
                    ))}
                </select>
                <select value={sizeOrder} onChange={(e) => setSizeOrder(e.target.value)}>
                    <option value="All Sizes">All Sizes</option>
                    <option value="higher to lower">Higher to Lower</option>
                    <option value="lesser to greater">Lesser to Greater</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                </select>
                <select value={premiumOrder} onChange={(e) => setPremiumOrder(e.target.value)}>
                    <option value="All Premiums">All Premiums</option>
                    <option value="higher to lower">Higher to Lower</option>
                    <option value="lesser to greater">Lesser to Greater</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                </select>
                <button onClick={handlePreviousPage} disabled={page === 1}>
                    Previous
                </button>
                <button onClick={handleNextPage} disabled={page === totalPages}>
                    Next
                </button>
            </div>

            {/* Метрики */}
            <div className="metrics-row">
                <div className="metric">
                    <div className="metric-data">
                        <span className="metric-label">Put to Call Ratio</span>
                        <span className="metric-value">
                {typeof putCallRatio === 'number' && !isNaN(putCallRatio) ? putCallRatio.toFixed(2) : '0.00'}
            </span>
                    </div>
                    <Doughnut data={putCallData} options={options}/>
                </div>

                <div className="dedicate-metric"></div>

                <div className="metric">
                    <div className="metric-data">
                        <span className="metric-label">Total Calls</span>
                        <span className="metric-value">
                {typeof totalCalls === 'string' && !isNaN(parseFloat(totalCalls)) ?
                    parseFloat(totalCalls).toLocaleString(undefined, {minimumFractionDigits: 0}) : '0'}
            </span>
                    </div>
                    <Doughnut data={totalCallsData} options={options}/>
                </div>

                <div className="dedicate-metric"></div>

                <div className="metric">
                    <div className="metric-data">
                        <span className="metric-label">Total Puts</span>
                        <span className="metric-value">
                {typeof totalPuts === 'string' && !isNaN(parseFloat(totalPuts)) ?
                    parseFloat(totalPuts).toLocaleString(undefined, { minimumFractionDigits: 0 }) : '0'}
            </span>
                    </div>
                    <Doughnut data={totalPutsData} options={options} />
                </div>
            </div>

            {/* Таблица сделок */}
            <div className="flow-table">
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Market</th>
                            <th>Side</th>
                            <th>Type</th>
                            <th>Expiry</th>
                            <th>Strike</th>
                            <th>Size</th>
                            <th>Price</th>
                        </tr>
                        </thead>
                        <tbody>
                        {trades.map((trade, index) => (
                            <tr key={index}>
                                <td>{asset}</td>
                                <td style={{ color: trade.direction.toUpperCase() === 'BUY' ? '#1FA74B' : '#DD3548' }}>
                                    {trade.direction.toUpperCase()}
                                </td>
                                <td style={{ color: trade.instrument_name.includes('-C') ? '#1FA74B' : '#DD3548' }}>
                                    {trade.instrument_name.includes('-C') ? 'CALL' : 'PUT'}
                                </td>
                                <td style={{ color: '#4B88E1' }}>
                                    {trade.instrument_name.match(/(\d{1,2}[A-Z]{3}\d{2})/)[0]}
                                </td>
                                <td>{trade.instrument_name.match(/(\d+)-[CP]$/)[1]}</td>
                                <td>{trade.amount}</td>
                                <td>{trade.price}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default FlowFilters;
