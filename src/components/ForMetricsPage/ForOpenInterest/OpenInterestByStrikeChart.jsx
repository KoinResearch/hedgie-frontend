import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './OpenInterestByStrikeChart.css';

const OpenInterestByStrikeChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirations, setExpirations] = useState([]);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const expirationParam = expiration === 'All Expirations' ? 'all' : expiration;
                console.log(`Fetching open interest data for ${asset} with expiration ${expirationParam}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/open-interest-by-strike/${asset.toLowerCase()}/${expirationParam}`);
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

    const strikePrices = data.map(d => d.strike);
    const puts = data.map(d => d.puts);
    const calls = data.map(d => d.calls);
    const putsMarketValue = data.map(d => d.puts_market_value);
    const callsMarketValue = data.map(d => d.calls_market_value);

    const totalPuts = puts.reduce((a, b) => a + (parseFloat(b) || 0), 0);
    const totalCalls = calls.reduce((a, b) => a + (parseFloat(b) || 0), 0);
    const totalNotional = putsMarketValue.reduce((a, b) => a + (parseFloat(b) || 0), 0) + callsMarketValue.reduce((a, b) => a + (parseFloat(b) || 0), 0);
    const putCallRatio = totalCalls !== 0 ? (totalPuts / totalCalls) : 0;

    return (
        <div className="chart-container">
            <h2 className="chart-title">Open Interest By Strike Price - Past 24h</h2>
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
                        {
                            x: strikePrices,
                            y: putsMarketValue,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Puts Market Value [$]',
                            line: { color: '#ff3e3e', dash: 'dot' },
                            yaxis: 'y2' // Ссылка на вторую ось
                        },
                        {
                            x: strikePrices,
                            y: callsMarketValue,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Calls Market Value [$]',
                            line: { color: '#00cc96', dash: 'dot' },
                            yaxis: 'y2' // Ссылка на вторую ось
                        },
                    ]}
                    layout={{
                        autosize: true,
                        xaxis: {
                            title: 'Strike Price',
                            automargin: true,
                            tickangle: -45,
                            range: [10000, 140000],
                        },
                        yaxis: {
                            title: 'Contracts',
                            automargin: true,
                        },
                        yaxis2: {
                            title: 'Market Value [$]',
                            overlaying: 'y', // Совмещение с основной осью Y
                            side: 'right',
                            automargin: true,
                        },
                        showlegend: true,
                        margin: { l: 80, r: 80, b: 120, t: 30 },
                        bargap: 0.3,
                        height: 600,
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <div className="chart-info">
                <p>Calls: {totalCalls.toFixed(2)} (Notional: ${(totalNotional * 0.67).toFixed(2)}, Market: ${(totalNotional * 0.33).toFixed(2)})</p>
                <p>Puts: {totalPuts.toFixed(2)} (Notional: ${(totalNotional * 0.33).toFixed(2)}, Market: ${(totalNotional * 0.67).toFixed(2)})</p>
                <p>Total: {(totalPuts + totalCalls).toFixed(2)} (Notional: ${totalNotional.toFixed(2)}, Market: ${(totalNotional * 1).toFixed(2)})</p>
                <p>Put/Call Ratio: {putCallRatio.toFixed(2)}</p>
            </div>
            <div className="chart-description">
                <h3>Description</h3>
                <p>The amount of option contracts and their dollar equivalent held in active positions sorted by strike price. The max pain price represents the strike price where most options will expire worthless. More info on this can be found.</p>
            </div>
        </div>
    );
};

export default OpenInterestByStrikeChart;
