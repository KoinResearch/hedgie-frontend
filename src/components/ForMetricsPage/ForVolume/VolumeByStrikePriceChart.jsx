import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './VolumeByStrikePriceChart.css'; // Подключение CSS

const VolumeByStrikePriceChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]);
    const chartRef = useRef(null); // Ref для ECharts

    useEffect(() => {
        const fetchExpirations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`);
                setExpirations(['All Expirations', ...response.data]);
            } catch (err) {
                console.error('Error fetching expirations:', err);
            }
        };
        fetchExpirations();
    }, [asset]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ensure the correct expiration parameter is passed to the API.
                const expirationParam = expiration === 'All Expirations' ? 'all' : expiration;
                console.log(`Fetching open interest data for ${asset} with expiration ${expirationParam}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/volume/open-interest-by-strike/${asset.toLowerCase()}/${expirationParam}`);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching open interest data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, expiration]);

    useEffect(() => {
        if (!loading && chartRef.current && data.length > 0) {
            const chartInstance = echarts.init(chartRef.current);

            const strikePrices = data.map(d => d.strike);
            const puts = data.map(d => d.puts);
            const calls = data.map(d => d.calls);
            const putsMarketValue = data.map(d => d.puts_market_value);
            const callsMarketValue = data.map(d => d.calls_market_value);

            // Safely calculate totals only if data is available
            const totalPuts = puts.length ? puts.reduce((a, b) => a + (parseFloat(b) || 0), 0) : 0;
            const totalCalls = calls.length ? calls.reduce((a, b) => a + (parseFloat(b) || 0), 0) : 0;
            const totalNotional = (putsMarketValue.length ? putsMarketValue.reduce((a, b) => a + (parseFloat(b) || 0), 0) : 0)
                + (callsMarketValue.length ? callsMarketValue.reduce((a, b) => a + (parseFloat(b) || 0), 0) : 0);
            const putCallRatio = totalCalls !== 0 ? (totalPuts / totalCalls) : 0;

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
                    data: ['Puts', 'Calls', 'Puts Market Value [$]', 'Calls Market Value [$]'],
                    textStyle: { color: '#B8B8B8' },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: strikePrices,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45, // Поворот меток для читаемости
                    },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Contracts',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: { color: '#7E838D' },
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                    {
                        type: 'value',
                        name: 'Market Value [$]',
                        axisLine: { lineStyle: { color: '#A9A9A9' } },
                        axisLabel: { color: '#7E838D' },
                        position: 'right',
                        splitLine: { lineStyle: { color: '#393E47' } },
                    },
                ],
                series: [
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: puts,
                        itemStyle: { color: '#ff3e3e' }, // Красный для Puts
                        barWidth: '30%',
                    },
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: calls,
                        itemStyle: { color: '#00cc96' }, // Зелёный для Calls
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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (data.length === 0) {
        return <div>No data available</div>;
    }

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        😬 Open Interest By Strike Price
                    </h2>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                    </div>
                    <div className="asset-option-buttons">
                        <select onChange={(e) => setExpiration(e.target.value)} value={expiration}>
                            {expirations.map(exp => (
                                <option key={exp} value={exp}>
                                    {exp}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flow-option-dedicated"></div>
            </div>
            <div className="graph">
                <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
            </div>
        </div>
    );
};

export default VolumeByStrikePriceChart;


