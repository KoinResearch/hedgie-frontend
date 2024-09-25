import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FlowFilters.css';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

// Регистрация компонентов Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const FlowFilters = () => {
    const [asset, setAsset] = useState('BTC');
    const [tradeType, setTradeType] = useState('Buy/Sell');
    const [optionType, setOptionType] = useState('Call/Put');
    const [expiration, setExpiration] = useState('All Expirations');
    const [expirations, setExpirations] = useState([]);
    const [trades, setTrades] = useState([]);
    const [limitedTrades, setLimitedTrades] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    // Загружаем первые 100 строк
    useEffect(() => {
        const fetchLimitedTrades = async () => {
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
                        limit: 100, // Лимит на первые 100 строк
                    },
                });

                const { trades, putCallRatio, totalPuts, totalCalls, putsPercentage, callsPercentage } = response.data;
                setLimitedTrades(trades);
                setPutCallRatio(putCallRatio);
                setTotalPuts(totalPuts);
                setTotalCalls(totalCalls);
                setPutsPercentage(putsPercentage);
                setCallsPercentage(callsPercentage);
                setShowAll(false);
            } catch (error) {
                console.error('Error fetching trades:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLimitedTrades();
    }, [asset, tradeType, optionType, expiration, sizeOrder, premiumOrder]);

    // Загружаем все данные при нажатии на кнопку
    const fetchAllTrades = async () => {
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
                },
            });

            const { trades } = response.data;
            setTrades(trades);
            setShowAll(true);
        } catch (error) {
            console.error('Error fetching all trades:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flow-container">
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
                        {(showAll ? trades : limitedTrades).map((trade, index) => (
                            <tr key={index}>
                                <td>{asset}</td>
                                <td style={{color: trade.direction.toUpperCase() === 'BUY' ? '#1FA74B' : '#DD3548'}}>
                                    {trade.direction.toUpperCase()}
                                </td>
                                <td style={{color: trade.instrument_name.includes('-C') ? '#1FA74B' : '#DD3548'}}>
                                    {trade.instrument_name.includes('-C') ? 'CALL' : 'PUT'}
                                </td>
                                <td style={{color: '#4B88E1'}}>
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
                {!showAll && (
                    <div className="show-all-container">
                        <button className="show-all-btn" onClick={fetchAllTrades}>Show All</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlowFilters;
