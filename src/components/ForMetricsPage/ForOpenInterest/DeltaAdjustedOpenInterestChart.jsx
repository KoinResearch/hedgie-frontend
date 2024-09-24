import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './OpenInterestByStrikeChart.css'; // Подключение CSS

const DeltaAdjustedOpenInterestChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]);
    const chartRef = useRef(null); // Ref для ECharts

    // Получение доступных дат экспирации при смене актива
    useEffect(() => {
        const fetchExpirations = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`);
                setExpirations(['All Expirations', ...response.data]); // Добавляем "All Expirations" в начало списка
            } catch (err) {
                console.error('Error fetching expirations:', err);
            }
        };
        fetchExpirations();
    }, [asset]);

    // Получение данных об открытых интересах с поправкой на дельту
    useEffect(() => {
        const fetchData = async () => {
            try {
                const expirationParam = expiration === 'All Expirations' ? 'all' : expiration;
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/delta-adjusted-open-interest-by-strike/${asset.toLowerCase()}/${expirationParam}`);
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
        if (data.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);

            // Преобразование данных для отображения
            const strikePrices = data.map(d => d.strike);
            const deltaAdjustedPuts = data.map(d => -Math.abs(d.puts_delta_adjusted)); // Отрицательные значения для Puts
            const deltaAdjustedCalls = data.map(d => Math.abs(d.calls_delta_adjusted)); // Положительные значения для Calls

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: function (params) {
                        const tooltipDate = params[0].axisValue;
                        let result = `<b>${tooltipDate}</b><br/>`;
                        params.forEach((item) => {
                            result += `<span style="color:${item.color};">●</span> ${item.seriesName}: ${item.value}<br/>`;
                        });
                        return result;
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: { color: '#000' },
                },
                legend: {
                    data: ['Puts', 'Calls'],
                    textStyle: { color: '#FFFFFF' },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: strikePrices,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45, // Поворот для читаемости
                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Delta Adjusted Open Interest',
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: { color: '#7E838D' },
                    splitLine: { lineStyle: { color: '#393E47' } },
                },
                series: [
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: deltaAdjustedPuts,
                        itemStyle: { color: '#ff3e3e' }, // Красный для Puts
                        barWidth: '30%',
                    },
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: deltaAdjustedCalls,
                        itemStyle: { color: '#00cc96' }, // Зеленый для Calls
                        barWidth: '30%',
                    }
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
                    <h2>👻 Delta Adjusted Open Interest By Strike</h2>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                    </div>
                    <div className="asset-option-buttons">
                        <select value={expiration} onChange={(e) => setExpiration(e.target.value)}>
                            {expirations.map((exp) => (
                                <option key={exp} value={exp}>
                                    {exp}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="graph">
                <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
            </div>
        </div>
    );
};

export default DeltaAdjustedOpenInterestChart;
