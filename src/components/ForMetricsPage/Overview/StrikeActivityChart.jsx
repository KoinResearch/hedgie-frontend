import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { TIME_RANGE_OPTIONS, ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../constants/chartOptions.js';

const StrikeActivityChart = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [expiration, setExpiration] = useState('All Expirations');
	const [timeRange, setTimeRange] = useState('24h');

	// Get expirations list
	const {
		data: expirationsData,
		loading: expirationsLoading,
		error: expirationsError,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`,
		null,
		expirationCache,
		CACHE_TTL.LONG,
	);

	const expirations = ['All Expirations', ...(Array.isArray(expirationsData) ? expirationsData : [])];

	// Get strike activity data
	const {
		data: strikeData,
		loading: strikeLoading,
		error: strikeError,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/metrics/strike-activity/${asset.toLowerCase()}`,
		{ expiration, timeRange, exchange },
		optionsCache,
		CACHE_TTL.MEDIUM,
	);

	const data = Array.isArray(strikeData) ? strikeData : [];
	const loading = expirationsLoading || strikeLoading;
	const error = expirationsError || strikeError;

	// Chart options
	const chartOptions = useMemo(() => {
		if (data.length === 0) return null;

		let callData = data.filter((d) => d.option_type === 'C');
		let putData = data.filter((d) => d.option_type === 'P');

		callData = callData.sort((a, b) => a.strike_price - b.strike_price);
		putData = putData.sort((a, b) => a.strike_price - b.strike_price);

		const strikePrices = callData.map((d) => d.strike_price);
		const callTradeCounts = callData.map((d) => d.trade_count);
		const putTradeCounts = putData.map((d) => d.trade_count);

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
				data: ['Calls', 'Puts'],
				textStyle: {
					color: '#B8B8B8',
					fontFamily: 'JetBrains Mono',
				},
				top: 10,
			},
			xAxis: {
				type: 'category',
				data: strikePrices,
				axisLine: {
					lineStyle: { color: '#A9A9A9' },
				},
				axisLabel: {
					color: '#7E838D',
					rotate: 45,
					interval: 0,
					fontFamily: 'JetBrains Mono',
				},
			},
			yAxis: {
				type: 'value',
				name: 'Number of Trades',
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
					name: 'Calls',
					type: 'bar',
					data: callTradeCounts,
					barWidth: '30%',
					itemStyle: {
						color: 'rgba(39,174,96, 0.8)',
					},
				},
				{
					name: 'Puts',
					type: 'bar',
					data: putTradeCounts,
					barWidth: '30%',
					itemStyle: {
						color: 'rgba(231,76,60, 0.8)',
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
	}, [data]);

	// Chart hook
	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	// Export hook
	const handleDownload = useChartExport(chartInstanceRef, asset, `strike_activity_${asset}.png`);

	// Tooltip content
	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Volume By Strike Price</b> visualizes the distribution of option</br> trading activity across different strike prices, separated</br> into Calls and Puts.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• X-axis shows strike prices in ascending order</div>
                <div>• Green bars represent Call option activity</div>
                <div>• Red bars represent Put option activity</div>
                <div style="margin-bottom: 5px;">• Bar height shows number of trades at each strike</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Applications:</b>
                <div style="margin-top: 5px;">• Identifies most active strike prices</div>
                <div>• Shows market sentiment at different price levels</div>
                <div style="margin-bottom: 5px;">• Helps spot potential support/resistance zones</div>
            </div>
        </div>
    `;

	// Expiration options
	const expirationOptions = expirations.map((exp) => ({
		value: exp,
		label: exp,
	}));

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
			key="expiration"
			value={expiration}
			onChange={(e) => setExpiration(e.target.value)}
			options={expirationOptions}
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
			title="Volume By Strike Price"
			icon="📈"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="cameraStr"
			tooltipId="strikeInfo"
		>
			<ChartContainer
				loading={loading}
				error={error}
				data={data}
				chartRef={chartRef}
			/>
		</FlowOptionBase>
	);
};

export default StrikeActivityChart;
