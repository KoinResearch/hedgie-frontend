import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './VolumeByStrikePriceChart.css'; // Подключение CSS

const VolumeByStrikePriceChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]);

    // Получение доступных экспираций при смене актива
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

    // Получение данных об объеме по страйку
    useEffect(() => {
        const fetchData = async () => {
            try {
                const expirationParam = expiration === 'All Expirations' ? 'all' : expiration;
                console.log(`Fetching volume data for ${asset} with expiration ${expirationParam}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/volume/open-interest-by-strike/${asset.toLowerCase()}/${expirationParam}`);
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

    // Преобразование данных для отображения
    const strikePrices = data.map(d => d.strike);
    const puts = data.map(d => d.puts);
    const calls = data.map(d => d.calls);

    const totalPuts = puts.reduce((a, b) => a + (parseFloat(b) || 0), 0);
    const totalCalls = calls.reduce((a, b) => a + (parseFloat(b) || 0), 0);
    const putCallRatio = totalCalls !== 0 ? (totalPuts / totalCalls) : 0;

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        Volume By Strike Price
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
                            y: puts,
                            type: 'bar',
                            name: 'Puts',
                            marker: {
                                color: '#ff3e3e', // Красный для Puts
                            },
                        },
                        {
                            x: strikePrices,
                            y: calls,
                            type: 'bar',
                            name: 'Calls',
                            marker: {
                                color: '#00cc96', // Зелёный для Calls
                            },
                        },
                    ]}
                    layout={{
                        autosize: true,
                        xaxis: {
                            title: 'Strike Price',
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF', // Белые подписи оси X
                            },
                        },
                        yaxis: {
                            title: 'Volume',
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF', // Белые подписи оси Y
                            },
                            gridcolor: '#393E47', // Цвет сетки
                        },
                        legend: {
                            x: 0.01,
                            y: 1.1,
                            orientation: 'h', // Горизонтальная легенда
                            font: {
                                size: 12,
                                color: '#FFFFFF', // Цвет текста легенды
                            },
                        },
                        margin: {
                            l: 50,
                            r: 50,
                            b: 50,
                            t: 30,
                        },
                        bargap: 0.3, // Расстояние между столбцами
                        paper_bgcolor: '#151518', // Тёмный фон графика
                        plot_bgcolor: '#151518', // Тёмный фон области графика
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }} // График будет занимать весь контейнер
                />
            </div>
            <div className="chart-info">
                <p>Calls: {totalCalls.toFixed(2)}</p>
                <p>Puts: {totalPuts.toFixed(2)}</p>
                <p>Total: {(totalPuts + totalCalls).toFixed(2)}</p>
                <p>Put/Call Ratio: {putCallRatio.toFixed(2)}</p>
            </div>
            <div className="chart-description">
                <h3>Description</h3>
                <p>The amount of option contracts traded in the last 24h sorted by strike price.</p>
            </div>
        </div>
        </div>
    );
};

export default VolumeByStrikePriceChart;
