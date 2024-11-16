import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import './BlockFlowFilters.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const BlockFlowFilters = ({ asset = 'BTC', tradeType = 'ALL', optionType = 'ALL', sizeOrder, premiumOrder }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [putCallRatio, setPutCallRatio] = useState(0);
    const [putsPercentage, setPutsPercentage] = useState(0);
    const [callsPercentage, setCallsPercentage] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [trades, setTrades] = useState([]); // Добавляем состояние для хранения данных о сделках
    const [expirations, setExpirations] = useState([]); // Добавляем состояние для хранения дат экспирации
    const [isChecked, setIsChecked] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(asset);
    const [selectedTradeType, setSelectedTradeType] = useState(tradeType);
    const [selectedOptionType, setSelectedOptionType] = useState(optionType);

    // Загружаем данные о сделках и метрики
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const expiration = expirations[0] || '';
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block/flow/trades`, {
                    params: {
                        asset: selectedAsset,
                        tradeType: selectedTradeType,
                        optionType: selectedOptionType,
                        expiration,
                        sizeOrder,
                        premiumOrder,
                        page,
                    },
                });

                console.log('Response data:', response.data);

                const { putCallRatio, putsPercentage, callsPercentage, totalPages, trades } = response.data;
                setPutCallRatio(putCallRatio || 0);
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

        fetchData();
    }, [selectedAsset, selectedTradeType, selectedOptionType, expirations, sizeOrder, premiumOrder, page]);



    const getFormattedTime = (timeUtc) => {
        // Добавляем текущую дату к времени, чтобы получить полную строку в формате YYYY-MM-DD HH:MM:SS
        const currentDate = new Date().toISOString().split('T')[0]; // Текущая дата в формате YYYY-MM-DD
        const dateTimeString = `${currentDate} ${timeUtc}`;
        const dateObj = new Date(dateTimeString);

        // Проверяем, если дата некорректная, то возвращаем пустую строку
        if (isNaN(dateObj.getTime())) {
            console.error('Invalid Date:', dateTimeString);
            return '';
        }

        return dateObj.toLocaleTimeString(); // Возвращаем только время
    };

    const handleToggle = () => {
        setIsChecked(!isChecked);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

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

    return (
        <div className="flow-main-container">
            {/* Фильтры */}
            <div className="block-flow-filters">
                <button className="filter-button" onClick={toggleFilters}>
                    Filters
                </button>
                <div className="stream-toggle">
                    <span>Stream</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleToggle}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
                <select className="size-dropdown">
                    <option value="15">Size 15</option>
                    <option value="30">Size 30</option>
                    <option value="50">Size 50</option>
                </select>
                <button className="toggle-button" onClick={handlePreviousPage} disabled={page === 1}>
                    Previous
                </button>
                <button className="toggle-button" onClick={handleNextPage} disabled={page === totalPages}>
                    Next
                </button>
            </div>

            {showFilters && (
                <div class="filters-panel">
                    <div className="filter-panel">
                        <div class="filter-column">

                            {/*1*/}
                            <div className="filter-field">
                                <label>Asset</label>
                                <select>
                                    <option value="ALL">ALL</option>
                                    <option value="BTC">BTC</option>
                                    <option value="ETH">ETH</option>
                                </select>
                            </div>

                            <div className="filter-field">
                                <label>Type</label>
                                <select>
                                    <option value="ALL">ALL</option>
                                    <option value="PUT">PUT</option>
                                    <option value="CALL">CALL</option>
                                </select>
                            </div>

                            <div className="filter-field">
                                <label>Strike Min</label>
                                <input type="number" placeholder="0"/>
                            </div>
                        </div>

                        {/*2*/}
                        <div class="filter-column">


                            <div className="filter-field">
                                <label>Exchange</label>
                                <select>
                                    <option value="ALL">ALL</option>
                                    <option value="DER">Deribit</option>
                                </select>
                            </div>
                            <div className="filter-field">
                                <label>Maker</label>
                                <select>
                                    <option value="ALL">ALL</option>
                                    <option value="SHRIMP">SHRIMP</option>
                                    <option value="FISH">FISH</option>
                                    <option value="CARP">CARP</option>
                                    <option value="DOLPHIN">DOLPHIN</option>
                                    <option value="WHALE">WHALE</option>
                                </select>
                            </div>


                            <div className="filter-field">
                                <label>Strike Max</label>
                                <input type="number" placeholder="∞"/>
                            </div>
                        </div>

                        {/*3*/}
                        <div class="filter-column">

                            <div className="filter-field">
                                <label>Side</label>
                                <select>
                                    <option value="ALL">ALL</option>
                                    <option value="BUY">BUY</option>
                                    <option value="SELL">SELL</option>
                                </select>
                            </div>


                            <div className="filter-field">
                                <label>IV Min</label>
                                <input type="number" placeholder="0"/>
                            </div>

                            <div className="filter-field">
                                <label>DTE Min</label>
                                <input type="number" placeholder="0"/>
                            </div>
                        </div>

                        {/*4*/}
                        <div class="filter-column">
                            <div className="filter-field">
                                <label>Combo</label>
                                <select>
                                    <option>ALL</option>
                                    <option>SINGLE</option>
                                    <option>COMBO</option>
                                    <option>BLOCK</option>
                                </select>
                            </div>

                            <div className="filter-field">
                                <label>IV Max</label>
                                <input type="number" placeholder="∞"/>
                            </div>

                            <div className="filter-field">
                                <label>DTE Max</label>
                                <input type="number" placeholder="∞"/>
                            </div>
                        </div>
                    </div>
                    <div class="filter-actions">
                        <button class="filter-action-button">Save</button>
                        <button class="filter-action-button">Reset</button>
                        <button class="filter-action-button" onClick={toggleFilters}>Hide</button>
                    </div>
                </div>)}

            {/* Таблица сделок */}
            <div className="flow-table">
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Time UTC</th>
                            <th>Side</th>
                            <th>Asset</th>
                            <th>Strike</th>
                            <th>K</th>
                            <th>Chain</th>
                            <th>Spot</th>
                            <th>DTE</th>
                            <th>Ex.</th>
                            <th>Size</th>
                            <th>Price</th>
                            <th>Premium</th>
                            <th>IV</th>
                            <th>Maker</th>
                        </tr>
                        </thead>
                        <tbody>
                        {trades.map((trade, index) => (
                            <tr key={index}>
                                <td>{trade.timeUtc}</td>
                                <td>{trade.side}</td>
                                <td>{trade.asset}</td>
                                <td>{trade.strike || 'N/A'}</td>  {/* Если strike null, показываем 'N/A' */}
                                <td>{trade.k}</td>
                                <td>{trade.chain}</td>
                                <td>{trade.spot}</td>
                                <td>{trade.dte}</td>
                                <td>{trade.exchange}</td>
                                <td>{trade.size}</td>
                                <td>{trade.price}</td>
                                <td>{trade.premium}</td>
                                <td>{trade.iv}</td>
                                <td>{trade.maker}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default BlockFlowFilters;
