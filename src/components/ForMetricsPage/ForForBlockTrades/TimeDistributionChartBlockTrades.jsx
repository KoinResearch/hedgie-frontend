import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './TimeDistributionChartBlockTrades.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { CACHE_TTL, optionsCache, useCachedApiCall } from "../../../utils/cacheService.js";

const TimeDistributionChartBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [timeRange, setTimeRange] = useState('24h');

    // Используем кешированный API-запрос
    const { data, loading, error } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/block-trades/time-distribution/${asset.toLowerCase()}`,
        { timeRange, exchange },
        optionsCache,
        CACHE_TTL.SHORT // Используем короткий TTL (1 минута) для временных данных
    );

    // Безопасно преобразуем данные
    const distributionData = Array.isArray(data) ? data : [];
    // Генерация графика
    useEffect(() => {
        if (distributionData.length === 0) {
            return;
        }

        if (chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

            const currentHour = new Date().getUTCHours();

            const hours = Array.from({ length: 24 }, (_, i) => `${(currentHour - i + 24) % 24}:00`).reverse();

            const callCounts = distributionData.map(hourData => hourData.calls.reduce((acc, trade) => acc + parseInt(trade.trade_count), 0));
            const putCounts = distributionData.map(hourData => hourData.puts.reduce((acc, trade) => acc + parseInt(trade.trade_count), 0));

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: {
                        color: '#000',
                        fontFamily: 'JetBrains Mono',
                    },
                },
                legend: {
                    data: ['Calls', 'Puts'],
                    textStyle: {
                        color: '#B8B8B8',
                        fontFamily: 'JetBrains Mono',
                    },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: hours,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45,
                        interval: 0,
                        fontFamily: 'JetBrains Mono',
                    },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Number of Trades',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: {
                            color: '#7E838D',
                            fontFamily: 'JetBrains Mono',
                        },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    }
                ],
                series: [
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: callCounts,
                        barWidth: '30%',
                        itemStyle: { color: 'rgba(39,174,96, 0.8)' },
                    },
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: putCounts,
                        barWidth: '30%',
                        itemStyle: { color: 'rgba(231,76,60, 0.8)' },
                    }
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
    }, [distributionData]);

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
                a.download = `option_flow_chart_${asset}.png`;
                a.click();
            }, 1000); // Задержка в 1000мс для полной отрисовки
        }
    };


    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>📦 Historical Volume - Past 24h</h2>
                    <Camera className="icon" id="camerDis"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="camerDis" html={true}/>
                    <ShieldAlert
                        className="icon"
                        id="timeInfo"
                        data-tooltip-html={`
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Historical Volume (24h)</b> shows the hourly distribution</br> of options trading activity. Data can be aggregated from:</br> past 24 hours, last week, or last month.
            </div>
            
            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• X-axis shows daily 24-hour cycle in hourly intervals</div>
                <div>• Green bars represent Call option trades</div>
                <div>• Red bars represent Put option trades</div>
                <div style="margin-bottom: 5px;">• Bar height shows average number of contracts per hour</div>
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                Time range options:
                <div style="margin-top: 5px;">• Past 24h: Shows raw hourly data</div>
                <div>• Last Week: Shows average hourly pattern over 7 days</div>
                <div style="margin-bottom: 5px;">• Last Month: Shows average hourly pattern over 30 days</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Insights:</b>
                <div style="margin-top: 5px;">• Identifies consistent peak trading hours</div>
                <div>• Shows reliable intraday patterns</div>
                <div style="margin-bottom: 5px;">• Helps optimize trade execution timing</div>
            </div>
        </div>
    `}
                    />
                    <Tooltip anchorId="timeInfo" html={true}/>
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
                {!loading && !error && data.length > 0 && (
                    <div ref={chartRef} style={{width: '100%', height: '490px'}}></div>
                )}
            </div>
        </div>
    );
};

export default TimeDistributionChartBlockTrades;


