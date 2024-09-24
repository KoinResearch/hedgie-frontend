import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';

const OptionVolumeChartBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [trades, setTrades] = useState([]);
    const [error, setError] = useState(null);
    const chartRef = useRef(null); // Ref для диаграммы ECharts

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/popular-options/${asset.toLowerCase()}`);
                setTrades(response.data);
            } catch (error) {
                console.error('Error fetching option volume data:', error);
                setError(error.message);
            }
        };

        fetchData();
    }, [asset]);

    useEffect(() => {
        if (trades.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            const instrumentNames = trades.map(trade => trade.instrument_name);
            const tradeCounts = trades.map(trade => trade.trade_count);

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
                    data: ['Trade Counts'],
                    textStyle: { color: '#B8B8B8' },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: instrumentNames,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: -45, // Поворот меток для читаемости
                        interval: 0, // Показывать все метки
                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Trade Counts',
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                    },
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
                    left: '5%',    // Уменьшаем отступы
                    right: '5%',
                    bottom: '5%', // Добавляем нижний отступ для меток X
                    top: '10%',
                    containLabel: true, // Чтобы оси и метки не обрезались
                },
            };

            chartInstance.setOption(option);

            // Обработка ресайза
            const handleResize = () => {
                chartInstance.resize();
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chartInstance.dispose();
            };
        }
    }, [trades]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (trades.length === 0) {
        return <div>No data available</div>;
    }

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        🏆
                        Top Traded Options - Past 24h
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
                </div>
                <div className="flow-option-dedicated"></div>
            </div>
            <div className="graph">
                <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
            </div>
        </div>
    );
};

export default OptionVolumeChartBlockTrades;


