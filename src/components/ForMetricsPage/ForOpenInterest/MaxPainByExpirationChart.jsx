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
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        Max Pain Price By Expiration
                    </h2>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                        <span className="custom-arrow">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667" stroke-linecap="round"
                  stroke-linejoin="round"/>
        </svg>
    </span>
                    </div>
                </div>
                <div className="flow-option-dedicated"></div>
            </div>
            <div className="max-pain-graph">
                <Plot
                    data={[
                        {
                            x: expirationDates,
                            y: maxPainValues,
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: {color: '#FF4136'}, // Красный цвет линии
                            line: {shape: 'spline', width: 2} // Сглаживание линии
                        },
                    ]}
                    layout={{
                        paper_bgcolor: '#151518',
                        plot_bgcolor: '#151518',
                        font: {
                            family: 'Arial, sans-serif',
                            size: 14,
                            color: '#FFFFFF'
                        },
                        xaxis: {
                            title: 'Expiration Dates',
                            gridcolor: '#393E47',
                            tickfont: {color: '#FFFFFF'},
                        },
                        yaxis: {
                            title: 'Max Pain Price [$]',
                            gridcolor: '#393E47',
                            tickfont: {color: '#FFFFFF'},
                        },
                        autosize: true,
                        margin: {
                            l: 40,
                            r: 10,
                            b: 40,
                            t: 40,
                            pad: 4
                        },
                    }}
                    useResizeHandler={true}
                    style={{width: '100%', height: '100%'}}
                />
            </div>
        </div>
    );
};

export default MaxPainByExpirationChart;
