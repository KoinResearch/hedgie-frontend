import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './TopTradedOptionsChart.css'; // Подключение стилей для спиннера и контейнеров
import { ShieldAlert, Camera } from 'lucide-react';
import { Tooltip } from "react-tooltip";

const TopTradedOptionsChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null); // Ref для диаграммы ECharts
    const chartInstanceRef = useRef(null); // Ref для хранения инстанса диаграммы

    // Функция получения данных с сервера
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/popular-options/${asset.toLowerCase()}`);
                setTrades(response.data);
            } catch (error) {
                console.error('Error fetching option volume data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [asset]);

    // Функция создания графика с ECharts
    useEffect(() => {
        if (trades.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance; // Сохраняем инстанс диаграммы для использования при скачивании

            // Обрезаем символ актива
            const instrumentNames = trades.map(trade => {
                return trade.instrument_name.split('-').slice(1).join('-'); // Убираем символ актива (например, 'BTC-')
            });
            const tradeCounts = trades.map(trade => trade.trade_count);

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: { color: '#000' },
                },
                legend: {
                    data: ['Trade Counts'],
                    textStyle: { color: '#B8B8B8' },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: instrumentNames, // Обновляем данные оси X
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: -45,
                        interval: 0,
                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Trade Counts',
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: { color: '#7E838D' },
                    splitLine: { lineStyle: { color: '#393E47' } },
                },
                series: [
                    {
                        name: 'Trade Counts',
                        type: 'bar',
                        data: tradeCounts,
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
    }, [trades]);

    // Функция для скачивания графика
    const handleDownload = () => {
        if (chartInstanceRef.current) {
            const url = chartInstanceRef.current.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#FFFFFF', // Белый фон для изображения
            });
            const a = document.createElement('a');
            a.href = url;
            a.download = `option_flow_chart_${asset}.png`; // Имя файла
            a.click();
        }
    };

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        🏆
                        Top Traded Options - Past 24h
                    </h2>
                    <Camera className="icon" id="cameraVol"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="cameraVol" html={true}/>
                    <ShieldAlert className="icon" id="optionChartInfo"
                                 data-tooltip-html="The top traded options in the last 24h"/>
                    <Tooltip anchorId="optionChartInfo" html={true}/>
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
                {!loading && !error && trades.length === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && trades.length > 0 && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default TopTradedOptionsChart;


