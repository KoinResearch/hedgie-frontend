import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './VolumeByExpirationChart.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { CACHE_TTL, optionsCache, strikeCache, useCachedApiCall } from "../../../utils/cacheService";

const VolumeByExpirationChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const [strike, setStrike] = useState('All Strikes');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // Запрос списка strikes
    const {
        data: strikesData,
        loading: strikesLoading,
        error: strikesError
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/strikes/${asset.toLowerCase()}`,
        null,
        strikeCache,
        CACHE_TTL.LONG
    );

    const strikes = ['All Strikes', ...(Array.isArray(strikesData) ? strikesData : [])];

    // Запрос данных open interest
    const {
        data: openInterestData,
        loading: dataLoading,
        error: dataError
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/volume/open-interest-by-expiration/${asset.toLowerCase()}/${strike === 'All Strikes' ? 'all' : strike}`,
        { exchange },
        optionsCache,
        CACHE_TTL.SHORT
    );

    const data = openInterestData || {};
    const loading = strikesLoading || dataLoading;
    const error = strikesError || dataError;

    // Генерация графика
    useEffect(() => {
        if (Object.keys(data).length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

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
                    data: [
                        'Puts OTM', 'Calls OTM',
                        'Puts Market Value [$]', 'Calls Market Value [$]', 'Notional Value [$]'
                    ],
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
                        splitLine: { lineStyle: { color: '#151518' } },
                        position: 'right',
                    },
                ],
                series: [
                    {
                        name: 'Puts OTM',
                        type: 'bar',
                        data: putsOtm,
                        itemStyle: { color: '#ff3e3e' },
                        barWidth: '25%',
                    },
                    {
                        name: 'Calls OTM',
                        type: 'bar',
                        data: callsOtm,
                        itemStyle: { color: '#00cc96' },
                        barWidth: '25%',
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
                    <h2>
                        🤟 Open Interest By Expiration
                    </h2>
                    <Camera className="icon" id="interestCamera"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="interestCamera" html={true}/>
                    <ShieldAlert
                        className="icon"
                        id="interestInfo"
                        data-tooltip-html={`
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Open Interest By Expiration (24h)</b> shows distribution</br> of options trading activity from the last 24 hours across</br> different expiration dates, including both volume and value.
            </div>
            
            <div style="margin-left: 10px; margin-bottom: 10px;">
                Chart components:
                <div style="margin-top: 5px;">• Bars show Out of The Money (OTM) contracts</div>
                <div>• Red bars - Put OTM contracts traded in last 24h</div>
                <div>• Green bars - Call OTM contracts traded in last 24h</div>
                <div>• Dotted lines show 24h market value in USD</div>
                <div style="margin-bottom: 5px;">• Yellow dots show total 24h notional value</div>
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                Value metrics (24h period):
                <div style="margin-top: 5px;">• Left axis - Number of contracts traded</div>
                <div>• Right axis - Current market value in USD</div>
                <div style="margin-bottom: 5px;">• Hover for detailed values per expiration</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Applications:</b>
                <div style="margin-top: 5px;">• Monitor daily options flow by expiration</div>
                <div>• Track 24h Put/Call distribution trends</div>
                <div style="margin-bottom: 5px;">• Analyze daily market positioning changes</div>
            </div>
        </div>
    `}
                    />
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

export default VolumeByExpirationChart;
