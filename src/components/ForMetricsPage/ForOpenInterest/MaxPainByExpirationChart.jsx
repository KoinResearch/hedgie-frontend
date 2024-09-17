import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import './MaxPainByExpirationChart.css'; // Подключаем файл CSS

const MaxPainByExpirationChart = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [asset, setAsset] = useState('BTC'); // Валюта по умолчанию

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/max-pain-data?currency=${asset.toLowerCase()}`);

                // Проверяем, что данные содержат необходимые поля
                if (response.data && response.data.maxPainByExpiration) {
                    setData(response.data.maxPainByExpiration);
                } else {
                    console.warn('Нет доступных данных:', response.data);
                    setData(null);
                }
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при получении данных Max Pain:', error);
                setError(error.message);
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

    if (!data) {
        return <div>No data</div>;
    }

    // Извлекаем и сортируем даты экспирации
    let expirationDates = Object.keys(data);
    expirationDates = expirationDates.sort((a, b) => new Date(a) - new Date(b));

    // Извлекаем значения Max Pain и объемов
    const maxPainValues = expirationDates.map(exp => data[exp].maxPain);
    const notionalValues = expirationDates.map(exp => data[exp].intrinsicValues.notionalValue);

    return (
        <div className="chart-container">
            <h2 className="chart-title">Max Pain Price By Expiration</h2>
            <div className="chart-controls">
                <button onClick={() => setAsset('BTC')} className={`asset-button ${asset === 'BTC' ? 'active' : ''}`}>
                    BTC
                </button>
                <button onClick={() => setAsset('ETH')} className={`asset-button ${asset === 'ETH' ? 'active' : ''}`}>
                    ETH
                </button>
            </div>
            <div className="plot-container">
                <Plot
                    data={[
                        {
                            x: expirationDates,
                            y: notionalValues,
                            type: 'bar',
                            name: 'Notional Value',
                            marker: { color: '#7f7f7f' },
                            yaxis: 'y2',
                        },
                        {
                            x: expirationDates,
                            y: maxPainValues,
                            type: 'scatter',
                            mode: 'lines+markers',
                            name: 'Max Pain Price [$]',
                            marker: { color: '#e74c3c' },
                            line: { shape: 'spline', width: 2 },
                        },
                    ]}
                    layout={{
                        xaxis: { title: 'Expiration Date', tickfont: { size: 12, color: '#333' } },
                        yaxis: { title: 'Max Pain Price [$]', side: 'left', tickfont: { size: 12, color: '#333' } },
                        yaxis2: {
                            title: 'Notional Value',
                            overlaying: 'y',
                            side: 'right',
                            tickfont: { size: 12, color: '#333' }
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
                <p>The max pain price across all expiration dates.</p>
            </div>
        </div>
    );
};

export default MaxPainByExpirationChart;
