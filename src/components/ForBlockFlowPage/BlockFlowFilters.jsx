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
import { erf } from 'mathjs';
import OpenAI from 'openai';


const openai = new OpenAI({
    apiKey: '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',
    dangerouslyAllowBrowser: true
});


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
    const [selectedMarkPrice, setSelectedMarkPrice] = useState(null);


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
                    markPrice: selectedMarkPrice || '',  // Добавляем параметр markPrice, если нужно
                };

                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block/flow/trades`, {
                    params: params,
                });

                const { totalPages, groupedTrades } = response.data;

                const tradesWithBlockId = groupedTrades.flatMap(group =>
                    group.trades.map(trade => ({
                        ...trade,
                        blockTradeId: group.blockTradeId,  // Добавляем blockTradeId к каждой сделке
                        markPrice: trade.markPrice || 'N/A', // Добавляем markPrice в каждую сделку
                    }))
                );

                setTrades(tradesWithBlockId);
                setTotalPages(totalPages || 1);

            } catch (error) {
                console.error('Error fetching metrics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [
        selectedAsset, selectedTradeType, selectedOptionType, selectedSide, expirations,
        sizeOrder, premiumOrder, page, selectedExchange, selectedMaker, strikeMin, strikeMax,
        ivMin, ivMax, dteMin, dteMax, pageSize, selectedMarkPrice  // Добавляем selectedMarkPrice в зависимости
    ]);



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
    const calculateNetDebitOrCredit = (trades) => {
        let totalBought = 0; // Общая сумма премий для покупок
        let totalSold = 0; // Общая сумма премий для продаж

        trades.forEach(trade => {
            // Высчитываем премию в базовом активе
            const premiumAllInBaseAsset = trade.premium && trade.spot
                ? parseFloat(trade.premium) / parseFloat(trade.spot)
                : 0; // Если премия или spot отсутствуют, используем 0

            if (trade.side === 'buy') {
                totalBought += premiumAllInBaseAsset; // Для покупок прибавляем премию
            } else if (trade.side === 'sell') {
                totalSold += premiumAllInBaseAsset; // Для продаж прибавляем премию
            }

        });


        if (totalBought > totalSold) {
            return {
                type: 'Net Debit',
                amount: (totalBought - totalSold).toFixed(4),
                totalBought: totalBought.toFixed(4),
                totalSold: totalSold.toFixed(4),
            };
        } else {
            return {
                type: 'Net Credit',
                amount: (totalSold - totalBought).toFixed(4),
                totalBought: totalBought.toFixed(4),
                totalSold: totalSold.toFixed(4),
            };
        }
    };
// Функция для вычисления ошибки (error function)
    const erf = (x) => {
        // Коэффициенты для разложения в ряде
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        // Абсолютное значение x
        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x);

        // Ряд Тейлора для расчета ошибки
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    };

// Функция для вычисления Греков для опционов
    const calculateGreeks = (S, X, T, r, sigma, optionType = 'call') => {
        // Расширенная валидация
        if (!S || !X || !T || !r || !sigma || S <= 0 || sigma <= 0) {
            console.warn("Invalid input parameters for Greeks calculation");
            return { delta: 0, gamma: 0, vega: 0, theta: 0 };
        }

        const SQRT_2_PI = Math.sqrt(2 * Math.PI);
        const DAYS_IN_YEAR = 365.25;

        const d1 = (Math.log(S / X) + (r + (sigma ** 2) / 2) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);

        const normPDF = (x) => Math.exp(-0.5 * x * x) / SQRT_2_PI;
        const normCDF = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));

        let delta, gamma, vega, theta;

        if (optionType === 'call') {
            delta = normCDF(d1);

            // Более точный расчет гаммы
            gamma = normPDF(d1) / (S * sigma * Math.sqrt(T));

            // Стандартный расчет веги
            vega = S * Math.sqrt(T) * normPDF(d1);

            theta = -(S * normPDF(d1) * sigma) / (2 * Math.sqrt(T))
                - r * X * Math.exp(-r * T) * normCDF(d2);
        } else if (optionType === 'put') {
            delta = -normCDF(-d1);

            // Более точный расчет гаммы
            gamma = normPDF(d1) / (S * sigma * Math.sqrt(T));

            // Стандартный расчет веги
            vega = S * Math.sqrt(T) * normPDF(d1);

            theta = -(S * normPDF(d1) * sigma) / (2 * Math.sqrt(T))
                + r * X * Math.exp(-r * T) * normCDF(-d2);
        } else {
            throw new Error("Invalid option type. Must be 'put' or 'call'.");
        }

        theta = theta / DAYS_IN_YEAR;

        return { delta, gamma, vega, theta };
    };
// Функция для вычисления общих Греков для всех сделок
    const calculateOverallGreeks = (trades) => {
        if (!trades || trades.length === 0) {
            return { delta: 0, gamma: 0, vega: 0, theta: 0 };
        }

        let totalDelta = 0, totalGamma = 0, totalVega = 0, totalTheta = 0;

        trades.forEach(trade => {
            const size = parseFloat(trade.size || 1);
            const optionType = trade.instrument_name.includes('-C') ? 'call' : 'put';

            const greeks = calculateGreeks(
                parseFloat(trade.spot),
                parseFloat(trade.strike),
                parseFloat(trade.dte) / 365.25,  // Используем более точное значение дней в году
                0.01, // Безрисковая ставка
                parseFloat(trade.iv) / 100,
                optionType
            );

            // Учитываем направление сделки (покупка/продажа)
            const multiplier = trade.side === 'sell' ? -1 : 1;

            totalDelta += greeks.delta * size * multiplier;
            totalGamma += greeks.gamma * size * multiplier;
            totalVega += greeks.vega * size * multiplier;
            totalTheta += greeks.theta * size * multiplier;
        });

        return { delta: totalDelta, gamma: totalGamma, vega: totalVega, theta: totalTheta };
    };

    const calculateCalendarSpreadGreeks = (trades) => {
        if (trades.length !== 2) {
            console.error("Expected exactly 2 trades for a calendar spread calculation.");
            return { delta: 0, gamma: 0, vega: 0, theta: 0 };
        }

        const [longLeg, shortLeg] = trades;
        const longOptionType = longLeg.instrument_name.includes('-C') ? 'call' : 'put';
        const shortOptionType = shortLeg.instrument_name.includes('-C') ? 'call' : 'put';

        const longGreeks = calculateGreeks(
            parseFloat(longLeg.spot),
            parseFloat(longLeg.strike),
            parseFloat(longLeg.dte) / 365,
            0.01,
            parseFloat(longLeg.iv) / 100,
            longOptionType
        );

        const shortGreeks = calculateGreeks(
            parseFloat(shortLeg.spot),
            parseFloat(shortLeg.strike),
            parseFloat(shortLeg.dte) / 365,
            0.01,
            parseFloat(shortLeg.iv) / 100,
            shortOptionType
        );

        const size = parseFloat(longLeg.size || 1);
        const delta = (longGreeks.delta - shortGreeks.delta) * size;
        const gamma = (longGreeks.gamma - shortGreeks.gamma) * size;
        const vega = (longGreeks.vega - shortGreeks.vega) * size;
        const theta = (longGreeks.theta - shortGreeks.theta) * size;

        return { delta, gamma, vega, theta };
    };


// Компонент для отображения модалки с деталями сделок
    const TradeModal = ({ trades, onClose }) => {
        const [analysis, setAnalysis] = useState('');
        const [isLoading, setIsLoading] = useState(false);

        const getAnalysis = async (trades) => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/analyze`, { trades }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                setAnalysis(response.data.choices[0].message.content);
            } catch (error) {
                console.error('AI Analysis error:', error);
                setAnalysis('Failed to get analysis');
            }
        };

        useEffect(() => {
            if (trades) {
                getAnalysis(trades);
            }
        }, [trades]);

        if (!trades || trades.length === 0) return null;

        const { type, amount } = calculateNetDebitOrCredit(trades);

        const greekCalculationMethod = trades.length === 2
            ? calculateCalendarSpreadGreeks
            : calculateOverallGreeks;

        const { delta: totalDelta, gamma: totalGamma, vega: totalVega, theta: totalTheta } = greekCalculationMethod(trades);

        const calculateOIChange = (trade) => {
            const size = trade.size ? parseFloat(trade.size) : 0;
            return trade.side === 'sell' ? size : 0;
        };

        const getExecutionDetails = (side, executionType) => {
            if (executionType === 'Below the ask') {
                return '(Market Maker PREVENTED liquidity by buying cheaper\nthan the market)';
            } else if (executionType === 'Above the bid') {
                return '(Market Maker PREVENTED liquidity by selling\nabove the market)';
            }
        };

        const formatSize = (trades) => {
            // Создаем строку с размерами для заголовка
            const sizes = trades.map(trade => {
                const size = trade.size ? parseFloat(trade.size).toFixed(1) : '0';
                const type = trade.instrument_name.endsWith('-C') ? 'C' : 'P';
                return `x${size}${type}`;
            });

            // Возвращаем форматированную строку с размерами
            return `(${sizes.join('/')})`;
        };

        const formatTradeDetails = (trade) => {
            const instrumentName = trade.instrument_name || 'N/A';
            const size = trade.size ? parseFloat(trade.size).toFixed(1) : 'N/A';

            // Определяем базовую часть side с размером
            const sideBase = trade.side === 'buy' ? '🟢 Bought' : '🔴 Sold';
            // Добавляем размер к сделке
            const sideWithSize = `${sideBase} x${size}`;

            const executionType = trade.side === 'buy' ? 'Below the ask' : 'Above the bid';
            const executionMessage = getExecutionDetails(trade.side, executionType);
            const oiChange = calculateOIChange(trade);

            const premium = trade.premium ? parseFloat(trade.premium).toFixed(4) : 'N/A';
            const premiumUSD = trade.price ? parseFloat(trade.price).toLocaleString() : 'N/A';
            const premiumInBaseAsset = trade.price && trade.spot ? (parseFloat(trade.price) / trade.spot).toFixed(4) : 'N/A';
            const premiumAllInBaseAsset = trade.premium && trade.spot ? (parseFloat(trade.premium) / trade.spot).toFixed(4) : 'N/A';

            return `${sideWithSize} 🔷 ${instrumentName} 📈 at ${premiumInBaseAsset} Ξ ($${premiumUSD}) 
Total ${trade.side === 'buy' ? 'Bought' : 'Sold'}: ${premiumAllInBaseAsset} Ξ ($${premium}), IV: ${trade.iv || 'N/A'}%,  mark: ${trade.mark_price}
${executionType} ${executionMessage}
OI Change: ${oiChange}`;
        };

        const handleCopy = () => {
            const sizeText = formatSize(trades);
            const tradeDetailsText = trades.map((trade) => formatTradeDetails(trade)).join('\n\n');

            const liquidityNote = `
---- TRADE EXECUTION NOTE ----
When Market Maker PREVENTS liquidity:
• Below the ask - buying cheaper than the market
• Above the bid - selling above the market

When Market Maker PROVIDES liquidity:
• Below the ask - offering better prices for buyers
• Above the bid - offering better prices for sellers
`;

            const greekDetailsText = `
---- OVERALL GREEKS ----
Δ: ${totalDelta.toFixed(4)}, Γ: ${totalGamma.toFixed(6)}, ν: ${totalVega.toFixed(2)}, Θ: ${totalTheta.toFixed(2)}

---- ADDITIONAL INFO ----
Block Trade ID: ${trades[0]?.blockTradeId}

-------------------------

* Delta (Δ): Represents the option's price change when the underlying asset changes by one unit.
* Gamma (Γ): Measures the rate of change of Delta as the underlying price changes.
* Vega (ν): Reflects the sensitivity of the option's price to changes in implied volatility.
* Theta (Θ): Indicates how the option price decreases over time due to time decay.
`;

            const copyText = `---- TRADE DETAILS ----\n\n${sizeText}\n\n${tradeDetailsText}\n\n${liquidityNote}\n${greekDetailsText}`;

            navigator.clipboard.writeText(copyText)
                .then(() => {
                    alert('Data copied to clipboard!');
                })
                .catch((err) => {
                    console.error('Error copying to clipboard: ', err);
                    alert('Failed to copy data');
                });
        };

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close-button" onClick={onClose}>×</button>
                    <div className="modal-close-title">
                        <h1>Trade Details</h1>
                        <button className="block-trades-copy" onClick={handleCopy}>Copy Data</button>
                    </div>
                    <div className="flow-option-dedicated"></div>
                    <pre>{formatSize(trades)}</pre>
                    {trades.map((trade, index) => (
                        <pre key={index}>{formatTradeDetails(trade)}</pre>
                    ))}
                    <p>
                        <strong>{type}:</strong> {amount} Ξ
                        (${trades[0]?.spot ? (parseFloat(amount) * trades[0].spot).toFixed(2) : 'N/A'})
                    </p>
                    <p>
                        <strong>Overall Greeks:</strong> <br/>
                        Δ: {totalDelta.toFixed(4)}, Γ: {totalGamma.toFixed(6)}, ν: {totalVega.toFixed(2)},
                        Θ: {totalTheta.toFixed(2)}
                    </p>
                    <p>Block Trade ID: {trades[0].blockTradeId}</p>
                </div>
                <div className="w-96 ml-4 bg-gray-900 p-4 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">AI Analysis</h3>
                    {isLoading ? (
                        <div className="text-center">Analyzing trade...</div>
                    ) : (
                        <div className="whitespace-pre-wrap">{analysis}</div>
                    )}
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
                                <MakerCell maker={trade.maker} index={index}/>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
            {selectedTrade && (
                <TradeModal trades={selectedTrade} onClose={() => setSelectedTrade(null)}/>
            )}
            <div className="footer-button">
                <button className="toggle-button" onClick={handlePreviousPage} disabled={page === 1}>
                    Previous
                </button>
                <button className="toggle-button" onClick={handleNextPage} disabled={page === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default BlockFlowFilters;
