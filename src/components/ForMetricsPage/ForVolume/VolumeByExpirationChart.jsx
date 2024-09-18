import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './VolumeByExpirationChart.css'; // Подключение CSS

const VolumeByExpirationChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [strike, setStrike] = useState('All Strikes');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [strikes, setStrikes] = useState([]); // Для хранения доступных страйков

    // Получение доступных страйков при смене актива
    useEffect(() => {
        const fetchStrikes = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/strikes/${asset.toLowerCase()}`);
                setStrikes(['All Strikes', ...response.data]); // Добавляем "All Strikes" в начало списка
            } catch (err) {
                console.error('Error fetching strikes:', err);
            }
        };
        fetchStrikes();
    }, [asset]);

    // Получение данных об объеме по экспирации
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Используем "all" для запроса всех страйков
                const strikeParam = strike === 'All Strikes' ? 'all' : strike;
                console.log(`Fetching volume data for ${asset} with strike ${strikeParam}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/volume/open-interest-by-expiration/${asset.toLowerCase()}/${strikeParam}`);
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
    }, [asset, strike]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Преобразование данных для отображения
    const expirationDates = data.map(d => d.expiration);
    const putsOtm = data.map(d => d.puts_otm);
    const putsItm = data.map(d => d.puts_itm);
    const callsOtm = data.map(d => d.calls_otm);
    const callsItm = data.map(d => d.calls_itm);

    return (
        <div className="chart-container">
            <h2 className="chart-title">Volume By Expiration</h2>
            <div className="chart-controls">
                <button onClick={() => setAsset('BTC')} className={`asset-button ${asset === 'BTC' ? 'active' : ''}`}>BTC</button>
                <button onClick={() => setAsset('ETH')} className={`asset-button ${asset === 'ETH' ? 'active' : ''}`}>ETH</button>
            </div>
            <div className="chart-select">
                <select onChange={(e) => setStrike(e.target.value)} value={strike}>
                    {strikes.map(s => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>
            <div className="plot-container">
                <Plot
                    data={[
                        {
                            x: expirationDates,
                            y: putsOtm,
                            type: 'bar',
                            name: 'Puts OTM',
                            marker: { color: '#ff3e3e' }
                        },
                        {
                            x: expirationDates,
                            y: putsItm,
                            type: 'bar',
                            name: 'Puts ITM',
                            marker: { color: '#ff7f7f' }
                        },
                        {
                            x: expirationDates,
                            y: callsOtm,
                            type: 'bar',
                            name: 'Calls OTM',
                            marker: { color: '#00cc96' }
                        },
                        {
                            x: expirationDates,
                            y: callsItm,
                            type: 'bar',
                            name: 'Calls ITM',
                            marker: { color: '#66ff99' }
                        },
                    ]}
                    layout={{
                        autosize: true,
                        xaxis: { title: 'Expiration Date' },
                        yaxis: {
                            title: 'Volume',
                            side: 'left',
                            showgrid: true,
                            zeroline: false // Убираем нулевую линию
                        },
                        barmode: 'group', // Группируем столбцы
                        showlegend: true,
                        margin: { l: 50, r: 50, b: 50, t: 30 },
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <div className="chart-description">
                <h3>Description</h3>
                <p>The amount of option contracts traded in the last 24h sorted by expiration date.</p>
            </div>
        </div>
    );
};

export default VolumeByExpirationChart;
