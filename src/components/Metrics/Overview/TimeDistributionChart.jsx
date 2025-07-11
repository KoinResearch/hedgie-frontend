import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { TIME_RANGE_OPTIONS, ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../constants/chartOptions.js';

const TimeDistributionChart = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [timeRange, setTimeRange] = useState('24h');

	// API call
	const { data, loading, error } = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/metrics/time-distribution/${asset.toLowerCase()}`,
		{ timeRange, exchange },
		optionsCache,
		CACHE_TTL.SHORT,
	);

	const distributionData = Array.isArray(data) ? data : [];

	// Chart options
	const chartOptions = useMemo(() => {
		if (distributionData.length === 0) return null;

		const currentHour = new Date().getUTCHours();
		const hours = Array.from({ length: 24 }, (_, i) => `${(currentHour - i + 24) % 24}:00`).reverse();

		const callCounts = distributionData.map((hourData) =>
			hourData.calls.reduce((acc, trade) => acc + parseInt(trade.trade_count), 0),
		);
		const putCounts = distributionData.map((hourData) =>
			hourData.puts.reduce((acc, trade) => acc + parseInt(trade.trade_count), 0),
		);

		return {
			backgroundColor: '#151518',
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
				backgroundColor: 'rgba(255, 255, 255, 0.8)',
				textStyle: {
					color: '#000',
					fontFamily: 'JetBrains Mono',
				},
			},
			legend: {
				data: ['Calls', 'Puts'],
				textStyle: {
					color: '#B8B8B8',
					fontFamily: 'JetBrains Mono',
				},
				top: 10,
			},
			xAxis: {
				type: 'category',
				data: hours,
				axisLine: { lineStyle: { color: '#A9A9A9' } },
				axisLabel: {
					color: '#7E838D',
					rotate: 45,
					interval: 0,
					fontFamily: 'JetBrains Mono',
				},
			},
			yAxis: [
				{
					type: 'value',
					name: 'Number of Trades',
					axisLine: { lineStyle: { color: '#A9A9A9' } },
					axisLabel: {
						color: '#7E838D',
						fontFamily: 'JetBrains Mono',
					},
					splitLine: { lineStyle: { color: '#393E47' } },
				},
			],
			series: [
				{
					name: 'Calls',
					type: 'bar',
					data: callCounts,
					barWidth: '30%',
					itemStyle: { color: 'rgba(39,174,96, 0.8)' },
				},
				{
					name: 'Puts',
					type: 'bar',
					data: putCounts,
					barWidth: '30%',
					itemStyle: { color: 'rgba(231,76,60, 0.8)' },
				},
			],
			grid: {
				left: '5%',
				right: '5%',
				bottom: '5%',
				top: '10%',
				containLabel: true,
			},
		};
	}, [distributionData]);

	// Chart hook
	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	// Export hook
	const handleDownload = useChartExport(chartInstanceRef, asset, `time_distribution_${asset}.png`);

	// Tooltip content
	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Historical Volume (24h)</b> shows the hourly distribution</br> of options trading activity. Data can be aggregated from:</br> past 24 hours, last week, or last month.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• X-axis shows daily 24-hour cycle in hourly intervals</div>
                <div>• Green bars represent Call option trades</div>
                <div>• Red bars represent Put option trades</div>
                <div style="margin-bottom: 5px;">• Bar height shows average number of contracts per hour</div>
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                Time range options:
                <div style="margin-top: 5px;">• Past 24h: Shows raw hourly data</div>
                <div>• Last Week: Shows average hourly pattern over 7 days</div>
                <div style="margin-bottom: 5px;">• Last Month: Shows average hourly pattern over 30 days</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Insights:</b>
                <div style="margin-top: 5px;">• Identifies consistent peak trading hours</div>
                <div>• Shows reliable intraday patterns</div>
                <div style="margin-bottom: 5px;">• Helps optimize trade execution timing</div>
            </div>
        </div>
    `;

	// Controls
	const controls = [
		<SelectControl
			key="timeRange"
			value={timeRange}
			onChange={(e) => setTimeRange(e.target.value)}
			options={TIME_RANGE_OPTIONS}
		/>,
		<SelectControl
			key="asset"
			value={asset}
			onChange={(e) => setAsset(e.target.value)}
			options={ASSET_OPTIONS}
		/>,
		<SelectControl
			key="exchange"
			value={exchange}
			onChange={(e) => setExchange(e.target.value)}
			options={EXCHANGE_OPTIONS}
		/>,
	];

	return (
		<FlowOptionBase
			title="Historical Volume"
			icon="📦"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="camerDis"
			tooltipId="timeInfo"
		>
			<ChartContainer
				loading={loading}
				error={error}
				data={distributionData}
				chartRef={chartRef}
			/>
		</FlowOptionBase>
	);
};

export default TimeDistributionChart;
