import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';

const DeltaAdjustedOpenInterestChart = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [expiration, setExpiration] = useState('All Expirations');

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

	const {
		data,
		loading: dataLoading,
		error: dataError,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/delta-adjusted-open-interest-by-strike/${asset.toLowerCase()}/${
			expiration === 'All Expirations' ? 'all' : expiration
		}`,
		{ exchange },
		optionsCache,
		CACHE_TTL.SHORT,
	);

	const expirations = ['All Expirations', ...(Array.isArray(expirationsData) ? expirationsData : [])];
	const chartData = Array.isArray(data) ? data : [];
	const loading = expirationsLoading || dataLoading;
	const error = expirationsError || dataError;

	const chartOptions = useMemo(() => {
		if (loading || chartData.length === 0) return null;

		const strikePrices = chartData.map((d) => d.strike);
		const deltaAdjustedPuts = chartData.map((d) => -Math.abs(parseFloat(d.puts_delta_adjusted).toFixed(2)));
		const deltaAdjustedCalls = chartData.map((d) => Math.abs(parseFloat(d.calls_delta_adjusted).toFixed(2)));

		return {
			backgroundColor: '#151518',
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow',
				},
				formatter: function (params) {
					const tooltipDate = params[0].axisValue;
					let result = `<b>${tooltipDate}</b><br/>`;
					params.forEach((item) => {
						result += `<span style="color:${item.color};">●</span> ${item.seriesName}: ${parseFloat(item.value).toFixed(
							2,
						)}<br/>`;
					});
					return result;
				},
				backgroundColor: 'rgba(255, 255, 255, 0.8)',
				textStyle: {
					color: '#000',
					fontFamily: 'JetBrains Mono',
				},
			},
			legend: {
				data: ['Puts', 'Calls'],
				textStyle: {
					color: '#FFFFFF',
					fontFamily: 'JetBrains Mono',
				},
				top: 10,
			},
			xAxis: {
				type: 'category',
				data: strikePrices,
				axisLine: { lineStyle: { color: '#A9A9A9' } },
				axisLabel: {
					color: '#7E838D',
					rotate: 45,
					fontFamily: 'JetBrains Mono',
				},
			},
			yAxis: {
				type: 'value',
				name: 'Delta Adjusted Open Interest',
				axisLine: { lineStyle: { color: '#A9A9A9' } },
				axisLabel: {
					color: '#7E838D',
					fontFamily: 'JetBrains Mono',
				},
				splitLine: { lineStyle: { color: '#393E47' } },
			},
			series: [
				{
					name: 'Puts',
					type: 'bar',
					data: deltaAdjustedPuts,
					itemStyle: { color: '#ff3e3e' },
					barWidth: '30%',
				},
				{
					name: 'Calls',
					type: 'bar',
					data: deltaAdjustedCalls,
					itemStyle: { color: '#00cc96' },
					barWidth: '30%',
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

	const handleDownload = useChartExport(chartInstanceRef, asset, `delta_adjusted_open_interest_${asset}.png`);

	const tooltipContent = `
		<div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
			<div style="margin-bottom: 10px;">
				<b>Delta-Adjusted Open Interest</b> shows the potential</br> market impact of options positions when dealers need</br> to maintain delta neutrality.
			</div>

			<div style="margin-left: 10px; margin-bottom: 10px;">
				How to read:
				<div style="margin-top: 5px;">• Green bars - Call options (positive delta exposure)</div>
				<div>• Red bars - Put options (negative delta exposure)</div>
				<div>• Bar height - Number of contracts × Delta value</div>
				<div style="margin-bottom: 5px;">• X-axis shows strike prices in ascending order</div>
			</div>

			<div style="margin-left: 10px; margin-bottom: 10px;">
				Key concepts:
				<div style="margin-top: 5px;">• Delta measures option's sensitivity to price changes</div>
				<div>• Positive values indicate potential buying pressure</div>
				<div style="margin-bottom: 5px;">• Negative values indicate potential selling pressure</div>
			</div>

			<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
				<b>Trading Applications:</b>
				<div style="margin-top: 5px;">• Reveals potential dealer hedging flows</div>
				<div>• Shows market maker positioning pressure</div>
				<div style="margin-bottom: 5px;">• Helps predict price movement catalysts</div>
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
			key="expiration"
			value={expiration}
			onChange={(e) => setExpiration(e.target.value)}
			options={expirations.map((exp) => ({ value: exp, label: exp }))}
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
			title="Delta Adjusted Open Interest By Strike"
			icon="👻"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="deltaCamera"
			tooltipId="deltaInfo"
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

export default DeltaAdjustedOpenInterestChart;
