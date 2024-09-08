import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const ExpirationActivityChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [strike, setStrike] = useState(null);  // Добавляем состояние для выбранного страйка
    const [data, setData] = useState({ calls: [], puts: [] });
    const [strikes, setStrikes] = useState([]);  // Список доступных страйков
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Получение доступных страйков при изменении актива
    useEffect(() => {
        const fetchStrikes = async () => {
            try {
                const response = await axios.get(`http://localhost:5003/api/strikes/${asset.toLowerCase()}`);
                setStrikes(response.data);
            } catch (err) {
                console.error('Error fetching strikes:', err);
            }
        };

        fetchStrikes();
    }, [asset]);

    // Получение активности по дате истечения и страйку
    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = `http://localhost:5003/api/metrics/expiration-activity/${asset.toLowerCase()}`;
                if (strike) {
                    url += `/${strike}`;  // Добавляем страйк в запрос, если он выбран
                }

                const response = await axios.get(url);
                setData(response.data);
                setLoading(false);
                console.log('Fetched data:', response.data);
            } catch (err) {
                console.error('Error fetching expiration activity data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset, strike]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Подготовка данных для графика
    const expirationDates = [...new Set([...data.calls.map(d => d.expiration_date), ...data.puts.map(d => d.expiration_date)])];

    const callCounts = expirationDates.map(date => {
        const call = data.calls.find(d => d.expiration_date === date);
        return call ? call.trade_count : 0;
    });

    const putCounts = expirationDates.map(date => {
        const put = data.puts.find(d => d.expiration_date === date);
        return put ? put.trade_count : 0;
    });

    return (
        <div>
            <h2>{asset} Option Volume By Expiration - Past 24h</h2>
            <div>
                <button onClick={() => setAsset('BTC')} className={asset === 'BTC' ? 'active' : ''}>BTC</button>
                <button onClick={() => setAsset('ETH')} className={asset === 'ETH' ? 'active' : ''}>ETH</button>
            </div>

            {/* Выпадающий список для выбора страйка */}
            <div>
                <label>Select Strike: </label>
                <select value={strike || ''} onChange={(e) => setStrike(e.target.value || null)}>
                    <option value="">All Strikes</option>
                    {strikes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <h3>Expiration Activity - {asset} {strike && ` - Strike: ${strike}`}</h3>
            <Plot
                data={[
                    {
                        x: expirationDates,
                        y: callCounts,
                        type: 'bar',
                        name: 'Calls',
                        marker: { color: 'green' }
                    },
                    {
                        x: expirationDates,
                        y: putCounts,
                        type: 'bar',
                        name: 'Puts',
                        marker: { color: 'red' }
                    }
                ]}
                layout={{
                    title: `Volume By Expiration - ${asset}`,
                    xaxis: { title: 'Expiration Date' },
                    yaxis: { title: 'Number of Trades' },
                    barmode: 'group'
                }}
            />
        </div>
    );
};

export default ExpirationActivityChart;
