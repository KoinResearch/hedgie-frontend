import React from 'react';
import './ChartContainer.css';

const ChartContainer = ({
	loading,
	error,
	data,
	chartRef,
	height = '490px',
	noDataMessage = 'No data available',
	errorMessage = 'Error loading data',
}) => {
	return (
		<div className="flow-option__graph">
			{loading && (
				<div className="loading">
					<div className="loading__spinner"></div>
				</div>
			)}

			{!loading && error && (
				<div className="error">
					<p>
						{errorMessage}: {error}
					</p>
				</div>
			)}

			{!loading && !error && (!data || (Array.isArray(data) && data.length === 0)) && (
				<div className="no-data">
					<p>{noDataMessage}</p>
				</div>
			)}

			{!loading && !error && data && (Array.isArray(data) ? data.length > 0 : true) && (
				<div className="chart-wrapper">
					<div
						ref={chartRef}
						style={{ width: '100%', height }}
					></div>
				</div>
			)}
		</div>
	);
};

export default ChartContainer;
