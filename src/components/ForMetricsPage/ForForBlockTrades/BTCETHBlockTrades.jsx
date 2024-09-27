import React, {useState, useEffect, useRef} from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import * as echarts from 'echarts';
import './BTCETHBlockTrades.css';


const BTCETHBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [metrics, setMetrics] = useState({
        Call_Buys: 0,
        Call_Sells: 0,
        Put_Buys: 0,
        Put_Sells: 0,
    });

    const chartRef = useRef(null); // Ref для диаграммы

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/${asset.toLowerCase()}`);
                setMetrics(response.data);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        fetchMetrics();
    }, [asset]);

    useEffect(() => {
        if (chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            // Данные
            const total = metrics.Call_Sells + metrics.Put_Sells + metrics.Put_Buys + metrics.Call_Buys;
            const percentages = [
                ((metrics.Call_Sells / total) * 100).toFixed(2),
                ((metrics.Put_Sells / total) * 100).toFixed(2),
                ((metrics.Put_Buys / total) * 100).toFixed(2),
                ((metrics.Call_Buys / total) * 100).toFixed(2),
            ];
            // Определение градиентов
            const colorGradient = [
                {
                    offset: 0, color: '#0D866C' // Color at 0%
                },
                {
                    offset: 1, color: '#5DDC86' // Color at 100%
                },
            ];

            // Опции диаграммы
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)',
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
                            formatter: '{d}%', // Отображаем проценты
                            fontSize: 12,
                            color: '#fff',
                        },
                        itemStyle: {
                            borderRadius: 10, // Закругленные края сегментов
                            borderColor: '#000',
                            borderWidth: 2,
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

    const assetSymbol = asset === 'BTC' ? 'BTC' : 'ETH';

    const per1=((metrics.Call_Buys*10000)/(metrics.Call_Buys + metrics.Call_Sells + metrics.Put_Buys + metrics.Put_Sells)).toFixed(2);

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>Options - Past 24h</h2>
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

                    <div className="metric-option call-sells">
                        <p className="metric-option-label">Call Sells</p>
                        <div className="metric-option-variable">
                            <p className="metric-option-value">
                                {assetSymbol} {metrics.Call_Sells}
                            </p>
                            <p className="metric-option-percentage"> {metrics.Call_Sells_Percent}% </p>
                        </div>
                    </div>
                </div>
                <div>
                    <div ref={chartRef} style={{width: '320px', height: '320px'}}></div>
                </div>
                <div className="metrics-option put-metrics">
                    <div className="metric-option put-buys">
                        <p className="metric-option-label">Put Buys</p>
                        <div className="metric-option-variable">
                            <p className="metric-option-value">{assetSymbol} {metrics.Put_Buys}</p>
                            <p className="metric-option-percentage"> {metrics.Put_Buys_Percent}% </p>
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

export default BTCETHBlockTrades;


