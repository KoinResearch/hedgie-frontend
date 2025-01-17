import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './VolumeByStrikePriceChart.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from "../../../utils/cacheService";


const VolumeByStrikePriceChart = () => {
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

    // Запрос данных open interest
    const {
        data,
        loading: dataLoading,
        error: dataError
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/volume/open-interest-by-strike/${asset.toLowerCase()}/${expiration === 'All Expirations' ? 'all' : expiration}`,
        { exchange },
        optionsCache,
        CACHE_TTL.SHORT
    );

    const chartData = Array.isArray(data) ? data : [];
    const loading = expirationsLoading || dataLoading;
    const error = expirationsError || dataError;

    // Генерация графика
    useEffect(() => {
        if (!loading && chartRef.current && data.length > 0) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

            const strikePrices = data.map(d => d.strike);
            const puts = data.map(d => parseFloat(d.puts).toFixed(2));
            const calls = data.map(d => parseFloat(d.calls).toFixed(2));
            const putsMarketValue = data.map(d => parseFloat(d.puts_market_value).toFixed(2));
            const callsMarketValue = data.map(d => parseFloat(d.calls_market_value).toFixed(2));

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
                    data: ['Puts', 'Calls', 'Puts Market Value [$]', 'Calls Market Value [$]'],
                    textStyle: {
                        color: '#B8B8B8',
                        fontFamily: 'JetBrains Mono',
                    },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: strikePrices,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45,
                        fontFamily: 'JetBrains Mono',
                    },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Contracts',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: {
                            color: '#7E838D',
                            fontFamily: 'JetBrains Mono',
                        },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                    {
                        type: 'value',
                        name: 'Market Value [$]',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: {
                            color: '#7E838D',
                            fontFamily: 'JetBrains Mono',
                        },
                        position: 'right',
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                ],
                series: [
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: puts,
                        itemStyle: { color: '#ff3e3e' },
                        barWidth: '30%',
                    },
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: calls,
                        itemStyle: { color: '#00cc96' },
                        barWidth: '30%',
                    },
                    {
                        name: 'Puts Market Value [$]',
                        type: 'line',
                        data: putsMarketValue,
                        yAxisIndex: 1,
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
            a.download = `open_interest_by_strike_${asset}.png`;
            a.click();
        }
    };

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>😬 Open Interest By Strike Price</h2>
                    <Camera className="icon" id="strikeCamera"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="strikeCamera" html={true}/>
                    <ShieldAlert
                        className="icon"
                        id="strikeInfo"
                        data-tooltip-html={`
       <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
           <div style="margin-bottom: 10px;">
               <b>Open Interest By Strike Price (24h)</b> visualizes the</br> distribution of options trading activity from the last 24</br> hours across different strike prices.
           </div>
           
           <div style="margin-left: 10px; margin-bottom: 10px;">
               Chart elements:
               <div style="margin-top: 5px;">• Bar chart shows contracts traded in last 24h</div>
               <div>• Red bars - Put options volume</div>
               <div>• Green bars - Call options volume</div>
               <div>• Red dotted line - Put options market value</div>
               <div style="margin-bottom: 5px;">• Green dotted line - Call options market value</div>
           </div>

           <div style="margin-left: 10px; margin-bottom: 10px;">
               Reading the axes:
               <div style="margin-top: 5px;">• Left axis - Number of contracts (24h volume)</div>
               <div>• Right axis - Market value in USD</div>
               <div>• Bottom axis - Strike prices</div>
               <div style="margin-bottom: 5px;">• Hover over bars for detailed values</div>
           </div>

           <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
               <b>Trading Insights:</b>
               <div style="margin-top: 5px;">• Popular strike prices show market expectations</div>
               <div>• Put/Call ratio per strike indicates local sentiment</div>
               <div style="margin-bottom: 5px;">• Volume clusters suggest key price levels</div>
           </div>
       </div>
   `}
                    />
                    <Tooltip anchorId="strikeInfo" html={true}/>
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
                                <option key={exp} value={exp}>{exp}</option>
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
                {!loading && !error && data.length === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && data.length > 0 && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default VolumeByStrikePriceChart;
