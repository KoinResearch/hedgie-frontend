import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';

const StrikeActivityChartBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]);
    const chartRef = useRef(null); // Ref для диаграммы ECharts

    // Fetch available expirations when the asset changes
    useEffect(() => {
        const fetchExpirations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`);
                setExpirations(['All Expirations', ...response.data]);
            } catch (err) {
                console.error('Error fetching expirations:', err);
            }
        };
        fetchExpirations();
    }, [asset]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/strike-activity/${asset.toLowerCase()}?expiration=${expiration}`);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching strike activity data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, expiration]);

    useEffect(() => {
        if (data.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            // Разделение данных на Calls и Puts
            let callData = data.filter(d => d.option_type === 'C');
            let putData = data.filter(d => d.option_type === 'P');

            // Сортировка данных по strike_price по возрастанию
            callData = callData.sort((a, b) => a.strike_price - b.strike_price);
            putData = putData.sort((a, b) => a.strike_price - b.strike_price);

            // Подготовка данных для отображения
            const strikePrices = callData.map(d => d.strike_price);
            const callTradeCounts = callData.map(d => d.trade_count);
            const putTradeCounts = putData.map(d => d.trade_count);

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
                    data: ['Calls', 'Puts'],
                    textStyle: { color: '#B8B8B8' },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: strikePrices,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45, // Поворот меток для читаемости
                        interval: 0, // Показывать все метки
                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Number of Trades',
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                    },
                    splitLine: { lineStyle: { color: '#393E47' } },
                },
                series: [
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: callTradeCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(39,174,96, 0.8)', // Зеленый для Calls
                        },
                    },
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: putTradeCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(231,76,60, 0.8)', // Красный для Puts
                        },
                    },
                ],
                grid: {
                    left: '5%',    // Уменьшаем отступы
                    right: '5%',
                    bottom: '5%', // Добавляем нижний отступ для меток X
                    top: '10%',
                    containLabel: true, // Чтобы оси и метки не обрезались
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

    if (data.length === 0) {
        return <div>No data available</div>;
    }

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        📈
                        Volume By Strike Price - Past 24h
                    </h2>
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
                <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
            </div>
        </div>
    );
};

export default StrikeActivityChartBlockTrades;
