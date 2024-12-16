import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './BTCETHOptionFlow.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ShieldAlert, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';


const BTCETHOptionFlow = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const [metrics, setMetrics] = useState({
        Call_Buys: 0,
        Call_Sells: 0,
        Put_Buys: 0,
        Put_Sells: 0,
        Call_Buys_Percent: '0.00',
        Call_Sells_Percent: '0.00',
        Put_Buys_Percent: '0.00',
        Put_Sells_Percent: '0.00',
    });
    const [timeRange, setTimeRange] = useState('24h');


    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/${asset.toLowerCase()}`, {
                    params: {
                        timeRange,
                        exchange
                    }
                });
                setMetrics(response.data);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        fetchMetrics();
    }, [asset, exchange, timeRange]);

    // 1 вариант
    useEffect(() => {
        if (chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)',
                    textStyle: {
                        fontFamily: 'JetBrains Mono',
                    },
                },
                series: [
                    {
                        name: 'Option Flow',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['50%', '50%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: true,
                            position: 'inside',
                            formatter: (params) => `${Math.round(params.percent)}%`,
                            fontSize: 12,
                            color: '#fff',
                            fontFamily: 'JetBrains Mono',
                        },
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#151518',
                            borderWidth: 4,
                        },
                        data: [
                            {
                                value: metrics.Call_Sells,
                                name: 'Call Sells',
                                itemStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: '#0D866C' },
                                        { offset: 1, color: '#5DDC86' },
                                    ]),
                                },
                            },
                            {
                                value: metrics.Put_Sells,
                                name: 'Put Sells',
                                itemStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: '#DE495A' },
                                        { offset: 1, color: '#881C72' },
                                    ]),
                                },
                            },
                            {
                                value: metrics.Put_Buys,
                                name: 'Put Buys',
                                itemStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: '#7A59C4' },
                                        { offset: 1, color: '#9B21A2' },
                                    ]),
                                },
                            },
                            {
                                value: metrics.Call_Buys,
                                name: 'Call Buys',
                                itemStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: '#9D78F1' },
                                        { offset: 1, color: '#362D4B' },
                                    ]),
                                },
                            },
                        ],
                    },
                ],
            };

            chartInstance.setOption(option);

            return () => {
                chartInstance.dispose();
            };
        }
    }, [metrics]);


    const handleDownload = () => {
        const elementToCapture = document.querySelector('.flow-option-content');
        if (!elementToCapture) {
            console.error('Element to capture not found');
            return;
        }

        // Создаем водяной знак
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.width = '100%';
        watermark.style.height = '100%';
        watermark.style.top = '50%';
        watermark.style.left = '50%';
        watermark.style.transform = 'translate(-50%, -50%)';
        watermark.style.pointerEvents = 'none';
        watermark.style.zIndex = '1000';
        watermark.style.display = 'flex';
        watermark.style.justifyContent = 'center';
        watermark.style.alignItems = 'center';

        // Создаем текст водяного знака
        const textElement = document.createElement('div');
        textElement.textContent = 'hedgie.org';
        textElement.style.position = 'absolute';
        textElement.style.color = 'rgba(255, 255, 255, 0.06)';
        textElement.style.fontSize = '80px';
        textElement.style.fontFamily = 'JetBrains Mono';
        textElement.style.fontWeight = 'bold';
        watermark.appendChild(textElement);

        // Добавляем водяной знак
        const originalPosition = elementToCapture.style.position;
        elementToCapture.style.position = 'relative';
        elementToCapture.appendChild(watermark);

        // Делаем скриншот
        html2canvas(elementToCapture, {
            backgroundColor: '#000000',
            scale: 2,
        }).then((canvas) => {
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `option_flow_chart_with_metrics_${asset}.png`;
            a.click();

            // Удаляем водяной знак после создания скриншота
            elementToCapture.removeChild(watermark);
            elementToCapture.style.position = originalPosition;
        }).catch((error) => {
            console.error('Error creating screenshot:', error);
            elementToCapture.removeChild(watermark);
            elementToCapture.style.position = originalPosition;
        });
    };

    const assetSymbol = asset === 'BTC' ? 'BTC' : 'ETH';

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>💸 Options</h2>
                    <Camera className="icon" id="camera"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="camera" html={true}/>
                    <ShieldAlert className="icon" id="optionData"
                                 data-tooltip-html="It provides information on Call<br> and Put trades"/>
                    <Tooltip anchorId="optionData" html={true}/>
                    <div className="asset-option-buttons">
                        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                            <option value="24h">Past 24 Hours</option>
                            <option value="7d">Last Week</option>
                            <option value="30d">Last Month</option>
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
                        <select value={exchange} onChange={(e) => setExchange(e.target.value)}>
                            <option value="DER">Deribit</option>
                            <option value="OKX">OKX</option>
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
            <div className="flow-option-content">
                <div className="metrics-option call-metrics">

                    <div className="metric-option call-buys">
                        <p className="metric-option-label">Call Buys</p>
                        <div className="metric-option-variable">
                            <p className="metric-option-value">
                                {assetSymbol} {metrics.Call_Buys}
                            </p>
                            <p className="metric-option-percentage"> {metrics.Call_Buys_Percent}% </p>
                        </div>
                    </div>

                    <div className="metric-option put-buys">
                    <p className="metric-option-label">Put Buys</p>
                        <div className="metric-option-variable">
                            <p className="metric-option-value">{assetSymbol} {metrics.Put_Buys}</p>
                            <p className="metric-option-percentage"> {metrics.Put_Buys_Percent}% </p>
                        </div>
                    </div>

                </div>
                <div>
                    <div ref={chartRef} style={{width: '320px', height: '320px'}}></div>
                </div>
                <div className="metrics-option put-metrics">

                    <div className="metric-option call-sells">
                        <p className="metric-option-label">Call Sells</p>
                        <div className="metric-option-variable">
                            <p className="metric-option-value">
                                {assetSymbol} {metrics.Call_Sells}
                            </p>
                            <p className="metric-option-percentage"> {metrics.Call_Sells_Percent}% </p>
                        </div>
                    </div>

                    <div className="metric-option put-sells">
                        <p className="metric-option-label">Put Sells</p>
                        <div className="metric-option-variable">
                            <p className="metric-option-value">{assetSymbol} {metrics.Put_Sells}</p>
                            <p className="metric-option-percentage"> {metrics.Put_Sells_Percent}% </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BTCETHOptionFlow;
