import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './OpenInterestByExpirationChart.css'; // Подключение CSS
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ShieldAlert, Camera } from 'lucide-react';

const OpenInterestByExpirationChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [strike, setStrike] = useState('All Strikes');
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [strikes, setStrikes] = useState([]); // Для хранения доступных страйков
    const chartRef = useRef(null); // Ref для диаграммы ECharts
    const chartInstanceRef = useRef(null); // Ref для инстанса диаграммы

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
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/open-interest-by-expiration/${asset.toLowerCase()}/${strikeParam}`);
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
        if (Object.keys(data).length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance; // Сохраняем инстанс диаграммы

            // Преобразование данных для отображения с округлением до 2 знаков после запятой
            const expirationDates = Object.keys(data);
            const putsOtm = expirationDates.map(date => parseFloat(data[date].puts_otm).toFixed(2));
            const callsOtm = expirationDates.map(date => parseFloat(data[date].calls_otm).toFixed(2));
            const putsMarketValue = expirationDates.map(date => parseFloat(data[date].puts_market_value).toFixed(2));
            const callsMarketValue = expirationDates.map(date => parseFloat(data[date].calls_market_value).toFixed(2));
            const notionalValue = expirationDates.map(date => parseFloat(data[date].notional_value).toFixed(2));

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#FFFFFF', // Белый фон для метки axisPointer
                            color: '#000000', // Черный текст в метке
                            fontFamily: 'JetBrains Mono', // Шрифт для меток axisPointer
                        },
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Белый фон для тултипа
                    textStyle: {
                        color: '#000000', // Черный текст в тултипе
                        fontFamily: 'JetBrains Mono', // Шрифт для текста тултипа
                    },
                },
                legend: {
                    data: [
                        'Puts OTM', 'Calls OTM',
                        'Puts Market Value [$]', 'Calls Market Value [$]', 'Notional Value [$]'
                    ],
                    textStyle: {
                        color: '#B8B8B8',
                        fontFamily: 'JetBrains Mono', // Шрифт для легенды
                    },
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
                        fontFamily: 'JetBrains Mono', // Шрифт для меток оси X
                    },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Contracts',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: {
                            color: '#7E838D',
                            fontFamily: 'JetBrains Mono', // Шрифт для меток оси Y
                        },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                    {
                        type: 'value',
                        name: 'Market Value [$]',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: {
                            color: '#7E838D',
                            fontFamily: 'JetBrains Mono', // Шрифт для меток оси Y
                        },
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

    const handleDownload = () => {
        if (chartInstanceRef.current) {
            const url = chartInstanceRef.current.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#FFFFFF', // Белый фон для изображения
            });
            const a = document.createElement('a');
            a.href = url;
            a.download = `open_interest_chart_${asset}.png`; // Имя файла
            a.click();
        }
    };


    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        🤟 Open Interest By Expiration
                    </h2>
                    <Camera className="icon" id="interestCamera"
                            onClick={handleDownload} // Обработчик нажатия для скачивания изображения
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="interestCamera" html={true}/>
                    <ShieldAlert className="icon" id="interestInfo"
                                 data-tooltip-html="The amount of option contracts and their dollar<br> equivalent held in active positions sorted<br> by expiration date."/>
                    <Tooltip anchorId="interestInfo" html={true}/>
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
                    <div className="asset-option-buttons">
                        <select value={strike} onChange={(e) => setStrike(e.target.value || 'all')}>
                            {strikes.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
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
                {!loading && !error && Object.keys(data).length === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && Object.keys(data).length > 0 && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default OpenInterestByExpirationChart;
