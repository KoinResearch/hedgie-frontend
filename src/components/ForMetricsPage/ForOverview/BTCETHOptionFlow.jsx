import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './BTCETHOptionFlow.css';

const BTCETHOptionFlow = () => {
    const [asset, setAsset] = useState('BTC');
    const [metrics, setMetrics] = useState({
        Call_Buys: 0,
        Call_Sells: 0,
        Put_Buys: 0,
        Put_Sells: 0,
    });

    const chartRef = useRef(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/${asset.toLowerCase()}`);
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

            const total = metrics.Call_Sells + metrics.Put_Sells + metrics.Put_Buys + metrics.Call_Buys;

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
                            formatter: '{d}%',
                            fontSize: 12,
                            color: '#fff',
                        },
                        itemStyle: {
                            borderRadius: 10,
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

    const total = metrics.Call_Buys + metrics.Call_Sells + metrics.Put_Buys + metrics.Put_Sells;

    const callBuysPercentage = ((metrics.Call_Buys / total) * 100).toFixed(2);
    const callSellsPercentage = ((metrics.Call_Sells / total) * 100).toFixed(2);
    const putBuysPercentage = ((metrics.Put_Buys / total) * 100).toFixed(2);
    const putSellsPercentage = ((metrics.Put_Sells / total) * 100).toFixed(2);

    const assetSymbol = asset === 'BTC' ? 'BTC' : 'ETH';

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M23 11.5C23 17.8513 17.8513 23 11.5 23C5.14873 23 0 17.8513 0 11.5C0 5.14873 5.14873 0 11.5 0C17.8513 0 23 5.14873 23 11.5ZM14.2628 7.22737C15.8625 7.7767 17.0327 8.59926 16.8031 10.1301C16.6364 11.251 16.0127 11.7931 15.184 11.983C16.3209 12.5726 16.7084 13.6915 16.3484 15.0446C15.6647 16.9917 14.0398 17.1556 11.8785 16.7486L11.3537 18.8417L10.0868 18.5268L10.6043 16.4617C10.2759 16.3805 9.94021 16.2935 9.59443 16.2007L9.07467 18.2758L7.80921 17.9609L8.3333 15.8635L5.78145 15.2222L6.41093 13.7769C6.41093 13.7769 7.34504 14.0235 7.33205 14.0056C7.69082 14.094 7.85036 13.861 7.91317 13.7065L9.33527 8.02548C9.35116 7.75729 9.25803 7.41935 8.74477 7.29136C8.76427 7.2777 7.82437 7.06343 7.82437 7.06343L8.16149 5.71527L10.717 6.34585L11.2367 4.2722L12.5029 4.58713L11.994 6.6198C12.3347 6.69673 12.6769 6.7751 13.0097 6.85779L13.515 4.83807L14.7819 5.153L14.2628 7.22737ZM11.2314 10.6865C12.0945 10.9153 13.9724 11.4131 14.2997 10.1078C14.6336 8.77218 12.8091 8.36881 11.9159 8.17131L11.9158 8.1713C11.8146 8.14893 11.7253 8.12919 11.6525 8.11104L11.0216 10.6319C11.0817 10.6468 11.1523 10.6655 11.2314 10.6865ZM10.2536 14.7452C11.2873 15.0175 13.5479 15.6129 13.9076 14.1745C14.2758 12.7038 12.084 12.2139 11.0145 11.9749L11.0145 11.9749C10.895 11.9482 10.7895 11.9246 10.7032 11.9031L10.0073 14.6814C10.078 14.6989 10.1608 14.7208 10.2535 14.7452L10.2536 14.7452Z"
                                  fill="#DC9745" strokeLinejoin="round"/>
                        </svg>
                        Options - Past 24h
                    </h2>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flow-option-content">
                <div className="metrics-option call-metrics">
                    <div className="metric-option call-buys">
                        <p className="metric-option-label">Call Buys</p>
                        <div className="metric-option-value">
                            {assetSymbol} {metrics.Call_Buys}
                        </div>
                    </div>
                    <div className="metric-option call-sells">
                        <p className="metric-option-label">Call Sells</p>
                        <div className="metric-option-value">
                            {assetSymbol} {metrics.Call_Sells}
                        </div>
                    </div>
                </div>
                <div>
                    <div ref={chartRef} style={{width: '320px', height: '320px'}}></div>
                </div>
                <div className="metrics-option put-metrics">
                    <div className="metric-option put-buys">
                        <p className="metric-option-label">Put Buys</p>
                        <div className="metric-option-value">
                            {assetSymbol} {metrics.Put_Buys}
                        </div>
                    </div>
                    <div className="metric-option put-sells">
                        <p className="metric-option-label">Put Sells</p>
                        <div className="metric-option-value">
                            {assetSymbol} {metrics.Put_Sells}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BTCETHOptionFlow;
