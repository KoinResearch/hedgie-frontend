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
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        Volume By Expiration
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
                            <option value="all">All Strikes</option>
                            {/* Устанавливаем 'all' для всех страйков */}
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
                        },
                        {
                            x: expirationDates,
                            y: putsItm,
                            type: 'bar',
                            name: 'Puts ITM',
                            marker: {
                                color: '#ff7f7f', // Светло-красный для Puts ITM
                            },
                        },
                        {
                            x: expirationDates,
                            y: callsOtm,
                            type: 'bar',
                            name: 'Calls OTM',
                            marker: {
                                color: '#00cc96', // Зелёный для Calls OTM
                            },
                        },
                        {
                            x: expirationDates,
                            y: callsItm,
                            type: 'bar',
                            name: 'Calls ITM',
                            marker: {
                                color: '#66ff99', // Светло-зелёный для Calls ITM
                            },
                        },
                    ]}
                    layout={{
                        autosize: true,
                        xaxis: {
                            title: 'Expiration Date',
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF', // Белый цвет подписей оси X
                            },
                        },
                        yaxis: {
                            title: 'Volume',
                            side: 'left',
                            tickfont: {
                                size: 12,
                                color: '#FFFFFF', // Белый цвет подписей оси Y
                            },
                            showgrid: true, // Включаем сетку
                            gridcolor: '#393E47', // Цвет сетки
                            zeroline: false, // Убираем нулевую линию
                        },
                        barmode: 'group', // Группируем столбцы
                        legend: {
                            x: 0.01,
                            y: 1.1,
                            orientation: 'h', // Горизонтальная легенда
                            font: {
                                size: 12,
                                color: '#FFFFFF', // Цвет текста в легенде
                            },
                        },
                        margin: {
                            l: 50,
                            r: 50,
                            b: 50,
                            t: 30,
                        },
                        paper_bgcolor: '#151518', // Тёмный фон графика
                        plot_bgcolor: '#151518', // Тёмный фон области построения
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }} // График будет занимать весь контейнер
                />
            </div>
        </div>
        </div>

    );
};

export default VolumeByExpirationChart;
