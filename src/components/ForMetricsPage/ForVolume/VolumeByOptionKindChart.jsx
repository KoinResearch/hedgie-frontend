import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './VolumeByOptionKindChart.css'; // Импортируем CSS-файл для стилей

const VolumeByOptionKindChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState({ Calls: 0, Puts: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]); // Для хранения доступных дат экспирации

    // Fetch available expirations when the asset changes
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

    // Fetch volume data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Используем "all" вместо "All Expirations" для запроса на сервер
                const expirationParam = expiration === 'All Expirations' ? 'all' : expiration;
                console.log(`Fetching volume data for ${asset} with expiration ${expirationParam}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/volume/open-interest/${asset.toLowerCase()}/${expirationParam}`);
                console.log('Fetched raw data:', response.data);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching volume data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, expiration]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        Volume By Option Kind
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
                    <div className="asset-option-buttons">
                        <select onChange={(e) => setExpiration(e.target.value)} value={expiration}>
                            {expirations.map(exp => (
                                <option key={exp} value={exp}>
                                    {exp}
                                </option>
                            ))}
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
                <div> {/* Контейнер для графика */}
                    <Plot
                        data={[
                            {
                                x: [data.Calls, data.Puts], // Значения для Calls и Puts
                                y: ['Calls', 'Puts'], // Метки для оси Y
                                type: 'bar',
                                orientation: 'h', // Горизонтальная ориентация столбцов
                                marker: {
                                    color: ['#00cc96', '#ff3e3e'], // Зеленый для Calls, Красный для Puts
                                    line: {
                                        width: 2,
                                        color: ['#00b383', '#e60000'], // Цвет границ столбцов
                                    },
                                },
                                name: 'Open Interest',
                            },
                        ]}
                        layout={{
                            autosize: true, // Автоматическое изменение размера
                            xaxis: {
                                title: 'Number of Contracts',
                                showgrid: false, // Убираем сетку
                                zeroline: false, // Убираем ось нуля
                                tickfont: {
                                    size: 12,
                                    color: '#FFFFFF', // Белый цвет текста
                                },
                            },
                            yaxis: {
                                title: '',
                                tickfont: {
                                    size: 14,
                                    color: '#FFFFFF', // Белый цвет меток на оси Y
                                },
                            },
                            margin: {
                                l: 100,
                                r: 50,
                                b: 50,
                                t: 50, // Отступы
                            },
                            paper_bgcolor: '#151518', // Тёмный фон
                            plot_bgcolor: '#151518', // Тёмный фон для графика
                            showlegend: false, // Убираем легенду
                        }}
                        useResizeHandler={true} // Адаптация к изменениям размера контейнера
                        style={{width: '100%', height: '100%'}} // График будет занимать весь контейнер
                    />
                </div>
                <div className="chart-description"> {/* Блок для описания */}
                    <h3>Description</h3>
                    <p>The amount of option contracts held in active positions by type.</p>
                </div>
            </div>
        </div>
    );
};

export default VolumeByOptionKindChart;
