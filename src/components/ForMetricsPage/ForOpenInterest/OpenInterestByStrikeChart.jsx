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

    // Определяем минимальные и максимальные значения для осей Y
    const minYValue = Math.min(...puts, ...calls, 0);
    const maxYValue = Math.max(...puts, ...calls);
    const minY2Value = Math.min(...putsMarketValue, ...callsMarketValue, 0);
    const maxY2Value = Math.max(...putsMarketValue, ...callsMarketValue);

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        Open Interest By Strike Price
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
                                color: '#00cc96', // Зеленый для Calls
                            },
                        },
                        {
                            x: strikePrices,
                            y: putsMarketValue,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Puts Market Value [$]',
                            line: {
                                color: '#ff3e3e', // Красный для линии Puts
                                dash: 'dot',
                                width: 2,
                            },
                            yaxis: 'y2',
                        },
                        {
                            x: strikePrices,
                            y: callsMarketValue,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Calls Market Value [$]',
                            line: {
                                color: '#00cc96', // Зеленый для линии Calls
                                dash: 'dot',
                                width: 2,
                            },
                            yaxis: 'y2',
                        },
                    ]}
                    layout={{
                        autosize: true,
                        xaxis: {
                            title: 'Strike Price',
                            automargin: true,
                            tickangle: -45, // Наклон подписей
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF',
                            },
                            range: [10000, 140000], // Диапазон для цен на страйк
                        },
                        yaxis: {
                            title: 'Contracts',
                            automargin: true,
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF',
                            },
                            range: [minYValue, maxYValue], // Диапазон для контрактов
                            gridcolor: '#393E47',
                            zeroline: false,
                        },
                        yaxis2: {
                            title: 'Market Value [$]',
                            overlaying: 'y',
                            side: 'right',
                            automargin: true,
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF',
                            },
                            range: [minY2Value, maxY2Value], // Диапазон для рыночной стоимости
                            showgrid: false,
                            zeroline: false,
                        },
                        showlegend: true,
                        legend: {
                            x: 0.01,
                            y: 1.1,
                            orientation: 'h',
                            font: {
                                size: 12,
                                color: '#FFFFFF',
                            },
                        },
                        margin: {
                            l: 80,
                            r: 80, // Увеличенные отступы для правой оси
                            b: 120,
                            t: 30,
                        },
                        bargap: 0.3, // Промежуток между столбцами
                        height: 600, // Высота графика
                        paper_bgcolor: '#151518', // Фон графика
                        plot_bgcolor: '#151518', // Фон области построения
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <div className="chart-info">
                <p>Calls: {totalCalls.toFixed(2)} (Notional: ${(totalNotional * 0.67).toFixed(2)}, Market:
                    ${(totalNotional * 0.33).toFixed(2)})</p>
                <p>Puts: {totalPuts.toFixed(2)} (Notional: ${(totalNotional * 0.33).toFixed(2)}, Market:
                    ${(totalNotional * 0.67).toFixed(2)})</p>
                <p>Total: {(totalPuts + totalCalls).toFixed(2)} (Notional: ${totalNotional.toFixed(2)}, Market:
                    ${(totalNotional * 1).toFixed(2)})</p>
                <p>Put/Call Ratio: {putCallRatio.toFixed(2)}</p>
            </div>
            <div className="chart-description">
                <h3>Description</h3>
                <p>The amount of option contracts and their dollar equivalent held in active positions sorted by strike
                    price. The max pain price represents the strike price where most options will expire worthless. More
                    info on this can be found.</p>
            </div>
        </div>
</div>
)
    ;
};

export default OpenInterestByStrikeChart;
