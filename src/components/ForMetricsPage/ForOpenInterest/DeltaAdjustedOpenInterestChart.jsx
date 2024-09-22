import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './OpenInterestByStrikeChart.css'; // Подключение CSS

const DeltaAdjustedOpenInterestChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]); // Для хранения доступных дат экспирации

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
                // Используем "all" вместо "All Expirations" для запроса на сервер
                const expirationParam = expiration === 'All Expirations' ? 'all' : expiration;
                console.log(`Fetching delta adjusted open interest data for ${asset} with expiration ${expirationParam}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/delta-adjusted-open-interest-by-strike/${asset.toLowerCase()}/${expirationParam}`);
                console.log('Fetched raw data:', response.data);
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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Преобразование данных для отображения
    const strikePrices = data.map(d => d.strike);
    const deltaAdjustedPuts = data.map(d => -Math.abs(d.puts_delta_adjusted)); // Отрицательные значения для Puts
    const deltaAdjustedCalls = data.map(d => Math.abs(d.calls_delta_adjusted)); // Положительные значения для Calls

    // Определение начального диапазона для 'All Expirations'
    const defaultXRange = expiration === 'All Expirations' && strikePrices.length > 0
        ? [Math.min(...strikePrices), Math.min(...strikePrices) + (Math.max(...strikePrices) - Math.min(...strikePrices)) * 0.2]
        : null;

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        Delta Adjusted Open Interest By Strike
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
            <div>
                <Plot
                    data={[
                        {
                            x: strikePrices,
                            y: deltaAdjustedPuts,
                            type: 'bar',
                            name: 'Puts',
                            marker: {
                                color: '#ff3e3e', // Красный для Puts
                            },
                        },
                        {
                            x: strikePrices,
                            y: deltaAdjustedCalls,
                            type: 'bar',
                            name: 'Calls',
                            marker: {
                                color: '#00cc96', // Зеленый для Calls
                            },
                        },
                    ]}
                    layout={{
                        autosize: true,
                        xaxis: {
                            title: 'Strike Price',
                            range: defaultXRange, // Начальный диапазон для оси X
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF', // Белый цвет подписей
                            },
                        },
                        yaxis: {
                            title: 'Delta Adjusted Open Interest',
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF', // Белый цвет подписей
                            },
                            gridcolor: '#393E47',
                            zeroline: false, // Убираем нулевую линию
                        },
                        legend: {
                            x: 0.01,
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
                        bargap: 0.3, // Промежуток между столбцами
                        height: 600, // Высота графика
                        paper_bgcolor: '#151518', // Фон графика
                        plot_bgcolor: '#151518', // Фон области построения
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }} // График будет занимать весь контейнер
                />
            </div>
            <div className="chart-description">
                <h3>Description</h3>
                <p>The amount of option contracts in active positions multiplied by their delta value. Delta-adjusted
                    open interest can tell us the amount of the underlying asset option writers need to buy or sell in
                    order to remain delta neutral.</p>
            </div>
        </div>
        </div>
    );
};

export default DeltaAdjustedOpenInterestChart;
