import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend,
} from 'chart.js';
import './BlockFlowFilters.css';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip'; // Правильный импорт
import { Doughnut } from 'react-chartjs-2';


ChartJS.register(ArcElement, ChartTooltip, Legend);

const makerDescriptions = {
    '🐙🦑': 'Shrimp < $250',
    '🐟🎣': 'Fish < $1,000',
    '🐡🚣': 'Blowfish < $10,000',
    '🐬🌊': 'Dolphin < $100,000',
    '🐋🐳': 'Whale < $1,000,000',
    '🦈': 'Shark < $10,000,000',
};
const getMakerDescription = (makerEmoji) => {
    return makerDescriptions[makerEmoji] || 'Unknown Tier';
};

const MakerCell = ({ maker, index }) => {
    const tooltipId = `maker-tooltip-${index}`;
    const description = getMakerDescription(maker);

    return (
        <td id={tooltipId} data-tooltip-content={description}>
            <span>{maker}</span>
            <Tooltip anchorId={tooltipId} />
        </td>
    );
};
const BlockFlowFilters = ({ asset = 'BTC', tradeType = 'ALL', optionType = 'ALL', sizeOrder, premiumOrder }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [trades, setTrades] = useState([]);
    const [expirations, setExpirations] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(asset);
    const [selectedTradeType, setSelectedTradeType] = useState(tradeType);
    const [strikeMin, setStrikeMin] = useState('');
    const [strikeMax, setStrikeMax] = useState('');
    const [selectedExchange, setSelectedExchange] = useState('');
    const [selectedMaker, setSelectedMaker] = useState('ALL');
    const [selectedOptionType, setSelectedOptionType] = useState('ALL');
    const [ivMin, setIvMin] = useState('');
    const [ivMax, setIvMax] = useState('');
    const [dteMin, setDteMin] = useState('');
    const [dteMax, setDteMax] = useState('');
    const [pageSize, setPageSize] = useState(15);
    const [selectedSide, setSelectedSide] = useState('ALL');
    const [selectedTrade, setSelectedTrade] = useState(null);


    useEffect(() => {
        const handleMouseEnter = (e) => {
            const blockTradeId = e.currentTarget.dataset.blockTradeId;
            if (blockTradeId) {
                document.querySelectorAll(`[data-block-trade-id="${blockTradeId}"]`)
                    .forEach(el => el.classList.add('block-trade-active'));
            }
        };

        const handleMouseLeave = (e) => {
            document.querySelectorAll('.block-trade-highlight')
                .forEach(el => el.classList.remove('block-trade-active'));
        };

        const rows = document.querySelectorAll('.block-trade-highlight');
        rows.forEach(row => {
            row.addEventListener('mouseenter', handleMouseEnter);
            row.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            rows.forEach(row => {
                row.removeEventListener('mouseenter', handleMouseEnter);
                row.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, [trades]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const expiration = expirations[0] || '';

                const params = {
                    asset: selectedAsset,
                    tradeType: selectedTradeType,
                    optionType: selectedOptionType,
                    side: selectedSide,
                    expiration,
                    sizeOrder,
                    premiumOrder,
                    page,
                    exchange: selectedExchange,
                    minStrike: strikeMin || '',
                    maxStrike: strikeMax || '',
                    maker: selectedMaker,
                    ivMin: ivMin || '',
                    ivMax: ivMax || '',
                    dteMin: dteMin || '',
                    dteMax: dteMax || '',
                    pageSize,
                };

                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block/flow/trades`, {
                    params: params,
                });

                const { totalPages, trades } = response.data;

                setTrades(response.data.groupedTrades.flatMap(group =>
                    group.trades.map(trade => ({
                        ...trade,
                        blockTradeId: group.blockTradeId // Добавляем blockTradeId к каждой сделке
                    }))
                ));
                setTotalPages(response.data.totalPages || 1);


            } catch (error) {
                console.error('Error fetching metrics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedAsset, selectedTradeType, selectedOptionType, selectedSide, expirations, sizeOrder, premiumOrder, page, selectedExchange, selectedMaker, strikeMin, strikeMax, ivMin, ivMax, dteMin, dteMax, pageSize]);


    const handleResetFilters = () => {
        setSelectedAsset('ALL');
        setSelectedTradeType('ALL');
        setSelectedOptionType('ALL');
        setStrikeMin('');
        setStrikeMax('');
        setSelectedExchange('');
        setSelectedMaker('ALL');
        setIvMin('');
        setIvMax('');
        setDteMin('');
        setDteMax('');
        setPage(1);
        setPageSize(15);
    };
    const handleMakerChange = (e) => {
        setSelectedMaker(e.target.value);
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

    const TradeModal = ({ trades, onClose }) => {
        if (!trades || trades.length === 0) return null;

        const totalPremium = trades.reduce((sum, trade) => sum + (parseFloat(trade.premium) || 0), 0);
        const totalSize = trades.reduce((sum, trade) => sum + (parseFloat(trade.size) || 0), 0);
        const totalOIChange = trades.reduce((sum, trade) => sum + (parseFloat(trade.oi_change) || 0), 0);

        const formatTradeDetails = (trade) => {
            const instrumentName = trade.instrument_name || 'N/A';
            const strikeMatch = instrumentName.match(/(\d+)-[CP]$/);
            const strike = strikeMatch ? Number(strikeMatch[1]).toLocaleString() : 'N/A';

            const side = trade.side === 'buy' ? '🟢 Bought' : '🔴 Sold';
            const aboveBelow = trade.side === 'buy' ? 'Below the ask' : 'Above the bid';

            const premium = trade.premium ? parseFloat(trade.premium).toFixed(4) : 'N/A';
            const premiumUSD = trade.price ? parseFloat(trade.price).toLocaleString() : 'N/A';

            return `${side} 🔷 ${instrumentName} 📈 at ${premium}Ξ ($${premiumUSD}) 
Total ${trade.side === 'buy' ? 'Bought' : 'Sold'}: ${trade.size ? trade.size.toLocaleString() : 'N/A'}Ξ ($${premiumUSD}), IV: ${trade.iv || 'N/A'}% 
bid: ${trade.bid || 'N/A'} (Size: ${trade.bid_size || 'N/A'}) mark: ${trade.mark || 'N/A'} ask: ${trade.ask || 'N/A'} (Size: ${trade.ask_size || 'N/A'}) 
${aboveBelow}
OI Change: ${trade.oi_change || 'N/A'}`;
        };

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close-button" onClick={onClose}>×</button>
                    <h2>Trade Details</h2>
                    {trades.map((trade, index) => (
                        <p key={index}>{formatTradeDetails(trade)}</p>
                    ))}
                    <p>
                        <strong>Net Premium:</strong> {totalPremium.toFixed(4)}Ξ<br />
                        <strong>Total Size:</strong> {totalSize.toLocaleString()}Ξ<br />
                        <strong>Total OI Change:</strong> {totalOIChange.toLocaleString()}<br />
                    </p>
                    <p>Block Trade ID: {trades[0].blockTradeId}</p>
                </div>
            </div>
        );
    };



    return (

        <div className="flow-main-container">
            {/* Фильтры */}
            <div className="block-flow-filters">
                <button className="filter-button" onClick={toggleFilters}>
                    Filters
                </button>
                {/*<div className="stream-toggle">*/}
                {/*    <span>Stream</span>*/}
                {/*    <label className="toggle-switch">*/}
                {/*        <input*/}
                {/*            type="checkbox"*/}
                {/*            checked={isChecked}*/}
                {/*            onChange={handleToggle}*/}
                {/*        />*/}
                {/*        <span className="slider"></span>*/}
                {/*    </label>*/}
                {/*</div>*/}
                <select
                    className="size-dropdown"
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value, 10))} // Convert to integer
                >
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
                                    <option value="🦈">MEGALADON</option>
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
                                <select
                                    value={selectedSide}
                                    onChange={(e) => setSelectedSide(e.target.value)}
                                >
                                    <option value="ALL">ALL</option>
                                    <option value="buy">BUY</option>
                                    <option value="sell">SELL</option>
                                </select>

                            </div>


                            <div className="filter-field">
                                <label>IV Min</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={ivMin}
                                    onChange={(e) => setIvMin(e.target.value)}
                                />
                            </div>

                            <div className="filter-field">
                                <label>DTE Min</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={dteMin}
                                    onChange={(e) => setDteMin(e.target.value)}
                                />
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
                                <input
                                    type="number"
                                    placeholder="∞"
                                    value={ivMax}
                                    onChange={(e) => setIvMax(e.target.value)}
                                />
                            </div>

                            <div className="filter-field">
                                <label>DTE Max</label>
                                <input
                                    type="number"
                                    placeholder="∞"
                                    value={dteMax}
                                    onChange={(e) => setDteMax(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="filter-actions">
                        {/*<button className="filter-action-button" onClick={handleSaveFilters}>*/}
                        {/*    Save*/}
                        {/*</button>*/}
                        <button className="filter-action-button" onClick={handleResetFilters}>
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
                            <tr
                                key={`${trade.block_trade_id}-${index}`}
                                className={`trade-row ${trade.blockTradeId ? 'block-trade-highlight' : ''}`}
                                data-block-trade-id={trade.blockTradeId}
                                onMouseEnter={(e) => {
                                    // Подсветка всех сделок с таким же blockTradeId
                                    if (trade.blockTradeId) {
                                        const blockTradeId = trade.blockTradeId;
                                        document.querySelectorAll(`[data-block-trade-id="${blockTradeId}"]`)
                                            .forEach(el => el.classList.add('block-trade-active'));
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    // Убираем подсветку
                                    document.querySelectorAll('.trade-row')
                                        .forEach(el => el.classList.remove('block-trade-active'));
                                }}
                                onClick={() => {
                                    const groupTrades = trades.filter(t => t.blockTradeId === trade.blockTradeId);
                                    console.log('Selected group trades:', groupTrades); // Для отладки
                                    setSelectedTrade(groupTrades); // Устанавливаем группу сделок
                                }}

                            >
                                <td>{getFormattedTime(trade.timeutc)}</td>
                                <td className={`trade-side ${trade.side === 'buy' ? 'buy' : 'sell'}`}>
                                    {trade.side ? trade.side.toUpperCase() : 'N/A'}
                                </td>
                                <td className="highlight-column">{trade.instrument_name ? trade.instrument_name.slice(0, 3) : 'N/A'}</td>
                                <td>
                                    ${trade.instrument_name.match(/(\d+)-[CP]$/)
                                    ? Number(trade.instrument_name.match(/(\d+)-[CP]$/)[1]).toLocaleString()
                                    : 'N/A'}
                                </td>
                                <td className={`trade-side ${trade.k === 'C' ? 'call' : trade.k === 'P' ? 'put' : ''}`}>
                                    {trade.k === 'C' ? 'CALL' : trade.k === 'P' ? 'PUT' : 'N/A'}
                                </td>
                                <td className="highlight-column">{trade.chain || 'N/A'}</td>
                                <td>
                                    ${trade.spot ? Number(trade.spot).toLocaleString() : 'N/A'}
                                </td>
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
                                <td>${trade.price ? Number(trade.price).toLocaleString() : 'N/A'}</td>
                                <td className={`trade-side ${trade.k === 'C' ? 'call' : 'put'}`}>
                                    ${trade.premium ? Number(trade.premium).toLocaleString() : 'N/A'}
                                </td>
                                <td>{trade.iv || 'N/A'}%</td>
                                <MakerCell maker={trade.maker} index={index} />
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
            {selectedTrade && (
                <TradeModal trades={selectedTrade} onClose={() => setSelectedTrade(null)} />
            )}
        </div>
    );
};

export default BlockFlowFilters;
