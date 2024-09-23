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
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        Historical Open Interest Chart
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
                        <select onChange={e => setPeriod(e.target.value)} value={period}>
                            <option value="1d">1d</option>
                            <option value="7d">7d</option>
                            <option value="1m">1m</option>
                            <option value="all">All</option>
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
                <div className="graph">
                    <Plot
                        data={[
                            {
                                x: timestamps,
                                y: totalContracts,
                                type: 'scatter',
                                mode: 'lines',
                                fill: 'tozeroy', // Заливка области под линией
                                name: 'Total Contracts',
                                line: {
                                    color: '#e74c3c', // Красный для контрактов
                                    width: 2,
                                },
                                yaxis: 'y1', // Привязка к левой оси Y
                            },
                            {
                                x: timestamps,
                                y: avgIndexPrices,
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Index Price',
                                line: {
                                    color: '#7f7f7f', // Серый для индекса
                                    width: 2,
                                },
                                yaxis: 'y2', // Привязка к правой оси Y
                            },
                        ]}
                        layout={{
                            autosize: true,
                            xaxis: {
                                title: 'Time',
                                tickfont: {
                                    size: 12,
                                    color: '#FFFFFF',
                                },
                                showgrid: false,
                            },
                            yaxis: {
                                title: 'Total Contracts',
                                side: 'left',
                                tickfont: {
                                    size: 12,
                                    color: '#e74c3c', // Красный цвет оси для контрактов
                                },
                                showgrid: false,
                            },
                            yaxis2: {
                                title: 'Index Price',
                                overlaying: 'y', // Накладываем на первую ось
                                side: 'right',
                                tickfont: {
                                    size: 12,
                                    color: '#7f7f7f', // Серый цвет оси для индекса
                                },
                            },
                            legend: {
                                x: 0.1,
                                y: 1.1,
                                orientation: 'h', // Горизонтальная легенда
                                font: {
                                    size: 12,
                                    color: '#FFFFFF',
                                },
                            },
                            margin: {
                                l: 50,
                                r: 50,
                                b: 50,
                                t: 30,
                            },
                            paper_bgcolor: '#151518', // Тёмный фон
                            plot_bgcolor: '#151518', // Тёмный фон области графика
                            showlegend: true,
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }} // График будет занимать весь контейнер
                    />
                </div>
            </div>
        </div>
    );
};

export default HistoricalOpenInterestChart;
