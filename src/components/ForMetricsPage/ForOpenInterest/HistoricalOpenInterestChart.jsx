import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import './HistoricalOpenInterestChart.css'; // Подключаем файл CSS для стилей

const HistoricalOpenInterestChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [asset, setAsset] = useState('BTC'); // Валюта по умолчанию
    const [period, setPeriod] = useState('1d'); // Период по умолчанию

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Формируем URL с параметрами
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/historical-open-interest/${asset.toLowerCase()}/${period}`);

                if (response.data) {
                    setData(response.data);
                } else {
                    console.warn('Нет доступных данных:', response.data);
                    setData(null);
                }
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при получении данных Historical Open Interest:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, period]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data) {
        return <div>No data</div>;
    }

    // Преобразуем данные для отображения на графике
    const timestamps = data.map(entry => entry.timestamp);
    const totalContracts = data.map(entry => entry.total_contracts);
    const avgIndexPrices = data.map(entry => entry.avg_index_price);

    return (
        <div className="chart-container">
            <h2 className="chart-title">Historical Open Interest</h2>
            <div className="chart-controls">
                <button onClick={() => setAsset('BTC')} className={`asset-button ${asset === 'BTC' ? 'active' : ''}`}>
                    BTC
                </button>
                <button onClick={() => setAsset('ETH')} className={`asset-button ${asset === 'ETH' ? 'active' : ''}`}>
                    ETH
                </button>
                <select onChange={e => setPeriod(e.target.value)} value={period} className="chart-select">
                    <option value="1d">1d</option>
                    <option value="7d">7d</option>
                    <option value="1m">1m</option>
                    <option value="all">All</option>
                </select>
            </div>
            <div className="plot-container">
                <Plot
                    data={[
                        {
                            x: timestamps,
                            y: totalContracts,
                            type: 'scatter',
                            mode: 'lines',
                            fill: 'tozeroy',
                            name: 'Total',
                            line: { color: '#e74c3c' },
                            yaxis: 'y1', // Привязываем к левой оси Y
                        },
                        {
                            x: timestamps,
                            y: avgIndexPrices,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Index Price',
                            line: { color: '#7f7f7f' },
                            yaxis: 'y2', // Привязываем к правой оси Y
                        },
                    ]}
                    layout={{
                        xaxis: { title: 'Time', tickfont: { size: 12, color: '#333' } },
                        yaxis: {
                            title: 'Total Contracts',
                            side: 'left',
                            tickfont: { size: 12, color: '#e74c3c' },
                            showgrid: false,
                        },
                        yaxis2: {
                            title: 'Index Price',
                            overlaying: 'y', // Накладываем на первую ось
                            side: 'right',
                            tickfont: { size: 12, color: '#7f7f7f' }
                        },
                        legend: {
                            x: 0.1,
                            y: 1.1,
                            orientation: 'h'
                        },
                        autosize: true,
                        showlegend: true,
                        margin: { l: 50, r: 50, b: 50, t: 30 },
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <div className="chart-description">
                <h3>Description</h3>
                <p>The amount of option contracts in active positions over time.</p>
            </div>
        </div>
    );
};

export default HistoricalOpenInterestChart;
