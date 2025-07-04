import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import SelectControl from '../components/SelectControl/SelectControl';
import './DataLab.css';

const DataLab = () => {
	const [dataType, setDataType] = useState('All BTC Trades');
	const [timeRange, setTimeRange] = useState('1d');
	const [isLoading, setIsLoading] = useState(false);

	const dataTypeOptions = [
		{ value: 'All BTC Trades', label: 'All BTC Trades' },
		{ value: 'All ETH Trades', label: 'All ETH Trades' },
		{ value: 'BTC Block Trades', label: 'BTC Block Trades' },
		{ value: 'ETH Block Trades', label: 'ETH Block Trades' },
	];

	const timeRangeOptions = [
		{ value: '1d', label: '1 Day' },
		{ value: '2d', label: '2 Days' },
		{ value: '3d', label: '3 Days' },
		{ value: '4d', label: '4 Days' },
		{ value: '5d', label: '5 Days' },
		{ value: '6d', label: '6 Days' },
		{ value: '7d', label: '7 Days' },
		{ value: '10d', label: '10 Days' },
		{ value: '1m', label: '1 Month' },
		{ value: '1y', label: '1 Year' },
	];

	const handleDownload = async () => {
		try {
			setIsLoading(true);

			const checkResponse = await fetch(
				`${import.meta.env.VITE_API_URL}/api/datalab/data-download/${encodeURIComponent(
					dataType,
				)}/${timeRange}?checkOnly=true`,
				{
					method: 'GET',
				},
			);

			if (!checkResponse.ok) {
				handleErrorResponse(checkResponse);
				return;
			}

			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/datalab/data-download/${encodeURIComponent(dataType)}/${timeRange}`,
				{
					method: 'GET',
				},
			);

			if (!response.ok) {
				handleErrorResponse(response);
				return;
			}

			const data = await response.json();

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
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
		XLSX.writeFile(workbook, fileName);
	};

	return (
		<div className="datalab">
			<div className="datalab__content">
				<h1 className="datalab__title">DataLab</h1>
				<p className="datalab__description">
					Select the type of data and time range to
					<br /> download:
				</p>
				<div className="datalab__controls">
					<label className="datalab__label">
						Data Type
						<SelectControl
							options={dataTypeOptions}
							value={dataType}
							onChange={(e) => setDataType(e.target.value)}
						/>
					</label>

					<label className="datalab__label">
						Time Range
						<SelectControl
							options={timeRangeOptions}
							value={timeRange}
							onChange={(e) => setTimeRange(e.target.value)}
						/>
					</label>
				</div>
				<button
					className="datalab__download-button"
					onClick={handleDownload}
					disabled={isLoading}
				>
					{isLoading ? 'Downloading...' : 'Download Data'}
				</button>
			</div>
		</div>
	);
};

export default DataLab;
