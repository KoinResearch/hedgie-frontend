import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Импортируем библиотеку для работы с Excel
import "./DataLabComponent.css"

const DataLabComponent = () => {
    const [dataType, setDataType] = useState('All BTC Trades');
    const [timeRange, setTimeRange] = useState('1d');
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsLoading(true);

            // Проверка доступности данных на сервере
            const checkResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/datalab/data-download/${encodeURIComponent(dataType)}/${timeRange}?checkOnly=true`, {
                method: 'GET',
            });

            if (!checkResponse.ok) {
                handleErrorResponse(checkResponse);
                return;
            }

            // Если данные доступны, получаем их с сервера
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/datalab/data-download/${encodeURIComponent(dataType)}/${timeRange}`, {
                method: 'GET',
            });

            if (!response.ok) {
                handleErrorResponse(response);
                return;
            }

            const data = await response.json();

            // Преобразование данных в формат Excel
            exportToExcel(data, `${dataType}_${timeRange}.xlsx`);
        } catch (error) {
            console.error('Error downloading data:', error);
            alert('An error occurred while downloading data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleErrorResponse = (response) => {
        if (response.status === 403) {
            alert('Access forbidden. Please check your permissions.');
        } else if (response.status === 204) {
            alert('No data available for the selected filters.');
        } else {
            alert(`Failed to download data: ${response.statusText}`);
        }
    };

    const exportToExcel = (data, fileName) => {
        // Преобразование данных в формат Excel
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        // Сохранение файла Excel
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div className="dataLabComponent">
            <h1 className="dataLab-title">DataLab</h1>
            <p className="dataLab-p">Select the type of data and time range to download:</p>
            <div className="dataLab-buttons">
                <div className="select-group">
                    <label>
                        Data Type
                        <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
                            <option value="All BTC Trades">All BTC Trades</option>
                            <option value="All ETH Trades">All ETH Trades</option>
                            <option value="BTC Block Trades">BTC Block Trades</option>
                            <option value="ETH Block Trades">ETH Block Trades</option>
                        </select>
                    </label>
                </div>
                <div className="select-group">
                    <label>
                        Time Range
                        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                            <option value="1d">1 Day</option>
                            <option value="2d">2 Days</option>
                            <option value="3d">3 Days</option>
                            <option value="4d">4 Days</option>
                            <option value="5d">5 Days</option>
                            <option value="10d">10 Days</option>
                            <option value="1m">1 Month</option>
                            <option value="1y">1 Year</option>
                        </select>
                    </label>
                </div>
            </div>
            <button
                className="download-button"
                onClick={handleDownload}
                disabled={isLoading}
            >
                {isLoading ? 'Downloading...' : 'Download Data'}
            </button>
        </div>
    );
};


export default DataLabComponent;
