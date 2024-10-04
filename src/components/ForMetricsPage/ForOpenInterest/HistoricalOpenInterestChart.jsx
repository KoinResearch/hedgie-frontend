import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import dayjs from 'dayjs'; // Для форматирования дат
import './HistoricalOpenInterestChart.css'; // Подключаем файл CSS для стилей
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ShieldAlert, Camera } from 'lucide-react';


const HistoricalOpenInterestChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [asset, setAsset] = useState('BTC'); // Валюта по умолчанию
    const [period, setPeriod] = useState('1d'); // Период по умолчанию
    const chartRef = useRef(null); // Ref для ECharts
    const chartInstanceRef = useRef(null); // Ref для инстанса диаграммы

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null); // Сбрасываем ошибку при каждом новом запросе
            try {
                // Формируем URL с параметрами
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/historical-open-interest/${asset.toLowerCase()}/${period}`);

                if (response.data) {
                    setData(response.data);
                } else {
                    console.warn('Нет доступных данных:', response.data);
                    setData(null);
                }
            } catch (error) {
                console.error('Ошибка при получении данных Historical Open Interest:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, period]);

    useEffect(() => {
        if (data && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance; // Сохраняем инстанс диаграммы

            // Преобразуем данные для отображения на графике
            const timestamps = data.map(entry => dayjs(entry.timestamp).format('YYYY-MM-DD HH:mm'));
            const totalContracts = data.map(entry => Number(entry.total_contracts || 0).toFixed(2));
            const avgIndexPrices = data.map(entry => Number(entry.avg_index_price || 0).toFixed(2));

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line', // Используем только вертикальную линию
                        axis: 'x', // Указываем, что линия появляется только на оси X (вертикальная линия)
                        label: {
                            backgroundColor: '#FFFFFF',
                            color: '#000000',
                            fontFamily: 'JetBrains Mono', // Шрифт для метки оси
                        },
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: {
                        color: '#000000',
                        fontFamily: 'JetBrains Mono', // Шрифт для текста тултипа
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
                        fontFamily: 'JetBrains Mono', // Шрифт для легенды
                    },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: timestamps,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        fontFamily: 'JetBrains Mono', // Шрифт для меток оси X
                    },
                },
                yAxis: [
                    {
                        type: 'log',
                        name: 'Total Contracts',
                        axisLine: { lineStyle: { color: '#7f7f7f' } },
                        axisLabel: {
                            color: '#7E838D',
                            fontFamily: 'JetBrains Mono', // Шрифт для меток оси Y
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
                            fontFamily: 'JetBrains Mono', // Шрифт для меток оси Y
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
    }, [data]);

    const handleDownload = () => {
        if (chartInstanceRef.current) {
            const url = chartInstanceRef.current.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#FFFFFF', // Белый фон для изображения
            });
            const a = document.createElement('a');
            a.href = url;
            a.download = `historical_open_interest_chart_${asset}.png`; // Имя файла
            a.click();
        }
    };

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>🤠 Historical Open Interest Chart</h2>
                    <Camera className="icon" id="historyCamera"
                            onClick={handleDownload} // Обработчик нажатия для скачивания изображения
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="historyCamera" html={true}/>
                    <ShieldAlert className="icon" id="historyInfo"
                                 data-tooltip-html="Number of option contracts sold,<br> sorted by different periods"/>
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
