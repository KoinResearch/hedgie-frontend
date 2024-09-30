import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './MaxPainByExpiration.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css'; // Подключите CSS для отображения тултипов

const convertToISODate = (dateStr) => {
    const year = `20${dateStr.slice(-2)}`;
    const monthStr = dateStr.slice(-5, -2).toUpperCase();
    let day = dateStr.slice(0, dateStr.length - 5);

    const monthMap = {
        JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
        JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
    };

    const month = monthMap[monthStr];
    if (!month) {
        console.error(`Ошибка: не удалось найти месяц для строки: ${dateStr}`);
        return null;
    }

    if (day.length === 1) {
        day = `0${day}`;
    }

    const isoDate = `${year}-${month}-${day}`;
    return new Date(isoDate);
};

const calculateNotionalValue = (intrinsicValues) => {
    return Object.values(intrinsicValues).reduce((acc, val) => acc + val, 0);
};

const MaxPainByExpiration = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [asset, setAsset] = useState('BTC');
    const chartRef = useRef(null); // Ref для диаграммы ECharts
    const chartInstanceRef = useRef(null); // Добавляем ref для хранения инстанса диаграммы

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/max-pain-data?currency=${asset.toLowerCase()}`);
                if (response.data && response.data.maxPainByExpiration) {
                    setData(response.data.maxPainByExpiration);
                } else {
                    console.warn('Нет доступных данных:', response.data);
                    setData(null);
                }
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при получении данных Max Pain:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset]);

    useEffect(() => {
        if (data && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance; // Сохраняем инстанс диаграммы для использования при скачивании

            let expirationDates = Object.keys(data);
            expirationDates = expirationDates.sort((a, b) => convertToISODate(a) - convertToISODate(b));

            const maxPainValues = expirationDates.map(exp => parseFloat(data[exp].maxPain));
            const notionalValues = expirationDates.map(exp => calculateNotionalValue(data[exp].intrinsicValues));

            // Максимум для Notional Value — 7 миллиардов
            const maxNotionalValue = 7e9;
            const notionalValueStep = 1e9; // Шаг для оси Notional Value — 1 миллиард

            // Конфигурация ECharts
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
                    data: ['Max Pain Price [$]', 'Notional Value'],
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
                    splitLine: { show: false },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Max Pain Price [$]',
                        position: 'left',
                        axisLine: { lineStyle: { color: '#B8B8B8' } },
                        axisLabel: {
                            color: '#7E838D',
                            formatter: value => value.toLocaleString(),
                        },
                        splitLine: { lineStyle: { color: '#393E47' } },
                        min: 57000, // Минимум для Max Pain Price
                        max: Math.max(...maxPainValues) + 3000, // Корректируем максимум
                        interval: 3000, // Шаг для Max Pain Price
                    },
                    {
                        type: 'value',
                        name: 'Notional Value',
                        position: 'right',
                        axisLine: { lineStyle: { color: '#B8B8B8' } },
                        axisLabel: {
                            color: '#A9A9A9',
                            formatter: value => `${(value / 1e9).toFixed(1)}b`, // Преобразуем в млрд для отображения
                        },
                        splitLine: { show: false },
                        min: 0, // Минимум для Notional Value
                        max: maxNotionalValue, // Устанавливаем максимум на 7 миллиардов
                        interval: notionalValueStep, // Шаг для Notional Value — 1 миллиард
                    },
                ],
                series: [
                    {
                        name: 'Max Pain Price [$]',
                        type: 'line',
                        data: maxPainValues,
                        smooth: true,
                        lineStyle: {
                            color: '#882A35',
                            width: 2,
                        },
                        itemStyle: {
                            color: '#882A35',
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(255, 148, 160, 0.9)' },
                                { offset: 1, color: 'rgba(255, 148, 160, 0)' },
                            ]),
                        },
                        yAxisIndex: 0,
                    },
                    {
                        name: 'Notional Value',
                        type: 'bar',
                        data: notionalValues,
                        barWidth: '30%',
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#889FCD' },
                                { offset: 1, color: '#445067' },
                            ]),
                        },
                        yAxisIndex: 1,
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
            a.download = `option_flow_chart_${asset}.png`; // Имя файла
            a.click();
        }
    };

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        😡
                        Max pain by expiration
                    </h2>
                    <Camera className="icon" id="cameraMaxPain"
                            onClick={handleDownload} // Обработчик нажатия для скачивания изображения
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="cameraMaxPain" html={true}/>
                    <ShieldAlert className="icon" id="maxPainData"
                                 data-tooltip-html="The max pain price across all expiration"/>
                    <Tooltip anchorId="maxPainData" html={true}/>
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
                {!loading && !error && data && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};


export default MaxPainByExpiration;

