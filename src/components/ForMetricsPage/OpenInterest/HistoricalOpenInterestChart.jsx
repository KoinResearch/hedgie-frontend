import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { CACHE_TTL, optionsCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';

const HistoricalOpenInterestChart = () => {
	const [exchange, setExchange] = useState('DER');
	const [asset, setAsset] = useState('BTC');
	const [period, setPeriod] = useState('1d');

	const { data, loading, error } = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/historical-open-interest/${asset.toLowerCase()}/${period}`,
		{ exchange },
		optionsCache,
		CACHE_TTL.SHORT,
	);

	const chartData = Array.isArray(data) ? data : [];

	const chartOptions = useMemo(() => {
		if (loading || chartData.length === 0) return null;

		const timestamps = chartData.map((entry) => dayjs(entry.timestamp).format('YYYY-MM-DD HH:mm'));
		const totalContracts = chartData.map((entry) => Number(entry.total_contracts || 0).toFixed(2));
		const avgIndexPrices = chartData.map((entry) => Number(entry.avg_index_price || 0).toFixed(2));

		return {
			backgroundColor: '#151518',
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line',
					axis: 'x',
					label: {
						backgroundColor: '#FFFFFF',
						color: '#000000',
						fontFamily: 'JetBrains Mono',
					},
				},
				backgroundColor: 'rgba(255, 255, 255, 0.8)',
				textStyle: {
					color: '#000000',
					fontFamily: 'JetBrains Mono',
				},
				formatter: function (params) {
					let result = `<b>${params[0].axisValue}</b><br/>`;
					params.forEach((item) => {
						result += `<span style="color:${item.color};">●</span> ${item.seriesName}: ${parseFloat(item.value).toFixed(
							2,
						)}<br/>`;
					});
					return result;
				},
			},
			legend: {
				data: ['Total Contracts', 'Index Price'],
				textStyle: {
					color: '#B8B8B8',
					fontFamily: 'JetBrains Mono',
				},
				top: 10,
			},
			xAxis: {
				type: 'category',
				data: timestamps,
				axisLine: { lineStyle: { color: '#A9A9A9' } },
				axisLabel: {
					color: '#7E838D',
					fontFamily: 'JetBrains Mono',
				},
			},
			yAxis: [
				{
					type: 'log',
					name: 'Total Contracts',
					axisLine: { lineStyle: { color: '#7f7f7f' } },
					axisLabel: {
						color: '#7E838D',
						fontFamily: 'JetBrains Mono',
						formatter: function (value) {
							return value.toFixed(2);
						},
					},
					splitLine: { lineStyle: { color: '#393E47' } },
				},
				{
					type: 'value',
					name: 'Index Price',
					axisLine: { lineStyle: { color: '#7f7f7f' } },
					axisLabel: {
						color: '#7f7f7f',
						fontFamily: 'JetBrains Mono',
						formatter: function (value) {
							return value.toFixed(2);
						},
					},
					splitLine: { show: false },
					position: 'right',
				},
			],
			series: [
				{
					name: 'Total Contracts',
					type: 'line',
					data: totalContracts,
					smooth: true,
					lineStyle: { color: '#e74c3c', width: 2 },
					areaStyle: { color: '#e74c3c', opacity: 0.2 },
				},
				{
					name: 'Index Price',
					type: 'line',
					data: avgIndexPrices,
					smooth: true,
					yAxisIndex: 1,
					lineStyle: { color: '#7f7f7f', width: 2 },
				},
			],
			grid: {
				left: '5%',
				right: '5%',
				bottom: '10%',
				top: '15%',
				containLabel: true,
			},
		};
	}, [chartData, loading]);

	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	const handleDownload = useChartExport(chartInstanceRef, asset, `historical_open_interest_${asset}.png`);

	const tooltipContent = `
		<div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
			<div style="margin-bottom: 10px;">
				<b>Historical Open Interest Chart</b> shows the evolution</br> of total open contracts over time in relation to the</br> underlying asset price.
			</div>

			<div style="margin-left: 10px; margin-bottom: 10px;">
				How to read:
				<div style="margin-top: 5px;">• Red line - Total number of open contracts (left axis)</div>
				<div>• Green line - Price of the underlying asset (right axis)</div>
				<div>• X-axis shows time periods (selectable timeframes)</div>
				<div style="margin-bottom: 5px;">• Area shows the relationship between price and interest</div>
			</div>

			<div style="margin-left: 10px; margin-bottom: 10px;">
				Time periods available:
				<div style="margin-top: 5px;">• 1d: Last 24 hours data</div>
				<div>• 7d: Weekly trend analysis</div>
				<div style="margin-bottom: 5px;">• 1m: Monthly historical view</div>
			</div>

			<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
				<b>Trading Applications:</b>
				<div style="margin-top: 5px;">• Track changes in market participation</div>
				<div>• Identify trends in options activity</div>
				<div style="margin-bottom: 5px;">• Compare price movement with options interest</div>
			</div>
		</div>
	`;

	const controls = [
		<SelectControl
			key="asset"
			value={asset}
			onChange={(e) => setAsset(e.target.value)}
			options={[
				{ value: 'BTC', label: 'Bitcoin' },
				{ value: 'ETH', label: 'Ethereum' },
			]}
		/>,
		<SelectControl
			key="period"
			value={period}
			onChange={(e) => setPeriod(e.target.value)}
			options={[
				{ value: '1d', label: '1d' },
				{ value: '7d', label: '7d' },
				{ value: '1m', label: '1m' },
				{ value: 'all', label: 'All' },
			]}
		/>,
		<SelectControl
			key="exchange"
			value={exchange}
			onChange={(e) => setExchange(e.target.value)}
			options={[
				{ value: 'DER', label: 'Deribit' },
				{ value: 'OKX', label: 'OKX' },
			]}
		/>,
	];

	return (
		<FlowOptionBase
			title="Historical Open Interest Chart"
			icon="🤠"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="historyCamera"
			tooltipId="historyInfo"
		>
			<ChartContainer
				loading={loading}
				error={error}
				data={chartData}
				chartRef={chartRef}
			/>
		</FlowOptionBase>
	);
};

export default HistoricalOpenInterestChart;
