import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './MaxPainByExpirationChart.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

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

const getOptimalAxisSettings = (values, steps) => {
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    const step = range / steps;

    const roundedStep = Math.ceil(step / 1000) * 1000;
    const optimalMin = Math.floor(minValue / roundedStep) * roundedStep;
    const optimalMax = Math.ceil(maxValue / roundedStep) * roundedStep;

    return { min: optimalMin, max: optimalMax, step: roundedStep };
};

const MaxPainByExpirationChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [asset, setAsset] = useState('BTC');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

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
            chartInstanceRef.current = chartInstance;

            let expirationDates = Object.keys(data);
            expirationDates = expirationDates.sort((a, b) => convertToISODate(a) - convertToISODate(b));

            const maxPainValues = expirationDates.map(exp => parseFloat(data[exp].maxPain));
            const notionalValues = expirationDates.map(exp => calculateNotionalValue(data[exp].intrinsicValues));

            const maxPainSettings = getOptimalAxisSettings(maxPainValues, 6);
            const notionalSettings = getOptimalAxisSettings(notionalValues, 4);

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#FFFFFF',
                            color: '#000000',
                            fontFamily: 'JetBrains Mono',
                        },
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: {
                        color: '#000000',
                        fontFamily: 'JetBrains Mono',
                    },
                },
                legend: {
                    data: ['Max Pain Price [$]', 'Notional Value'],
                    textStyle: {
                        color: '#B8B8B8',
                        fontFamily: 'JetBrains Mono',
                    },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: expirationDates,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45,
                        interval: 0,
                        fontFamily: 'JetBrains Mono',
                    },
                    splitLine: { show: false },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Max Pain Price [$]',
                        position: 'left',
                        min: maxPainSettings.min,
                        max: maxPainSettings.max,
                        interval: maxPainSettings.step,
                        axisLine: { lineStyle: { color: '#B8B8B8' } },
                        axisLabel: {
                            color: '#7E838D',
                            formatter: value => value.toLocaleString(),
                            fontFamily: 'JetBrains Mono',
                        },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                    {
                        type: 'value',
                        name: 'Notional Value',
                        position: 'right',
                        min: notionalSettings.min,
                        max: notionalSettings.max,
                        interval: notionalSettings.step,
                        axisLine: { lineStyle: { color: '#B8B8B8' } },
                        axisLabel: {
                            color: '#A9A9A9',
                            formatter: value => `${(value / 1e9).toFixed(1)}b`,
                            fontFamily: 'JetBrains Mono',
                        },
                        splitLine: { show: false },
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
                backgroundColor: '#FFFFFF',
            });
            const a = document.createElement('a');
            a.href = url;
            a.download = `option_flow_chart_${asset}.png`;
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
                            onClick={handleDownload}
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

export default MaxPainByExpirationChart;
