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

    return (
        <div className="chart-container">
            <h2 className="chart-title">Delta Adjusted Open Interest By Strike - Past 24h</h2>
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
            <div className="plot-container">
                <Plot
                    data={[
                        { x: strikePrices, y: deltaAdjustedPuts, type: 'bar', name: 'Puts', marker: { color: '#ff3e3e' } },
                        { x: strikePrices, y: deltaAdjustedCalls, type: 'bar', name: 'Calls', marker: { color: '#00cc96' } }
                    ]}
                    layout={{
                        autosize: true,
                        xaxis: { title: 'Strike Price' },
                        yaxis: { title: 'Delta Adjusted Open Interest' },
                        showlegend: true,
                        margin: { l: 50, r: 50, b: 50, t: 30 },
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <div className="chart-description">
                <h3>Description</h3>
                <p>The amount of option contracts in active positions multiplied by their delta value. Delta-adjusted open interest can tell us the amount of the underlying asset option writers need to buy or sell in order to remain delta neutral.</p>
            </div>
        </div>
    );
};

export default DeltaAdjustedOpenInterestChart;
