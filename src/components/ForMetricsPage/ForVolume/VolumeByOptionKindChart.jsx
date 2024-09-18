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
        <div className="chart-container"> {/* Главный контейнер с закругленными краями */}
            <h2 className="chart-title">Volume By Option Kind</h2>
            <div className="chart-controls">
                <button onClick={() => setAsset('BTC')} className={`asset-button ${asset === 'BTC' ? 'active' : ''}`}>BTC</button>
                <button onClick={() => setAsset('ETH')} className={`asset-button ${asset === 'ETH' ? 'active' : ''}`}>ETH</button>
            </div>
            <div className="chart-select">
                <select onChange={(e) => setExpiration(e.target.value)} value={expiration}>
                    {expirations.map(exp => (
                        <option key={exp} value={exp}>
                            {exp}
                        </option>
                    ))}
                </select>
            </div>
            <div className="plot-container"> {/* Контейнер для графика */}
                <Plot
                    data={[
                        {
                            x: [data.Calls, data.Puts],
                            y: ['Calls', 'Puts'],
                            type: 'bar',
                            orientation: 'h', // Горизонтальные столбцы
                            marker: { color: ['#00cc96', '#ff3e3e'] }, // Цвета
                            name: 'Volume',
                        },
                    ]}
                    layout={{
                        autosize: true, // Автоматическое изменение размера
                        xaxis: { title: 'Volume', showgrid: false },
                        yaxis: { title: '' },
                        margin: { l: 100, r: 50, b: 50, t: 50 }, // Отступы
                        showlegend: false, // Убираем легенду
                    }}
                    useResizeHandler={true} // Адаптация к изменениям размера контейнера
                    style={{ width: '100%', height: '100%' }} // График будет занимать весь контейнер
                />
            </div>
            <div className="chart-description"> {/* Блок для описания */}
                <h3>Description</h3>
                <p>The amount of option contracts traded in the last 24 hours by option type.</p>
            </div>
        </div>
    );
};

export default VolumeByOptionKindChart;
