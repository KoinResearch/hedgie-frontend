import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './FlowMetrics.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const FlowMetrics = ({ putCallRatio = 0, totalPuts = 0, totalCalls = 0, putsPercentage = 0, callsPercentage = 0 }) => {
	const putCallData = {
		labels: ['Put', 'Call'],
		datasets: [
			{
				data: [putCallRatio, 1 - putCallRatio],
				backgroundColor: ['#ff3e3e', '#00cc96'],
				borderWidth: 0,
			},
		],
	};

	const totalCallsData = {
		labels: ['Calls %', ''],
		datasets: [
			{
				data: [callsPercentage, 100 - callsPercentage],
				backgroundColor: ['#00cc96', '#333'],
				borderWidth: 0,
			},
		],
	};

	const totalPutsData = {
		labels: ['Puts %', ''],
		datasets: [
			{
				data: [putsPercentage, 100 - putsPercentage],
				backgroundColor: ['#ff3e3e', '#333'],
				borderWidth: 0,
			},
		],
	};

	const options = {
		cutout: '70%',
		plugins: {
			tooltip: {
				enabled: false,
			},
			legend: {
				display: false,
			},
		},
	};

	return (
		<>
			<div className="flow__metrics-desktop">
				<div className="flow__metric">
					<div className="flow__metric-data">
						<span className="flow__metric-label">Put to Call Ratio</span>
						<span className="flow__metric-value">
							{typeof putCallRatio === 'number' && !isNaN(putCallRatio) ? putCallRatio.toFixed(2) : '0.00'}
						</span>
					</div>
					<Doughnut
						data={putCallData}
						options={options}
						style={{ maxWidth: '70px', maxHeight: '70px' }}
					/>
				</div>

				<div className="flow__dedicate" />

				<div className="flow__metric">
					<div className="flow__metric-data">
						<span className="flow__metric-label">Total Calls</span>
						<span className="flow__metric-value">
							{typeof totalCalls === 'string' && !isNaN(parseFloat(totalCalls))
								? parseFloat(totalCalls).toLocaleString(undefined, { minimumFractionDigits: 0 })
								: '0'}
						</span>
					</div>
					<Doughnut
						data={totalCallsData}
						options={options}
						style={{ maxWidth: '70px', maxHeight: '70px' }}
					/>
				</div>

				<div className="flow__dedicate" />

				<div className="flow__metric">
					<div className="flow__metric-data">
						<span className="flow__metric-label">Total Puts</span>
						<span
							className="flow__metric-value"
							style={{ marginBottom: '24px' }}
						>
							{typeof totalPuts === 'string' && !isNaN(parseFloat(totalPuts))
								? parseFloat(totalPuts).toLocaleString(undefined, { minimumFractionDigits: 0 })
								: '0'}
						</span>
					</div>
					<Doughnut
						data={totalPutsData}
						options={options}
						style={{ maxWidth: '70px', maxHeight: '70px' }}
					/>
				</div>
			</div>

			<div className="flow__metrics-mobile">
				<div className="flow__metric-mobile">
					<div className="flow__metric-data-mobile">
						<div className="flow__metric-data-mobile-container">
							<Doughnut
								data={putCallData}
								options={options}
								style={{ maxWidth: '70px', maxHeight: '70px' }}
							/>
							<span className="flow__metric-label-mobile">Put to Call<br/> Ratio</span>
						</div>
						<span className="flow__metric-value-mobile">
							{typeof putCallRatio === 'number' && !isNaN(putCallRatio) ? putCallRatio.toFixed(2) : '0.00'}
						</span>
					</div>
				</div>

				<div className="flow__metric-mobile">
					<div className="flow__metric-data-mobile">
						<div className="flow__metric-data-mobile-container">
							<Doughnut
								data={totalCallsData}
								options={options}
								style={{ maxWidth: '70px', maxHeight: '70px' }}
							/>
							<span className="flow__metric-label-mobile">Total<br/> Calls</span>
						</div>
						<span className="flow__metric-value-mobile">
							{typeof totalCalls === 'string' && !isNaN(parseFloat(totalCalls))
								? parseFloat(totalCalls).toLocaleString(undefined, { minimumFractionDigits: 0 })
								: '0'}
						</span>
					</div>
				</div>

				<div className="flow__metric-mobile">
					<div className="flow__metric-data-mobile">
						<div className="flow__metric-data-mobile-container">
							<Doughnut
								data={totalPutsData}
								options={options}
								style={{ maxWidth: '70px', maxHeight: '70px' }}
							/>
							<span className="flow__metric-label-mobile">Total Puts</span>
						</div>
						<span
							className="flow__metric-value-mobile"
						>
							{typeof totalPuts === 'string' && !isNaN(parseFloat(totalPuts))
								? parseFloat(totalPuts).toLocaleString(undefined, { minimumFractionDigits: 0 })
								: '0'}
						</span>
					</div>
				</div>
			</div>
		</>
	);
};

export default FlowMetrics;
