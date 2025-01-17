import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './VolumeByOptionKindChart.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from "../../../utils/cacheService";


const VolumeByOptionKindChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const [expiration, setExpiration] = useState('All Expirations');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);


    // Запрос списка expirations с длительным кешем
    const {
        data: expirationsData,
        loading: expirationsLoading,
        error: expirationsError
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`,
        null,
        expirationCache,
        CACHE_TTL.LONG
    );

    const expirations = ['All Expirations', ...(Array.isArray(expirationsData) ? expirationsData : [])];

    // Запрос данных открытого интереса с коротким кешем
    const {
        data: interestData,
        loading: dataLoading,
        error: dataError
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/volume/open-interest/${asset.toLowerCase()}/${expiration === 'All Expirations' ? 'all' : expiration}`,
        { exchange },
        optionsCache,
        CACHE_TTL.SHORT
    );

    const data = interestData || { Calls: 0, Puts: 0 };
    const loading = expirationsLoading || dataLoading;
    const error = expirationsError || dataError;

    // Генерация графика
    useEffect(() => {
        if (!loading && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

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
                        data: [data.Calls.toFixed(2), data.Puts.toFixed(2)],
                        itemStyle: {
                            color: function (params) {
                                return params.dataIndex === 0 ? '#00cc96' : '#ff3e3e';
                            },
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

            const handleResize = () => {
                chartInstance.resize();
            };

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
            a.download = `option_flow_chart_${asset}.png`;
            a.click();
        }
    };


    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>🦾 Open Interest By Option Kind</h2>
                    <Camera className="icon" id="OpenCamera"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="OpenCamera" html={true}/>
                    <ShieldAlert
                        className="icon"
                        id="openInfo"
                        data-tooltip-html={`
       <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
           <div style="margin-bottom: 10px;">
               <b>Open Interest By Option Type</b> shows the distribution</br> of options activity between Calls and Puts over the last</br> 24 hours of trading.
           </div>
           
           <div style="margin-left: 10px; margin-bottom: 10px;">
               How to read:
               <div style="margin-top: 5px;">• Green bar - Total Call option contracts</div>
               <div>• Red bar - Total Put option contracts</div>
               <div>• Bar length shows number of contracts</div>
               <div style="margin-bottom: 5px;">• Compare Call vs Put volume to gauge market sentiment</div>
           </div>

           <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
               <b>Trading Applications:</b>
               <div style="margin-top: 5px;">• Higher Call volume suggests bullish sentiment</div>
               <div>• Higher Put volume suggests bearish sentiment</div>
               <div style="margin-bottom: 5px;">• Balance between Calls/Puts shows market conviction</div>
           </div>
       </div>
   `}
                    />
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
                <div className="flow-option-dedicated"></div>
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
                    <div ref={chartRef} style={{ width: '100%', height: '290px' }}></div>
                )}
            </div>
        </div>
    );
};

export default VolumeByOptionKindChart;




