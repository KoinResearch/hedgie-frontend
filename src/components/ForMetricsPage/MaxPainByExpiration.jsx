import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const MaxPainByExpiration = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [asset, setAsset] = useState('BTC');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/max-pain-data?currency=${asset.toLowerCase()}`);
                if (response.data && response.data.max_pain) {
                    setData(response.data);
                } else {
                    console.warn('No data available:', response.data);
                    setData(null);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching Max Pain data:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data || !data.intrinsic_values) {
        return <div>No data available</div>;
    }

    // Преобразование intrinsic_values в отдельные массивы для x и y значений
    const strikes = Object.keys(data.intrinsic_values).map(strike => parseFloat(strike));
    const intrinsicValues = Object.values(data.intrinsic_values).map(value => parseFloat(value));

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <h2>Max Pain By Expiration</h2>
            <div>
                <button onClick={() => setAsset('BTC')} className={asset === 'BTC' ? 'active' : ''}>
                    BTC
                </button>
                <button onClick={() => setAsset('ETH')} className={asset === 'ETH' ? 'active' : ''}>
                    ETH
                </button>
            </div>
            <div style={{ width: '100%', height: '500px' }}> {/* Контейнер с фиксированной высотой для демонстрации */}
                <Plot
                    data={[
                        {
                            x: strikes,
                            y: intrinsicValues,
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: { color: 'blue' },
                        },
                    ]}
                    layout={{
                        title: `Max Pain for ${asset}`,
                        xaxis: { title: 'Strike Prices' },
                        yaxis: { title: 'Intrinsic Values' },
                        autosize: true, // Автоматический размер
                    }}
                    useResizeHandler={true} // Адаптация к изменению размеров
                    style={{ width: '100%', height: '100%' }} // Адаптивные размеры
                />
            </div>
        </div>
    );
};

export default MaxPainByExpiration;
