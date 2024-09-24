import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';

const TimeDistributionChartBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [data, setData] = useState({ calls: [], puts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null); // Ref для диаграммы ECharts

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/time-distribution/${asset.toLowerCase()}`);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching time distribution data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset]);

    useEffect(() => {
        if (data.calls.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            // Подготовка данных для графика
            const hours = [...new Set([...data.calls.map(d => d.hour), ...data.puts.map(d => d.hour)])];
            const formattedHours = hours.map(hour => {
                const date = new Date();
                date.setHours(hour);
                date.setMinutes(0);
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
                        rotate: 45,
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
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: {
                            color: '#7E838D',
                        },
                        splitLine: { lineStyle: { color: '#393E47' } },
                        position: 'right',
                    },
                ],
                series: [
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: callCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(39,174,96,0.8)', // Зеленый для Calls
                        },
                    },
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: putCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(231,76,60,0.8)', // Красный для Puts
                        },
                    },
                    {
                        name: 'Index Price',
                        type: 'line',
                        data: avgIndexPrices,
                        yAxisIndex: 1, // Привязываем к второй оси
                        lineStyle: {
                            color: 'rgba(255,255,255,0.8)', // Белая линия
                            width: 2,
                        },
                    },
                ],
                grid: {
                    left: '5%',    // Уменьшаем отступы
                    right: '5%',
                    bottom: '5%',  // Добавляем нижний отступ для меток X
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
                        📦
                        Historical Volume - Past 24h
                    </h2>
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
                <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
            </div>
        </div>
    );
};

export default TimeDistributionChartBlockTrades;
