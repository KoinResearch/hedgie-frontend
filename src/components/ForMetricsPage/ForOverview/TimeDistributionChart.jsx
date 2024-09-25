import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './TimeDistributionChart.css'; // Подключение стилей для спиннера и контейнеров

const TimeDistributionChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [data, setData] = useState({ calls: [], puts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/time-distribution/${asset.toLowerCase()}`);
                setData(response.data);
            } catch (err) {
                console.error('Error fetching time distribution data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [asset]);

    useEffect(() => {
        if (data.calls.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            const hours = [...new Set([...data.calls.map(d => d.hour), ...data.puts.map(d => d.hour)])];

            // Форматирование числового значения часов в строку HH:MM
            const formattedHours = hours.map(hour => {
                const date = new Date();
                date.setHours(hour);
                date.setMinutes(0); // Чтобы отображать время только по часам
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            });

            const callCounts = hours.map(hour => {
                const call = data.calls.find(d => d.hour === hour);
                return call ? call.trade_count : 0;
            });

            const putCounts = hours.map(hour => {
                const put = data.puts.find(d => d.hour === hour);
                return put ? put.trade_count : 0;
            });

            const avgIndexPrices = hours.map(hour => {
                const call = data.calls.find(d => d.hour === hour);
                return call ? call.avg_index_price : 0;
            });

            // Конфигурация ECharts
            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: {
                        color: '#000',
                    },
                },
                legend: {
                    data: ['Calls', 'Puts', 'Index Price'],
                    textStyle: { color: '#B8B8B8' },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: formattedHours,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45, // Поворот меток для читаемости
                        interval: 0, // Показывать все метки
                    },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Number of Trades',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: {
                            color: '#7E838D',
                        },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                    {
                        type: 'value',
                        name: 'Index Price',
                        position: 'right',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: {
                            color: '#7E838D',
                        },
                        splitLine: { show: false },
                    },
                ],
                series: [
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: callCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(39,174,96, 0.8)', // Зеленый для Calls
                        },
                    },
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: putCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(231,76,60, 0.8)', // Красный для Puts
                        },
                    },
                    {
                        name: 'Index Price',
                        type: 'line',
                        data: avgIndexPrices,
                        yAxisIndex: 1, // Привязка к правой оси
                        lineStyle: {
                            color: '#FFFFFF',
                            width: 2,
                        },
                        itemStyle: {
                            color: '#FFFFFF',
                        },
                    },
                ],
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '5%', // Добавляем нижний отступ для меток X
                    top: '10%',
                    containLabel: true, // Чтобы оси и метки не обрезались
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

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>📦 Historical Volume - Past 24h</h2>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
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
                {!loading && !error && data.calls.length === 0 && data.puts.length === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && data.calls.length > 0 && data.puts.length > 0 && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default TimeDistributionChart;
