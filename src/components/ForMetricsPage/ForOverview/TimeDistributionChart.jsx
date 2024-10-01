import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './TimeDistributionChart.css'; // Подключение стилей для спиннера и контейнеров
import { ShieldAlert, Camera } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

const TimeDistributionChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [data, setData] = useState([]);
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
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/time-distribution/${asset.toLowerCase()}`);
                setData(response.data);  // Данные теперь массив с 24 объектами
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
        if (data.length === 0) {
            return; // Если данных нет, не пытаемся отрисовать график
        }

        if (chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance; // Сохраняем инстанс диаграммы

            // Форматируем данные для оси X (часы)
            const hours = [...Array(24).keys()].map(hour => `${hour}:00`);

            // Собираем данные для Calls и Puts
            const callCounts = data.map(hourData => hourData.calls.reduce((acc, trade) => acc + parseInt(trade.trade_count), 0));
            const putCounts = data.map(hourData => hourData.puts.reduce((acc, trade) => acc + parseInt(trade.trade_count), 0));

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
                    data: ['Calls', 'Puts'],
                    textStyle: { color: '#B8B8B8' },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: hours,
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
                    }
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
                    }
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
                {!loading && !error && data.length > 0 && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default TimeDistributionChart;
