import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';

const ExpirationActivityChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [strike, setStrike] = useState('all');  // Устанавливаем начальное значение как 'all'
    const [data, setData] = useState({ calls: [], puts: [] });
    const [strikes, setStrikes] = useState([]);  // Список доступных страйков
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null); // Ref для диаграммы ECharts

    // Получение доступных страйков при изменении актива
    useEffect(() => {
        const fetchStrikes = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/strikes/${asset.toLowerCase()}`);
                setStrikes(response.data);
            } catch (err) {
                console.error('Error fetching strikes:', err);
            }
        };

        fetchStrikes();
    }, [asset]);

    // Получение активности по дате истечения и страйку
    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = `${import.meta.env.VITE_API_URL}/api/metrics/expiration-activity/${asset.toLowerCase()}`;
                if (strike && strike !== 'all') {
                    url += `/${strike}`;
                }

                const response = await axios.get(url);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching expiration activity data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, strike]);

    useEffect(() => {
        if (data.calls.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            // Подготовка данных для графика
            const expirationDates = [...new Set([...data.calls.map(d => d.expiration_date), ...data.puts.map(d => d.expiration_date)])];

            const callCounts = expirationDates.map(date => {
                const call = data.calls.find(d => d.expiration_date === date);
                return call ? call.trade_count : 0;
            });

            const putCounts = expirationDates.map(date => {
                const put = data.puts.find(d => d.expiration_date === date);
                return put ? put.trade_count : 0;
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
                    data: ['Calls', 'Puts'],
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

    if (data.calls.length === 0 && data.puts.length === 0) {
        return <div>No data available</div>;
    }

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        📉
                        Volume By Expiration - Past 24h
                    </h2>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                        <span className="custom-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                    <div className="asset-option-buttons">
                        <select value={strike} onChange={(e) => setStrike(e.target.value || 'all')}>
                            <option value="all">All Strikes</option>
                            {strikes.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <span className="custom-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
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

export default ExpirationActivityChart;
