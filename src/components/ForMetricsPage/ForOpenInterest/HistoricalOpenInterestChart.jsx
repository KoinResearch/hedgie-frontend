import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './HistoricalOpenInterestChart.css'; // Подключаем файл CSS для стилей

const HistoricalOpenInterestChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [asset, setAsset] = useState('BTC'); // Валюта по умолчанию
    const [period, setPeriod] = useState('1d'); // Период по умолчанию
    const chartRef = useRef(null); // Ref для ECharts

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Формируем URL с параметрами
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/historical-open-interest/${asset.toLowerCase()}/${period}`);

                if (response.data) {
                    setData(response.data);
                } else {
                    console.warn('Нет доступных данных:', response.data);
                    setData(null);
                }
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при получении данных Historical Open Interest:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, period]);

    useEffect(() => {
        if (data && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            // Преобразуем данные для отображения на графике
            const timestamps = data.map(entry => entry.timestamp);
            const totalContracts = data.map(entry => entry.total_contracts);
            const avgIndexPrices = data.map(entry => entry.avg_index_price);

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#FFFFFF', // Белый фон для метки axisPointer
                            color: '#000000', // Черный текст в метке
                        },
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Белый фон для тултипа
                    textStyle: {
                        color: '#000000', // Черный текст в тултипе
                    },
                },
                legend: {
                    data: ['Total Contracts', 'Index Price'],
                    textStyle: { color: '#B8B8B8' },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: timestamps,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: { color: '#7E838D' },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Total Contracts',
                        axisLine: { lineStyle: { color: '#B8B8B8' } },
                        axisLabel: { color: '#7E838D' },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                    {
                        type: 'value',
                        name: 'Index Price',
                        axisLine: { lineStyle: { color: '#7f7f7f' } },
                        axisLabel: { color: '#7f7f7f' },
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
                        areaStyle: { color: '#e74c3c', opacity: 0.2 }, // Заливка под линией
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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data) {
        return <div>No data available</div>;
    }

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>🤠 Historical Open Interest Chart</h2>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                    </div>
                    <div className="asset-option-buttons">
                        <select onChange={(e) => setPeriod(e.target.value)} value={period}>
                            <option value="1d">1d</option>
                            <option value="7d">7d</option>
                            <option value="1m">1m</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="graph">
                <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
            </div>
        </div>
    );
};

export default HistoricalOpenInterestChart;
