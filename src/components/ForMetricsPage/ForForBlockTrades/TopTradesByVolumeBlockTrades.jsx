import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './TopTradesByVolumeBlockTrades.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { Tooltip } from "react-tooltip";
import {CACHE_TTL, optionsCache, useCachedApiCall} from "../../../utils/cacheService.js"; // Добавить импорт

const TopTradesByVolumeBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [timeRange, setTimeRange] = useState('24h');


    // Используем кешированный API-запрос
    const { data, loading, error } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/block-trades/option-volumes/${asset.toLowerCase()}`,
        { timeRange, exchange },
        optionsCache,
        CACHE_TTL.MEDIUM
    );

    // Безопасно преобразуем данные в volumes
    const volumes = Array.isArray(data) ? data : [];

    // Генерация графика
    useEffect(() => {
        if (volumes.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

            const instrumentNames = volumes.map(volume => {
                return volume.instrument_name.split('-').slice(1).join('-');
            });
            const totalVolumes = volumes.map(volume => volume.total_volume);

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
                    data: ['Total Volume'],
                    textStyle: {
                        color: '#B8B8B8',
                        fontFamily: 'JetBrains Mono'
                    },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: instrumentNames,
                    axisLine: {
                        lineStyle: { color: '#A9A9A9' }
                    },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: -45,
                        interval: 0,
                        fontFamily: 'JetBrains Mono'
                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Total Volume (USD)',
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
                        name: 'Total Volume',
                        type: 'bar',
                        data: totalVolumes,
                        barWidth: '30%',
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(51, 117, 249, 1)' },
                                { offset: 1, color: 'rgba(127, 167, 247, 1)' },
                            ]),
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
    }, [volumes]);

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
                    z: 2,
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
                    <h2>
                        🏆
                        Top Options by Volume
                    </h2>
                    <Camera className="icon" id="cameraTop"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="cameraTop" html={true}/>
                    <ShieldAlert
                        className="icon"
                        id="optionTopInfo"
                        data-tooltip-html={`
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Top Options by Volume</b> shows the most actively traded</br> option contracts measured in USD value.
            </div>
            
            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• Each bar represents trading volume for a specific contract</div>
                <div>• Contract format: DDMMYY-STRIKE-TYPE (P/C)</div>
                <div style="margin-bottom: 5px;">• Bar height shows total transaction value in USD</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Insights:</b>
                <div style="margin-top: 5px;">• Large volume often indicates institutional activity</div>
                <div>• Helps identify most significant price levels</div>
                <div style="margin-bottom: 5px;">• Shows real market interest in specific strikes</div>
            </div>
        </div>
    `}
                    />
                    <Tooltip anchorId="optionTopInfo" html={true}/>
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
                {!loading && !error && volumes.length === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && volumes.length > 0 && (
                    <div ref={chartRef} style={{width: '100%', height: '490px'}}></div>
                )}
            </div>
        </div>
    );
};

export default TopTradesByVolumeBlockTrades;
