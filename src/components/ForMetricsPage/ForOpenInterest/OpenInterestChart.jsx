import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './OpenInterestChart.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ShieldAlert, Camera } from 'lucide-react';

const OpenInterestChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState({ Calls: 0, Puts: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        const fetchExpirations = async () => {
            console.log("Fetching expirations...");
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`);
                setExpirations(['All Expirations', ...response.data]);
            } catch (err) {
                console.error('Error fetching expirations:', err);
                setError(err.message);
            }
        };
        fetchExpirations();
    }, [asset]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const expirationParam = expiration === 'All Expirations' ? 'all' : expiration;
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/open-interest/${asset.toLowerCase()}/${expirationParam}`,
                    { params: { exchange } }
                );
                setData(response.data);
            } catch (err) {
                console.error('Error fetching open interest data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [asset, exchange, expiration]);

    useEffect(() => {
        if (!loading && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

            const callsData = parseFloat(data.Calls.toFixed(2)) || 0;
            const putsData = parseFloat(data.Puts.toFixed(2)) || 0;

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: {
                        color: '#000',
                        fontFamily: 'JetBrains Mono',
                    },
                },
                xAxis: {
                    type: 'value',
                    name: 'Contracts',
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        fontFamily: 'JetBrains Mono',
                    },
                    splitLine: { lineStyle: { color: '#393E47' } },
                },
                yAxis: {
                    type: 'category',
                    data: ['Calls', 'Puts'],
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        fontFamily: 'JetBrains Mono',
                    },
                },
                series: [
                    {
                        name: 'Open Interest',
                        type: 'bar',
                        data: [callsData, putsData],
                        itemStyle: {
                            color: (params) => (params.dataIndex === 0 ? '#00cc96' : '#ff3e3e'),
                        },
                        barWidth: '10%',
                    },
                ],
                grid: {
                    left: '10%',
                    right: '10%',
                    bottom: '10%',
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
    }, [data, loading]);

    const handleDownload = () => {
        if (chartInstanceRef.current) {
            const url = chartInstanceRef.current.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#FFFFFF',
            });
            const a = document.createElement('a');
            a.href = url;
            a.download = `open_interest_chart_${asset}.png`;
            a.click();
        }
    };

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>🦾 Open Interest By Option Kind</h2>
                    <Camera className="icon" id="OpenCamera" onClick={handleDownload} data-tooltip-html="Export image"/>
                    <Tooltip anchorId="OpenCamera" html={true}/>
                    <ShieldAlert className="icon" id="openInfo"
                                 data-tooltip-html="The amount of option contracts held<br> in active positions by type"/>
                    <Tooltip anchorId="openInfo" html={true}/>
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
                        <select onChange={(e) => setExpiration(e.target.value)} value={expiration}>
                            {expirations.map(exp => (
                                <option key={exp} value={exp}>
                                    {exp}
                                </option>
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
            </div>
            <div className="graph-chart">
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
                {!loading && !error && data.Calls === 0 && data.Puts === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && (data.Calls > 0 || data.Puts > 0) && (
                    <div ref={chartRef} style={{width: '100%', height: '290px'}}></div>
                )}
            </div>
        </div>
    );
};

export default OpenInterestChart;
