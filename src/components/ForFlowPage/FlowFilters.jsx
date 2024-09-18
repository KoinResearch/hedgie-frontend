import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import './FlowFilters.css';

const FlowFilters = () => {
    const [asset, setAsset] = useState('BTC');
    const [tradeType, setTradeType] = useState('Buy/Sell');
    const [optionType, setOptionType] = useState('Call/Put');
    const [expiration, setExpiration] = useState('All Expirations');
    const [expirations, setExpirations] = useState([]);
    const [trades, setTrades] = useState([]);
    const [limitedTrades, setLimitedTrades] = useState([]); // Limited initial trades
    const [showAll, setShowAll] = useState(false); // State to track if showing all trades

    // State for displaying Put/Call Ratio and counts
    const [putCallRatio, setPutCallRatio] = useState(0);
    const [totalPuts, setTotalPuts] = useState(0);
    const [totalCalls, setTotalCalls] = useState(0);
    const [putsPercentage, setPutsPercentage] = useState(0);
    const [callsPercentage, setCallsPercentage] = useState(0);

    // State for filters
    const [sizeOrder, setSizeOrder] = useState('All Sizes');
    const [premiumOrder, setPremiumOrder] = useState('All Premiums');

    // Fetch expirations based on asset change
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

    // Fetch limited trades on initial load and when filters change
    useEffect(() => {
        const fetchLimitedTrades = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/trades`, {
                    params: {
                        asset,
                        tradeType,
                        optionType,
                        expiration,
                        sizeOrder,
                        premiumOrder,
                        limit: 50, // Fetch only the latest 50 trades
                    },
                });

                const { trades, putCallRatio, totalPuts, totalCalls, putsPercentage, callsPercentage } = response.data;
                setLimitedTrades(trades);
                setPutCallRatio(putCallRatio);
                setTotalPuts(totalPuts);
                setTotalCalls(totalCalls);
                setPutsPercentage(putsPercentage);
                setCallsPercentage(callsPercentage);
                setShowAll(false); // Reset to not showing all on initial load
            } catch (error) {
                console.error('Error fetching trades:', error);
            }
        };

        fetchLimitedTrades();
    }, [asset, tradeType, optionType, expiration, sizeOrder, premiumOrder]);

    // Fetch all trades when "Show All" is clicked
    const fetchAllTrades = async () => {
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
        }
    };

    return (
        <div className="flow-container">
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

            {/* Display metrics in a row */}
            <div className="metrics-row">
                <div className="metric">
                    <span className="metric-value">{putCallRatio.toFixed(2)} </span>
                    <span className="metric-label">Put to Call Ratio</span>
                </div>
                <div className="metric">
                    <span className="metric-value">{totalCalls.toFixed(2)} </span>
                    <span className="metric-label">Total Calls</span>
                </div>
                <div className="metric">
                    <span className="metric-value">{totalPuts.toFixed(2)} </span>
                    <span className="metric-label">Total Puts</span>
                </div>
            </div>

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
                    </tr>
                    </thead>
                    <tbody>
                    {(showAll ? trades : limitedTrades).map((trade, index) => (
                        <tr key={index}>
                            <td>{asset}</td>
                            <td>{trade.direction.toUpperCase()}</td>
                            <td>{trade.instrument_name.includes('-C') ? 'CALL' : 'PUT'}</td>
                            <td>{trade.instrument_name.match(/(\d{1,2}[A-Z]{3}\d{2})/)[0]}</td>
                            <td>{trade.instrument_name.match(/(\d+)-[CP]$/)[1]}</td>
                            <td>{trade.amount}</td>
                            <td>{trade.price}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
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
