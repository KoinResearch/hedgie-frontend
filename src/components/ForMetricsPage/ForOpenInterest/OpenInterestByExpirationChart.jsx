import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './OpenInterestByExpirationChart.css'; // Подключение CSS

const OpenInterestByExpirationChart = () => {
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

    // Получение данных об открытых интересах по экспирации
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Используем "all" для запроса всех страйков
                const strikeParam = strike === 'All Strikes' ? 'all' : strike;
                console.log(`Fetching open interest data for ${asset} with strike ${strikeParam}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/open-interest-by-expiration/${asset.toLowerCase()}/${strikeParam}`);
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
    const putsMarketValue = data.map(d => d.puts_market_value);
    const callsMarketValue = data.map(d => d.calls_market_value);
    const notionalValue = data.map(d => d.notional_value);

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        Open Interest By Expiration
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
                        <select value={strike} onChange={(e) => setStrike(e.target.value || 'all')}>
                            {strikes.map((s) => (
                                <option key={s} value={s}>{s}</option>
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
                <div className="graph">
                    <Plot
                        data={[
                            {
                                x: expirationDates,
                                y: putsOtm,
                                type: 'bar',
                                name: 'Puts OTM',
                                marker: {
                                    color: '#ff3e3e', // Красный для Puts OTM
                                },
                                yaxis: 'y1',
                            },
                            {
                                x: expirationDates,
                                y: putsItm,
                                type: 'bar',
                                name: 'Puts ITM',
                                marker: {
                                    color: '#ff7f7f', // Светло-красный для Puts ITM
                                },
                                yaxis: 'y1',
                            },
                            {
                                x: expirationDates,
                                y: callsOtm,
                                type: 'bar',
                                name: 'Calls OTM',
                                marker: {
                                    color: '#00cc96', // Зелёный для Calls OTM
                                },
                                yaxis: 'y1',
                            },
                            {
                                x: expirationDates,
                                y: callsItm,
                                type: 'bar',
                                name: 'Calls ITM',
                                marker: {
                                    color: '#66ff99', // Светло-зелёный для Calls ITM
                                },
                                yaxis: 'y1',
                            },
                            {
                                x: expirationDates,
                                y: putsMarketValue,
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Puts Market Value [$]',
                                line: {
                                    color: '#ff3e3e', // Красный для рыночной стоимости Puts
                                    dash: 'dot',
                                    width: 2,
                                },
                                yaxis: 'y2',
                            },
                            {
                                x: expirationDates,
                                y: callsMarketValue,
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Calls Market Value [$]',
                                line: {
                                    color: '#00cc96', // Зелёный для рыночной стоимости Calls
                                    dash: 'dot',
                                    width: 2,
                                },
                                yaxis: 'y2',
                            },
                            {
                                x: expirationDates,
                                y: notionalValue,
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Notional Value [$]',
                                line: {
                                    color: '#333', // Тёмный для общей рыночной стоимости
                                    dash: 'dash',
                                    width: 2,
                                },
                                yaxis: 'y2',
                            },
                        ]}
                        layout={{
                            autosize: true,
                            xaxis: {
                                title: 'Expiration Date',
                                tickfont: {
                                    size: 12,
                                    color: '#FFFFFF',
                                },
                            },
                            yaxis: {
                                title: 'Contracts',
                                side: 'left',
                                showgrid: true,
                                zeroline: false,
                                tickfont: {
                                    size: 12,
                                    color: '#FFFFFF',
                                },
                            },
                            yaxis2: {
                                title: 'Market Value [$]',
                                overlaying: 'y',
                                side: 'right',
                                showgrid: false,
                                zeroline: false,
                                tickfont: {
                                    size: 12,
                                    color: '#FFFFFF',
                                },
                            },
                            barmode: 'group', // Группировка столбцов
                            legend: {
                                x: 0.01,
                                y: 1.1,
                                orientation: 'h',
                                font: {
                                    size: 12,
                                    color: '#FFFFFF',
                                },
                            },
                            paper_bgcolor: '#151518', // Тёмный фон
                            plot_bgcolor: '#151518', // Тёмный фон для графика
                            margin: {
                                l: 50,
                                r: 50, // Отступы для второй оси
                                b: 50,
                                t: 30,
                            },
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }} // График будет занимать весь контейнер
                    />
            </div>
        </div>
        </div>
    );
};

export default OpenInterestByExpirationChart;
