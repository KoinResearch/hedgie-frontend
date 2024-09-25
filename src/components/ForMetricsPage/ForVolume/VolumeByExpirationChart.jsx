import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './VolumeByExpirationChart.css'; // Подключение CSS

const VolumeByExpirationChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [strike, setStrike] = useState('All Strikes');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [strikes, setStrikes] = useState([]); // Для хранения доступных страйков
    const chartRef = useRef(null); // Ref для диаграммы ECharts

    // Получение доступных страйков при смене актива
    useEffect(() => {
        const fetchStrikes = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/strikes/${asset.toLowerCase()}`);
                setStrikes(['All Strikes', ...response.data]); // Добавляем "All Strikes" в начало списка
            } catch (err) {
                console.error('Error fetching strikes:', err);
                setError(err.message);
            }
        };
        fetchStrikes();
    }, [asset]);

    // Получение данных об открытых интересах по экспирации
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Используем "all" для запроса всех страйков
                const strikeParam = strike === 'All Strikes' ? 'all' : strike;
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/volume/open-interest-by-expiration/${asset.toLowerCase()}/${strikeParam}`);
                setData(response.data);
            } catch (err) {
                console.error('Error fetching open interest data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, strike]);

    useEffect(() => {
        if (data.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            // Преобразование данных для отображения
            const expirationDates = data.map(d => d.expiration);
            const putsOtm = data.map(d => d.puts_otm);
            const putsItm = data.map(d => d.puts_itm);
            const callsOtm = data.map(d => d.calls_otm);
            const callsItm = data.map(d => d.calls_itm);
            const putsMarketValue = data.map(d => d.puts_market_value);
            const callsMarketValue = data.map(d => d.calls_market_value);
            const notionalValue = data.map(d => d.notional_value);

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
                    data: [
                        'Puts OTM', 'Puts ITM', 'Calls OTM', 'Calls ITM',
                        'Puts Market Value [$]', 'Calls Market Value [$]', 'Notional Value [$]'
                    ],
                    textStyle: { color: '#B8B8B8' },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: expirationDates,
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
                        name: 'Contracts',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: { color: '#7E838D' },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                    {
                        type: 'value',
                        name: 'Market Value [$]',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: { color: '#7E838D' },
                        splitLine: { lineStyle: { color: '#151518' } },
                        position: 'right',
                    },
                ],
                series: [
                    {
                        name: 'Puts OTM',
                        type: 'bar',
                        data: putsOtm,
                        itemStyle: { color: '#ff3e3e' }, // Красный для Puts OTM
                        barWidth: '25%',
                    },
                    {
                        name: 'Calls OTM',
                        type: 'bar',
                        data: callsOtm,
                        itemStyle: { color: '#00cc96' }, // Зелёный для Calls OTM
                        barWidth: '25%',
                    },
                    {
                        name: 'Puts Market Value [$]',
                        type: 'line',
                        data: putsMarketValue,
                        yAxisIndex: 1, // Привязываем к второй оси
                        lineStyle: {
                            color: '#ff3e3e',
                            type: 'dotted',
                            width: 2,
                        },
                    },
                    {
                        name: 'Calls Market Value [$]',
                        type: 'line',
                        data: callsMarketValue,
                        yAxisIndex: 1,
                        lineStyle: {
                            color: '#00cc96',
                            type: 'dotted',
                            width: 2,
                        },
                    },
                    {
                        name: 'Notional Value [$]',
                        type: 'line',
                        data: notionalValue,
                        yAxisIndex: 1,
                        lineStyle: {
                            color: '#333',
                            type: 'dashed',
                            width: 2,
                        },
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

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        🤟 Open Interest By Expiration
                    </h2>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                    </div>
                    <div className="asset-option-buttons">
                        <select value={strike} onChange={(e) => setStrike(e.target.value || 'all')}>
                            {strikes.map((s) => (
                                <option key={s} value={s}>{s}</option>
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
                {!loading && !error && data.length === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && data.length > 0 && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default VolumeByExpirationChart;



