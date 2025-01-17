import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './StrikeActivityChartBlockTrades.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { Tooltip } from "react-tooltip";
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from "../../../utils/cacheService.js";


const StrikeActivityChartBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const [expiration, setExpiration] = useState('All Expirations');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [timeRange, setTimeRange] = useState('24h');


// Запрос на получение списка expiration дат (кешируем на длительное время)
    const {
        data: expirationsData,
        loading: expirationsLoading,
        error: expirationsError
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`,
        null,
        expirationCache,
        CACHE_TTL.LONG // Кешируем на 15 минут
    );

    // Безопасно преобразуем данные expirations
    const expirations = ['All Expirations', ...(Array.isArray(expirationsData) ? expirationsData : [])];

    // Запрос на получение данных по активности
    const {
        data: strikeData,
        loading: strikeLoading,
        error: strikeError
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/block-trades/strike-activity/${asset.toLowerCase()}`,
        { expiration, timeRange, exchange },
        optionsCache,
        CACHE_TTL.MEDIUM // Кешируем на 5 минут
    );

    // Безопасно преобразуем данные активности
    const data = Array.isArray(strikeData) ? strikeData : [];

    // Определяем состояние загрузки и ошибки
    const loading = expirationsLoading || strikeLoading;
    const error = expirationsError || strikeError;

    // Генерация графика
    useEffect(() => {
        if (data.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

            let callData = data.filter(d => d.option_type === 'C');
            let putData = data.filter(d => d.option_type === 'P');

            callData = callData.sort((a, b) => a.strike_price - b.strike_price);
            putData = putData.sort((a, b) => a.strike_price - b.strike_price);

            const strikePrices = callData.map(d => d.strike_price);
            const callTradeCounts = callData.map(d => d.trade_count);
            const putTradeCounts = putData.map(d => d.trade_count);

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: {
                        color: '#000',
                        fontFamily: 'JetBrains Mono'
                    },
                },
                legend: {
                    data: ['Calls', 'Puts'],
                    textStyle: {
                        color: '#B8B8B8',
                        fontFamily: 'JetBrains Mono'
                    },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: strikePrices,
                    axisLine: {
                        lineStyle: { color: '#A9A9A9' }
                    },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45,
                        interval: 0,
                        fontFamily: 'JetBrains Mono'
                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Number of Trades',
                    axisLine: {
                        lineStyle: { color: '#A9A9A9' }
                    },
                    axisLabel: {
                        color: '#7E838D',
                        fontFamily: 'JetBrains Mono'
                    },
                    splitLine: {
                        lineStyle: { color: '#393E47' }
                    },
                },
                series: [
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: callTradeCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(39,174,96, 0.8)',
                        },
                    },
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: putTradeCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(231,76,60, 0.8)',
                        },
                    },
                ],
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '5%',
                    top: '10%',
                    containLabel: true,
                },
            };

            chartInstance.setOption(option);

            const handleResize = () => chartInstance.resize();
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chartInstance.dispose();
            };
        }
    }, [data]);

    const handleDownload = () => {
        if (chartInstanceRef.current) {
            // Создаем временный div для нового графика
            const tempDiv = document.createElement('div');
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.position = 'absolute';
            tempDiv.style.width = chartInstanceRef.current.getWidth() + 'px';
            tempDiv.style.height = chartInstanceRef.current.getHeight() + 'px';
            document.body.appendChild(tempDiv);

            // Создаем временный экземпляр графика
            const tempChart = echarts.init(tempDiv);

            // Получаем текущие опции и добавляем водяной знак
            const currentOption = chartInstanceRef.current.getOption();
            const optionWithWatermark = {
                ...currentOption,
                graphic: [{
                    type: 'text',
                    left: '50%',
                    top: '50%',
                    z: -1,
                    style: {
                        text: 'hedgie.org',
                        fontSize: 80,
                        fontFamily: 'JetBrains Mono',
                        fontWeight: 'bold',
                        fill: 'rgba(255, 255, 255, 0.06)',
                        align: 'center',
                        verticalAlign: 'middle',
                        transform: 'translate(-50%, -50%)'
                    }
                }]
            };

            // Применяем опции к временному графику
            tempChart.setOption(optionWithWatermark);

            // Ждем отрисовки данных
            setTimeout(() => {
                // Создаем URL и скачиваем
                const url = tempChart.getDataURL({
                    type: 'png',
                    pixelRatio: 2,
                    backgroundColor: '#151518',
                });

                // Очищаем временные элементы
                tempChart.dispose();
                document.body.removeChild(tempDiv);

                // Скачиваем изображение
                const a = document.createElement('a');
                a.href = url;
                a.download = `strike_activity_chart_${asset}.png`;
                a.click();
            }, 1000); // Задержка в 1000мс для полной отрисовки
        }
    };


    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>📈 Volume By Strike Price</h2>
                    <Camera className="icon" id="cameraStr"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="cameraStr" html={true}/>
                    <ShieldAlert
                        className="icon"
                        id="strikeInfo"
                        data-tooltip-html={`
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Volume By Strike Price</b> visualizes the distribution of option</br> trading activity across different strike prices, separated</br> into Calls and Puts.
            </div>
            
            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• X-axis shows strike prices in ascending order</div>
                <div>• Green bars represent Call option activity</div>
                <div>• Red bars represent Put option activity</div>
                <div style="margin-bottom: 5px;">• Bar height shows number of trades at each strike</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Applications:</b>
                <div style="margin-top: 5px;">• Identifies most active strike prices</div>
                <div>• Shows market sentiment at different price levels</div>
                <div style="margin-bottom: 5px;">• Helps spot potential support/resistance zones</div>
            </div>
        </div>
    `}
                    />
                    <Tooltip anchorId="strikeInfo" html={true}/>
                    <div className="asset-option-buttons">
                        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                            <option value="24h">Past 24 Hours</option>
                            <option value="7d">Last Week</option>
                            <option value="30d">Last Month</option>
                        </select>
                        <span className="custom-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                        <span className="custom-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                    <div className="asset-option-buttons">
                        <select onChange={(e) => setExpiration(e.target.value)} value={expiration}>
                            {expirations.map(exp => (
                                <option key={exp} value={exp}>
                                    {exp}
                                </option>
                            ))}
                        </select>
                        <span className="custom-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                    {/*<div className="asset-option-buttons">*/}
                    {/*    <select value={exchange} onChange={(e) => setExchange(e.target.value)}>*/}
                    {/*        <option value="DER">Deribit</option>*/}
                    {/*        /!*<option value="OKX">OKX</option>*!/*/}
                    {/*    </select>*/}
                    {/*    <span className="custom-arrow">*/}
                    {/*        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"*/}
                    {/*             xmlns="http://www.w3.org/2000/svg">*/}
                    {/*            <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667"*/}
                    {/*                  stroke-linecap="round" stroke-linejoin="round"/>*/}
                    {/*        </svg>*/}
                    {/*    </span>*/}
                    {/*</div>*/}
                </div>
                <div className="flow-option-dedicated"></div>
            </div>
            <div className="graph">
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                )}
                {!loading && error && (
                    <div className="error-container">
                        <p>Error: {error}</p>
                    </div>
                )}
                {!loading && !error && data.length === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && data.length > 0 && (
                    <div ref={chartRef} style={{width: '100%', height: '490px'}}></div>
                )}
            </div>
        </div>
    );
};

export default StrikeActivityChartBlockTrades;


