import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const StrikeActivityChartBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [expiration, setExpiration] = useState('All Expirations');
    const [data, setData] = useState([]);
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(`Fetching strike activity for ${asset} with expiration ${expiration}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/strike-activity/${asset.toLowerCase()}?expiration=${expiration}`);
                console.log('Fetched raw data:', response.data);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching strike activity data:', err);
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

    // Разделение данных по Call и Put
    const callData = data.filter(d => d.option_type === 'C');
    const putData = data.filter(d => d.option_type === 'P');

    // Подготовка данных для отображения
    const strikePrices = callData.map(d => d.strike_price);
    const callTradeCounts = callData.map(d => d.trade_count);
    const putTradeCounts = putData.map(d => {
        const matchingCall = callData.find(call => call.strike_price === d.strike_price);
        return matchingCall ? d.trade_count : d.trade_count;
    });

    return (
        <div style={{ width: '100%', height: '100%' }}> {/* Контейнер с адаптивными размерами */}
            <h2>Volume By Strike Price - Past 24h</h2>
            <div>
                <button onClick={() => setAsset('BTC')} className={asset === 'BTC' ? 'active' : ''}>BTC</button>
                <button onClick={() => setAsset('ETH')} className={asset === 'ETH' ? 'active' : ''}>ETH</button>
            </div>
            <div>
                <select onChange={(e) => setExpiration(e.target.value)} value={expiration}>
                    {expirations.map(exp => (
                        <option key={exp} value={exp}>
                            {exp}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{ width: '100%', height: '400px' }}> {/* Контейнер для графика */}
                <Plot
                    data={[
                        {
                            x: strikePrices,
                            y: callTradeCounts,
                            type: 'bar',
                            marker: { color: 'green' },
                            name: 'Calls',
                        },
                        {
                            x: strikePrices,
                            y: putTradeCounts,
                            type: 'bar',
                            marker: { color: 'red' },
                            name: 'Puts',
                        },
                    ]}
                    layout={{
                        autosize: true, // Автоматическое изменение размера
                        xaxis: { title: 'Strike Price' },
                        yaxis: { title: 'Number of Trades' },
                        barmode: 'group',
                    }}
                    useResizeHandler={true} // Адаптация к изменениям размера контейнера
                    style={{ width: '100%', height: '100%' }} // График будет занимать весь контейнер
                />
            </div>
        </div>
    );
};

export default StrikeActivityChartBlockTrades;
