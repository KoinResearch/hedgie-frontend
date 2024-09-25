import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './OpenInterestChart.css'; // Импортируем CSS-файл для стилей

const OpenInterestChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState({ Calls: 0, Puts: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]); // Для хранения доступных дат экспирации
    const chartRef = useRef(null); // Ref для диаграммы ECharts

    // Fetch available expirations when the asset changes
    useEffect(() => {
        const fetchExpirations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`);
                setExpirations(['All Expirations', ...response.data]); // Добавляем "All Expirations" в начало списка
            } catch (err) {
                console.error('Error fetching expirations:', err);
                setError(err.message);
            }
        };
        fetchExpirations();
    }, [asset]);

    // Fetch open interest data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Используем "all" вместо "All Expirations" для запроса на сервер
                const expirationParam = expiration === 'All Expirations' ? 'all' : expiration;
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/open-interest/${asset.toLowerCase()}/${expirationParam}`);
                setData(response.data);
            } catch (err) {
                console.error('Error fetching open interest data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, expiration]);

    useEffect(() => {
        if (!loading && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: { color: '#000' },
                },
                xAxis: {
                    type: 'value',
                    name: 'Number of Contracts',
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: { color: '#7E838D' },
                    splitLine: { lineStyle: { color: '#393E47' } },
                },
                yAxis: {
                    type: 'category',
                    data: ['Calls', 'Puts'],
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: { color: '#7E838D' },
                },
                series: [
                    {
                        name: 'Open Interest',
                        type: 'bar',
                        data: [data.Calls, data.Puts],
                        itemStyle: {
                            color: function (params) {
                                return params.dataIndex === 0 ? '#00cc96' : '#ff3e3e'; // Зеленый для Calls, Красный для Puts
                            },
                            borderColor: function (params) {
                                return params.dataIndex === 0 ? '#00b383' : '#e60000'; // Цвет границ
                            },
                            borderWidth: 2,
                        },
                        barWidth: '40%',
                    },
                ],
                grid: {
                    left: '10%',
                    right: '10%',
                    bottom: '10%',
                    top: '10%',
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
    }, [data, loading]);

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>🦾 Open Interest By Option Kind</h2>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                    </div>
                    <div className="asset-option-buttons">
                        <select onChange={(e) => setExpiration(e.target.value)} value={expiration}>
                            {expirations.map(exp => (
                                <option key={exp} value={exp}>
                                    {exp}
                                </option>
                            ))}
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
                {!loading && !error && data.Calls === 0 && data.Puts === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && (data.Calls > 0 || data.Puts > 0) && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default OpenInterestChart;
