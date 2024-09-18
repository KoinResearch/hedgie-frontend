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
        <div className="chart-container">
            <h2 className="chart-title">Volume By Strike Price</h2>
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
                        { x: strikePrices, y: puts, type: 'bar', name: 'Puts', marker: { color: '#ff3e3e' } },
                        { x: strikePrices, y: calls, type: 'bar', name: 'Calls', marker: { color: '#00cc96' } },
                    ]}
                    layout={{
                        autosize: true,
                        xaxis: { title: 'Strike Price' },
                        yaxis: { title: 'Volume' },
                        showlegend: true,
                        margin: { l: 50, r: 50, b: 50, t: 30 },
                        bargap: 0.3,
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
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
    );
};

export default VolumeByStrikePriceChart;
