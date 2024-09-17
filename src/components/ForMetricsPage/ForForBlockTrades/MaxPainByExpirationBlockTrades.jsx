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
        <div style={{ width: '100%', height: '100%' }}>
            <h2>Max Pain по датам экспирации для {asset}</h2>
            <div>
                <button onClick={() => setAsset('BTC')} className={asset === 'BTC' ? 'active' : ''}>
                    BTC
                </button>
                <button onClick={() => setAsset('ETH')} className={asset === 'ETH' ? 'active' : ''}>
                    ETH
                </button>
            </div>
            <div style={{ width: '100%', height: '500px' }}>
                <Plot
                    data={[
                        {
                            x: expirationDates, // Отсортированные даты экспирации на оси X
                            y: maxPainValues,   // Значения Max Pain на оси Y
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: { color: 'red' },
                        },
                    ]}
                    layout={{
                        title: `Max Pain для ${asset}`,
                        xaxis: { title: 'Даты экспирации' }, // Подпись оси X
                        yaxis: { title: 'Max Pain' }, // Подпись оси Y
                        autosize: true, // Автоматическая настройка размера
                    }}
                    useResizeHandler={true} // Автоматическое изменение размеров
                    style={{ width: '100%', height: '100%' }} // Задаем стиль графика
                />
            </div>
        </div>
    );
};

export default MaxPainByExpirationBlockTrades;
