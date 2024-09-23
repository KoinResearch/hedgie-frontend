import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

// Функция для преобразования строки даты в объект Date
const convertToISODate = (dateStr) => {
    const year = `20${dateStr.slice(-2)}`; // Извлекаем последние две цифры года и добавляем "20" для полного года
    const monthStr = dateStr.slice(-5, -2).toUpperCase(); // Извлекаем три символа месяца
    let day = dateStr.slice(0, dateStr.length - 5); // Извлекаем оставшиеся символы как день

    const monthMap = {
        JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
        JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
    };

    const month = monthMap[monthStr];
    if (!month) {
        console.error(`Ошибка: не удалось найти месяц для строки: ${dateStr}`);
        return null; // Возвращаем null, если месяц не найден
    }

    // Добавляем ведущий ноль для дней, если день состоит из одной цифры
    if (day.length === 1) {
        day = `0${day}`;
    }

    const isoDate = `${year}-${month}-${day}`;
    return new Date(isoDate); // Преобразуем строку в объект Date
};

const MaxPainByExpirationBlockTrades = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [asset, setAsset] = useState('BTC'); // Валюта по умолчанию

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/max-pain-data?currency=${asset.toLowerCase()}`);

                // Проверяем, что данные содержат необходимые поля
                if (response.data && response.data.maxPainByExpiration) {
                    setData(response.data.maxPainByExpiration);
                } else {
                    console.warn('Нет доступных данных:', response.data);
                    setData(null);
                }
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при получении данных Max Pain:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [asset]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    if (!data) {
        return <div>Нет данных</div>;
    }

    // Извлекаем и сортируем даты экспирации
    let expirationDates = Object.keys(data);
    expirationDates = expirationDates.sort((a, b) => convertToISODate(a) - convertToISODate(b));

    // Извлекаем значения Max Pain
    const maxPainValues = expirationDates.map(exp => data[exp].maxPain);

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>
                        😡
                        Max pain by expiration
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
                </div>
                <div className="flow-option-dedicated"></div>
            </div>
            <div className="graph">
                <Plot
                    data={[
                        {
                            x: expirationDates,
                            y: maxPainValues,
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: {color: '#FF4136'}, // Красный цвет линии
                            line: {shape: 'spline', width: 2} // Сглаживание линии
                        },
                    ]}
                    layout={{
                        paper_bgcolor: '#151518',
                        plot_bgcolor: '#151518',
                        font: {
                            family: 'Arial, sans-serif',
                            size: 14,
                            color: '#FFFFFF'
                        },
                        xaxis: {
                            title: 'Expiration Dates',
                            gridcolor: '#393E47',
                            tickfont: {color: '#FFFFFF'},
                        },
                        yaxis: {
                            title: 'Max Pain Price [$]',
                            gridcolor: '#393E47',
                            tickfont: {color: '#FFFFFF'},
                        },
                        autosize: true,
                        margin: {
                            l: 40,
                            r: 10,
                            b: 40,
                            t: 40,
                            pad: 4
                        },
                    }}
                    useResizeHandler={true}
                    style={{width: '100%', height: '100%'}}
                />
            </div>
        </div>
    );
};

export default MaxPainByExpirationBlockTrades;
