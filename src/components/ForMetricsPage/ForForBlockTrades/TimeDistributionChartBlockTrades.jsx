import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './TimeDistributionChartBlockTrades.css'; // Подключение стилей для спиннера и контейнеров
import { ShieldAlert, Camera } from 'lucide-react';
import { Tooltip } from 'react-tooltip';


const TimeDistributionChartBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [data, setData] = useState({ calls: [], puts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null); // Ref для хранения инстанса диаграммы

    // Получение данных с сервера
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/time-distribution/${asset.toLowerCase()}`);
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

    // Отрисовка графика
    useEffect(() => {
        if ((!data.calls || data.calls.length === 0) && (!data.puts || data.puts.length === 0)) {
            return; // Если данных нет, не пытаемся отрисовать график
        }

        if (chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance; // Сохраняем инстанс диаграммы

            // Получаем уникальные часы
            const hours = [...new Set([...data.calls.map(d => d.hour), ...data.puts.map(d => d.hour)])];

            // Форматируем часы в HH:MM
            const formattedHours = hours.map(hour => {
                const date = new Date(hour);
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            });

            // Собираем данные для графика
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

            // Настройка ECharts
            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: { color: '#000' },
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
                        interval: 0,
                    },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Number of Trades',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: { color: '#7E838D' },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                    {
                        type: 'value',
                        name: 'Index Price',
                        position: 'right',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: { color: '#7E838D' },
                        splitLine: { show: false },
                    },
                ],
                series: [
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: callCounts,
                        barWidth: '30%',
                        itemStyle: { color: 'rgba(39,174,96, 0.8)' },
                    },
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: putCounts,
                        barWidth: '30%',
                        itemStyle: { color: 'rgba(231,76,60, 0.8)' },
                    },
                    {
                        name: 'Index Price',
                        type: 'line',
                        data: avgIndexPrices,
                        yAxisIndex: 1,
                        lineStyle: { color: '#FFFFFF', width: 2 },
                        itemStyle: { color: '#FFFFFF' },
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
            a.download = `option_flow_chart_${asset}.png`; // Имя файла
            a.click();
        }
    };

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>📦 Historical Volume - Past 24h</h2>
                    <Camera className="icon" id="camerDis"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="camerDis" html={true}/>
                    <ShieldAlert className="icon" id="timeInfo"
                                 data-tooltip-html="The amount of option contracts sold<br> in the last 24 hours, sorted by hour range"/>
                    <Tooltip anchorId="timeInfo" html={true}/>
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

export default TimeDistributionChartBlockTrades;



