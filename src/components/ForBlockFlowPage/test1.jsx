import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    const [trades, setTrades] = useState([]);
    const [expirations, setExpirations] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(asset);
    const [selectedTradeType, setSelectedTradeType] = useState(tradeType);
    const [selectedOptionType, setSelectedOptionType] = useState(optionType);
    const [strikeMin, setStrikeMin] = useState('');
    const [strikeMax, setStrikeMax] = useState('');
    const [selectedExchange, setSelectedExchange] = useState('');
    const [selectedMaker, setSelectedMaker] = useState('ALL'); // Новое состояние для фильтра Maker

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const expiration = expirations[0] || '';

                // Создаем параметры запроса, включая выбранный Maker
                const params = {
                    asset: selectedAsset,
                    tradeType: selectedTradeType,
                    optionType: selectedOptionType,
                    expiration,
                    sizeOrder,
                    premiumOrder,
                    page,
                    exchange: selectedExchange,
                    minStrike: strikeMin,
                    maxStrike: strikeMax,
                    maker: selectedMaker, // Добавляем maker в параметры
                };

                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block/flow/trades`, {
                    params: params,
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
    }, [selectedAsset, selectedTradeType, selectedOptionType, expirations, sizeOrder, premiumOrder, page, selectedExchange, selectedMaker]); // Зависимость от selectedMaker

    const handleSaveFilters = async () => {
        try {
            setIsLoading(true);

            setSavedFilters({
                asset: selectedAsset,
                tradeType: 'ALL',
                optionType: selectedOptionType,
                strikeMin,
                strikeMax,
                exchange: selectedExchange,
            });

            console.log('Saving filters:', {
                asset: selectedAsset,
                tradeType: 'ALL',
                optionType: selectedOptionType,
                strikeMin,
                strikeMax,
                exchange: selectedExchange,
            });
        } catch (error) {
            console.error('Error saving filters:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleMakerChange = (e) => {
        setSelectedMaker(e.target.value); // Обработчик для изменения значения Maker
    };

    const handleToggle = () => setIsChecked(!isChecked);
    const toggleFilters = () => setShowFilters(!showFilters);
    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };
    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };


    const getFormattedTime = (timeUtc) => {
        if (!timeUtc) {
            console.error('Invalid timeUtc:', timeUtc);
            return 'Invalid time';
        }
        const currentDate = new Date().toISOString().split('T')[0];
        const dateTimeString = `${currentDate} ${timeUtc}`;
        const dateObj = new Date(dateTimeString);
        if (isNaN(dateObj.getTime())) {
            console.error('Invalid Date:', dateTimeString);
            return 'Invalid time';
        }
        return dateObj.toLocaleTimeString();
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
                <div className="filters-panel">
                    <div className="filter-panel">
                        <div className="filter-column">
                            {/* Фильтры 1 */}
                            <div className="filter-field">
                                <label>Asset</label>
                                <select onChange={(e) => setSelectedAsset(e.target.value)} value={selectedAsset}>
                                    <option value="ALL">ALL</option>
                                    <option value="BTC">BTC</option>
                                    <option value="ETH">ETH</option>
                                </select>
                            </div>
                            <div className="filter-field">
                                <label>Type</label>
                                <select onChange={(e) => setSelectedOptionType(e.target.value)}
                                        value={selectedOptionType}>
                                    <option value="ALL">ALL</option>
                                    <option value="C">CALL</option>
                                    <option value="P">PUT</option>
                                </select>
                            </div>
                            <div className="filter-field">
                                <label>Strike Min</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={strikeMin}
                                    onChange={(e) => setStrikeMin(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filter-column">
                            {/* Фильтры 2 */}
                            <div className="filter-field">
                                <label>Exchange</label>
                                <select onChange={(e) => setSelectedExchange(e.target.value)} value={selectedExchange}>
                                    <option value="ALL">ALL</option>
                                    <option value="DER">Deribit</option>
                                    {/* Можно добавить другие источники */}
                                </select>
                            </div>
                            <div className="filter-field">
                                <label>Maker</label>
                                <select value={selectedMaker} onChange={handleMakerChange}>
                                    <option value="ALL">ALL</option>
                                    <option value="🐙🦑">SHRIMP</option>
                                    <option value="🐟🎣">FISH</option>
                                    <option value="🐡🚣">CARP</option>
                                    <option value="🐬🌊">DOLPHIN</option>
                                    <option value="🐋🐳">WHALE</option>
                                </select>
                            </div>

                            <div className="filter-field">
                                <label>Strike Max</label>
                                <input
                                    type="number"
                                    placeholder="∞"
                                    value={strikeMax}
                                    onChange={(e) => setStrikeMax(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Фильтры 3 */}
                        <div className="filter-column">
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

                        {/* Фильтры 4 */}
                        <div className="filter-column">
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

                    <div className="filter-actions">
                        <button className="filter-action-button" onClick={handleSaveFilters}>
                            Save
                        </button>
                        <button className="filter-action-button" onClick={() => setShowFilters(false)}>
                            Reset
                        </button>
                        <button className="filter-action-button" onClick={toggleFilters}>
                            Hide
                        </button>
                    </div>
                </div>
            )}

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
                            <th className="highlight-column">Asset</th>
                            <th className="highlight-column">Strike</th>
                            <th>K</th>
                            <th className="highlight-column">Chain</th>
                            <th>Spot</th>
                            <th>DTE</th>
                            <th className="highlight-column">Ex.</th>
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
                                <td>{getFormattedTime(trade.timeutc)}</td>
                                <td className={`trade-side ${trade.side === 'buy' ? 'buy' : 'sell'}`}>
                                    {trade.side ? trade.side.toUpperCase() : 'N/A'}
                                </td>
                                <td className="highlight-column">{trade.asset || 'N/A'}</td>
                                <td>${trade.instrument_name.match(/(\d+)-[CP]$/)[1]}</td>
                                <td className={`trade-side ${trade.side === 'C' ? 'put' : 'call'}`}>{trade.k === 'C' ? 'CALL' : trade.k === 'P' ? 'PUT' : 'N/A'}</td>
                                <td className="highlight-column">{trade.chain || 'N/A'}</td>
                                <td>${trade.spot || 'N/A'}</td>
                                <td>
                                    {trade.dte ? (
                                        <>
                                            <span>{trade.dte.slice(0, -1)}</span>
                                            <span className={`dte-day ${trade.k === 'C' ? 'call' : 'put'}`}>d</span>
                                        </>
                                    ) : 'N/A'}
                                </td>
                                <td className="highlight-column">{trade.exchange || 'N/A'}</td>
                                <td>{trade.size || 'N/A'}</td>
                                <td>${trade.price || 'N/A'}</td>
                                <td className={`trade-side ${trade.side === 'C' ? 'put' : 'call'}`}>${trade.premium || 'N/A'}</td>
                                <td>{trade.iv || 'N/A'}%</td>
                                <td>{trade.maker || 'N/A'}</td>
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
