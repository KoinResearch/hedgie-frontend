import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import './HistoricalOpenInterestChart.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { CACHE_TTL, optionsCache, useCachedApiCall } from "../../../utils/cacheService";


const HistoricalOpenInterestChart = () => {
    const [exchange, setExchange] = useState('DER');
    const [asset, setAsset] = useState('BTC');
    const [period, setPeriod] = useState('1d');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const {
        data,
        loading,
        error
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/historical-open-interest/${asset.toLowerCase()}/${period}`,
        { exchange },
        optionsCache,
        CACHE_TTL.SHORT
    );

    // Безопасное сохранение данных
    const chartData = Array.isArray(data) ? data : [];


    // Генерация графика
    useEffect(() => {
        if (chartData && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

            // Преобразуем данные для отображения на графике
            const timestamps = chartData.map(entry => dayjs(entry.timestamp).format('YYYY-MM-DD HH:mm'));
            const totalContracts = chartData.map(entry => Number(entry.total_contracts || 0).toFixed(2));
            const avgIndexPrices = chartData.map(entry => Number(entry.avg_index_price || 0).toFixed(2));

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line',
                        axis: 'x',
                        label: {
                            backgroundColor: '#FFFFFF',
                            color: '#000000',
                            fontFamily: 'JetBrains Mono',
                        },
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: {
                        color: '#000000',
                        fontFamily: 'JetBrains Mono',
                    },
                    formatter: function (params) {
                        let result = `<b>${params[0].axisValue}</b><br/>`;
                        params.forEach((item) => {
                            result += `<span style="color:${item.color};">●</span> ${item.seriesName}: ${parseFloat(item.value).toFixed(2)}<br/>`;
                        });
                        return result;
                    },
                },
                legend: {
                    data: ['Total Contracts', 'Index Price'],
                    textStyle: {
                        color: '#B8B8B8',
                        fontFamily: 'JetBrains Mono',
                    },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: timestamps,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        fontFamily: 'JetBrains Mono',
                    },
                },
                yAxis: [
                    {
                        type: 'log',
                        name: 'Total Contracts',
                        axisLine: { lineStyle: { color: '#7f7f7f' } },
                        axisLabel: {
                            color: '#7E838D',
                            fontFamily: 'JetBrains Mono',
                            formatter: function (value) {
                                return value.toFixed(2);
                            },
                        },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                    {
                        type: 'value',
                        name: 'Index Price',
                        axisLine: { lineStyle: { color: '#7f7f7f' } },
                        axisLabel: {
                            color: '#7f7f7f',
                            fontFamily: 'JetBrains Mono',
                            formatter: function (value) {
                                return value.toFixed(2);
                            },
                        },
                        splitLine: { show: false },
                        position: 'right',
                    },
                ],
                series: [
                    {
                        name: 'Total Contracts',
                        type: 'line',
                        data: totalContracts,
                        smooth: true,
                        lineStyle: { color: '#e74c3c', width: 2 },
                        areaStyle: { color: '#e74c3c', opacity: 0.2 },
                    },
                    {
                        name: 'Index Price',
                        type: 'line',
                        data: avgIndexPrices,
                        smooth: true,
                        yAxisIndex: 1,
                        lineStyle: { color: '#7f7f7f', width: 2 },
                    },
                ],
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    top: '15%',
                    containLabel: true,
                },
            };

            chartInstance.setOption(option);

            const handleResize = () => {
                chartInstance.resize();
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chartInstance.dispose();
            };
        }
    }, [chartData]);

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
                a.download = `open_interest_by_strike_${asset}.png`;
                a.click();
            }, 1000); // Задержка в 1000мс для полной отрисовки
        }
    };

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>🤠 Historical Open Interest Chart</h2>
                    <Camera className="icon" id="historyCamera"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="historyCamera" html={true}/>
                    <ShieldAlert
                        className="icon"
                        id="historyInfo"
                        data-tooltip-html={`
       <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
           <div style="margin-bottom: 10px;">
               <b>Historical Open Interest Chart</b> shows the evolution</br> of total open contracts over time in relation to the</br> underlying asset price.
           </div>
           
           <div style="margin-left: 10px; margin-bottom: 10px;">
               How to read:
               <div style="margin-top: 5px;">• Red line - Total number of open contracts (left axis)</div>
               <div>• Green line - Price of the underlying asset (right axis)</div>
               <div>• X-axis shows time periods (selectable timeframes)</div>
               <div style="margin-bottom: 5px;">• Area shows the relationship between price and interest</div>
           </div>

           <div style="margin-left: 10px; margin-bottom: 10px;">
               Time periods available:
               <div style="margin-top: 5px;">• 1d: Last 24 hours data</div>
               <div>• 7d: Weekly trend analysis</div>
               <div style="margin-bottom: 5px;">• 1m: Monthly historical view</div>
           </div>

           <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
               <b>Trading Applications:</b>
               <div style="margin-top: 5px;">• Track changes in market participation</div>
               <div>• Identify trends in options activity</div>
               <div style="margin-bottom: 5px;">• Compare price movement with options interest</div>
           </div>
       </div>
   `}
                    />
                    <Tooltip anchorId="historyInfo" html={true}/>
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
                        <select onChange={(e) => setPeriod(e.target.value)} value={period}>
                            <option value="1d">1d</option>
                            <option value="7d">7d</option>
                            <option value="1m">1m</option>
                            <option value="all">All</option>
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
                        <select value={exchange} onChange={(e) => setExchange(e.target.value)}>
                            <option value="DER">Deribit</option>
                            <option value="OKX">OKX</option>
                        </select>
                        <span className="custom-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
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
                {!loading && !error && !data && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && data && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default HistoricalOpenInterestChart;
