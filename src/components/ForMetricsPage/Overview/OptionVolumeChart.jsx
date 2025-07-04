import React, { useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { CACHE_TTL, optionsCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { TIME_RANGE_OPTIONS, ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../constants/chartOptions.js';

const OptionVolumeChart = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [timeRange, setTimeRange] = useState('24h');

	// API call
	const { data, loading, error } = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/metrics/popular-options/${asset.toLowerCase()}`,
		{ timeRange, exchange },
		optionsCache,
		CACHE_TTL.MEDIUM,
	);

	const trades = Array.isArray(data) ? data : [];

	// Chart options
	const chartOptions = useMemo(() => {
		if (trades.length === 0) return null;

		const instrumentNames = trades.map((trade) => {
			return trade.instrument_name.split('-').slice(1).join('-');
		});
		const tradeCounts = trades.map((trade) => trade.trade_count);

		return {
			backgroundColor: '#151518',
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow',
				},
				backgroundColor: 'rgba(255, 255, 255, 0.8)',
				textStyle: {
					color: '#000',
					fontFamily: 'JetBrains Mono',
				},
			},
			legend: {
				data: ['Trade Counts'],
				textStyle: {
					color: '#B8B8B8',
					fontFamily: 'JetBrains Mono',
				},
				top: 10,
			},
			xAxis: {
				type: 'category',
				data: instrumentNames,
				axisLine: {
					lineStyle: { color: '#A9A9A9' },
				},
				axisLabel: {
					color: '#7E838D',
					rotate: -45,
					interval: 0,
					fontFamily: 'JetBrains Mono',
				},
			},
			yAxis: {
				type: 'value',
				name: 'Trade Counts',
				axisLine: {
					lineStyle: { color: '#A9A9A9' },
				},
				axisLabel: {
					color: '#7E838D',
					fontFamily: 'JetBrains Mono',
				},
				splitLine: {
					lineStyle: { color: '#393E47' },
				},
			},
			series: [
				{
					name: 'Trade Counts',
					type: 'bar',
					data: tradeCounts,
					barWidth: '30%',
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(51, 117, 249, 1)' },
							{ offset: 1, color: 'rgba(127, 167, 247, 1)' },
						]),
					},
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
	}, [trades]);

	// Chart hook
	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	// Export hook
	const handleDownload = useChartExport(chartInstanceRef, asset, `option_volume_${asset}.png`);

	// Tooltip content
	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Top Traded Options</b> shows the most actively traded options</br> contracts ranked by number of trades.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• Each bar represents a specific option contract</div>
                <div>• Format: DDMMYY-STRIKE-TYPE (P for Put, C for Call)</div>
                <div style="margin-bottom: 5px;">• Height shows number of trades executed</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Insights:</b>
                <div style="margin-top: 5px;">• High trade count indicates strong market interest</div>
                <div>• Popular strikes often become key price levels</div>
                <div style="margin-bottom: 5px;">• Helps identify most liquid option contracts</div>
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
			title="Top Traded Options"
			icon="🥶"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="cameraVol"
			tooltipId="optionChartInfo"
		>
			<ChartContainer
				loading={loading}
				error={error}
				data={trades}
				chartRef={chartRef}
			/>
		</FlowOptionBase>
	);
};

export default OptionVolumeChart;
