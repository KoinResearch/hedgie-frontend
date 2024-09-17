import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const TimeDistributionChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [data, setData] = useState({ calls: [], puts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/metrics/time-distribution/${asset.toLowerCase()}`);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching time distribution data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Подготовка данных для графика
    const hours = [...new Set([...data.calls.map(d => d.hour), ...data.puts.map(d => d.hour)])];

    // Форматирование числового значения часов в строку HH:MM
    const formattedHours = hours.map(hour => {
        const date = new Date();
        date.setHours(hour);
        date.setMinutes(0); // Чтобы отображать время только по часам
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    });

    const callCounts = hours.map(hour => {
        const call = data.calls.find(d => d.hour === hour);
        return call ? call.trade_count : 0;
    });

    const putCounts = hours.map(hour => {
        const put = data.puts.find(d => d.hour === hour);
        return put ? put.trade_count : 0;
    });

    const avgIndexPrices = hours.map(hour => {
        const call = data.calls.find(d => d.hour === hour);
        return call ? call.avg_index_price : 0;
    });

    return (
        <div>
            <h2>Historical Volume - Past 24h</h2>
            <div>
                <button onClick={() => setAsset('BTC')} className={asset === 'BTC' ? 'active' : ''}>BTC</button>
                <button onClick={() => setAsset('ETH')} className={asset === 'ETH' ? 'active' : ''}>ETH</button>
            </div>
            <Plot
                data={[
                    {
                        x: formattedHours, // Форматированные часы
                        y: callCounts,
                        type: 'bar',
                        name: 'Calls',
                        marker: { color: 'green' }
                    },
                    {
                        x: formattedHours, // Форматированные часы
                        y: putCounts,
                        type: 'bar',
                        name: 'Puts',
                        marker: { color: 'red' }
                    },
                    {
                        x: formattedHours, // Форматированные часы
                        y: avgIndexPrices,
                        type: 'line',
                        name: 'Index Price',
                        yaxis: 'y2',
                        marker: { color: 'black' }
                    }
                ]}
                layout={{
                    xaxis: { title: 'Time (HH:MM)' }, // Обновленное название оси
                    yaxis: { title: 'Number of Trades' },
                    yaxis2: {
                        title: 'Index Price',
                        overlaying: 'y',
                        side: 'right',
                    },
                    barmode: 'group',
                }}
            />
        </div>
    );
};

export default TimeDistributionChart;
