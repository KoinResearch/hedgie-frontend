import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FlowFilters.css';

const FlowFilters = () => {
    const [asset, setAsset] = useState('BTC');
    const [tradeType, setTradeType] = useState('Buy/Sell');
    const [optionType, setOptionType] = useState('Call/Put');
    const [expiration, setExpiration] = useState('All Expirations');
    const [expirations, setExpirations] = useState([]);
    const [trades, setTrades] = useState([]); // Для хранения полученных данных

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

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/trades`, {
                    params: {
                        asset,
                        tradeType,
                        optionType,
                        expiration,
                    },
                });
                setTrades(response.data);
            } catch (error) {
                console.error('Error fetching trades:', error);
            }
        };

        fetchTrades();
    }, [asset, tradeType, optionType, expiration]);

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
            </div>

            {/*/!* Метрики *!/*/}
            {/*<div className="flow-metrics">*/}
            {/*    <div className="metric">*/}
            {/*        <h3>Put to Call Ratio</h3>*/}
            {/*        <p>1.70</p>*/}
            {/*    </div>*/}
            {/*    <div className="metric">*/}
            {/*        <h3>Calls</h3>*/}
            {/*        <p>2,984.50</p>*/}
            {/*    </div>*/}
            {/*    <div className="metric">*/}
            {/*        <h3>Puts</h3>*/}
            {/*        <p>5,061.50</p>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/* Таблица с данными */}
            <div className="flow-table">
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
                        {/*<th>Premium</th>*/}
                    </tr>
                    </thead>
                    <tbody>
                    {trades.map((trade, index) => (
                        <tr key={index}>
                            <td>{asset}</td>
                            <td>{trade.direction.toUpperCase()}</td>
                            <td>{trade.instrument_name.includes('-C') ? 'CALL' : 'PUT'}</td>
                            <td>{trade.instrument_name.match(/(\d{1,2}[A-Z]{3}\d{2})/)[0]}</td>
                            <td>{trade.instrument_name.match(/(\d+)-[CP]$/)[1]}</td>
                            <td>{trade.amount}</td>
                            <td>{trade.price}</td>
                            {/*<td>{trade.premium}</td>*/}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FlowFilters;
