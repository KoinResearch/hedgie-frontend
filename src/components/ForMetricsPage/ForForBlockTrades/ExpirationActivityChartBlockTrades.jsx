import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './ExpirationActivityChartBlockTrades.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { Tooltip } from "react-tooltip";


const ExpirationActivityChartBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const [strike, setStrike] = useState('all');
    const [data, setData] = useState({ calls: [], puts: [] });
    const [strikes, setStrikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [timeRange, setTimeRange] = useState('24h');

    // Получение доступных страйков при изменении актива
    useEffect(() => {
        const fetchStrikes = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/strikes/${asset.toLowerCase()}`);
                setStrikes(response.data);
            } catch (err) {
                console.error('Error fetching strikes:', err);
                setError(err.message);
            }
        };

        fetchStrikes();
    }, [asset]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `${import.meta.env.VITE_API_URL}/api/block-trades/expiration-activity/${asset.toLowerCase()}`;
                if (strike && strike !== 'all') {
                    url += `/${strike}`;
                }

                const response = await axios.get(url, {
                    params: {
                        timeRange
                    }
                });

                const groupedData = {
                    calls: response.data.filter(item => item.option_type === 'call'),
                    puts: response.data.filter(item => item.option_type === 'put')
                };

                console.log('Data from API:', groupedData);

                setData(groupedData);
            } catch (err) {
                console.error('Error fetching expiration activity data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, strike, timeRange]);

    useEffect(() => {
        if (data && data.calls.length > 0 && data.puts.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

            const expirationDates = [...new Set([...data.calls.map(d => d.expiration_date), ...data.puts.map(d => d.expiration_date)])];

            const callCounts = expirationDates.map(date => {
                const call = data.calls.find(d => d.expiration_date === date);
                return call ? call.trade_count : 0;
            });

            const putCounts = expirationDates.map(date => {
                const put = data.puts.find(d => d.expiration_date === date);
                return put ? put.trade_count : 0;
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
                        fontFamily: 'JetBrains Mono',
                    },
                },
                legend: {
                    data: ['Calls', 'Puts'],
                    textStyle: {
                        color: '#B8B8B8',
                        fontFamily: 'JetBrains Mono',
                    },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: expirationDates,
                    axisLine: {
                        lineStyle: { color: '#A9A9A9' }
                    },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45,
                        interval: 0,
                        fontFamily: 'JetBrains Mono',
                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Number of Trades',
                    axisLine: {
                        lineStyle: { color: '#A9A9A9' }
                    },
                    axisLabel: {
                        color: '#7E838D',
                        fontFamily: 'JetBrains Mono',
                    },
                    splitLine: {
                        lineStyle: { color: '#393E47' }
                    },
                },
                series: [
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: callCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(39,174,96, 0.8)',
                        },
                    },
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: putCounts,
                        barWidth: '30%',
                        itemStyle: {
                            color: 'rgba(231,76,60, 0.8)',
                        },
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
                backgroundColor: '#FFFFFF',
            });
            const a = document.createElement('a');
            a.href = url;
            a.download = `expiration_activity_chart_${asset}.png`;
            a.click();
        }
    };

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>📉 Block Trades by Expiration</h2>
                    <Camera className="icon" id="cameraExp"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="cameraExp" html={true}/>
                    <ShieldAlert className="icon" id="expInfo"
                                 data-tooltip-html="The amount of option block trades<br> sorted by expiration date"/>
                    <Tooltip anchorId="expInfo" html={true}/>
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
                        <select value={strike} onChange={(e) => setStrike(e.target.value || 'all')}>
                            <option value="all">All Strikes</option>
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
                    <div className="asset-option-buttons">
                        <select value={exchange} onChange={(e) => setExchange(e.target.value)}>
                            <option value="DER">Deribit</option>
                            {/*<option value="OKX">OKX</option>*/}
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
                    <div ref={chartRef} style={{width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default ExpirationActivityChartBlockTrades;
