import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../constants/chartOptions.js';

const VolumeByStrikePriceChart = () => {
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
		`${import.meta.env.VITE_API_URL}/api/volume/open-interest-by-strike/${asset.toLowerCase()}/${
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
		const puts = chartData.map((d) => parseFloat(d.puts).toFixed(2));
		const calls = chartData.map((d) => parseFloat(d.calls).toFixed(2));
		const putsMarketValue = chartData.map((d) => parseFloat(d.puts_market_value).toFixed(2));
		const callsMarketValue = chartData.map((d) => parseFloat(d.calls_market_value).toFixed(2));

		return {
			backgroundColor: '#151518',
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
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
			},
			legend: {
				data: ['Puts', 'Calls', 'Puts Market Value [$]', 'Calls Market Value [$]'],
				textStyle: {
					color: '#B8B8B8',
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
			yAxis: [
				{
					type: 'value',
					name: 'Contracts',
					axisLine: { lineStyle: { color: '#A9A9A9' } },
					axisLabel: {
						color: '#7E838D',
						fontFamily: 'JetBrains Mono',
					},
					splitLine: { lineStyle: { color: '#393E47' } },
				},
				{
					type: 'value',
					name: 'Market Value [$]',
					axisLine: { lineStyle: { color: '#A9A9A9' } },
					axisLabel: {
						color: '#7E838D',
						fontFamily: 'JetBrains Mono',
					},
					position: 'right',
					splitLine: { lineStyle: { color: '#393E47' } },
				},
			],
			series: [
				{
					name: 'Puts',
					type: 'bar',
					data: puts,
					itemStyle: { color: '#ff3e3e' },
					barWidth: '30%',
				},
				{
					name: 'Calls',
					type: 'bar',
					data: calls,
					itemStyle: { color: '#00cc96' },
					barWidth: '30%',
				},
				{
					name: 'Puts Market Value [$]',
					type: 'line',
					data: putsMarketValue,
					yAxisIndex: 1,
					lineStyle: {
						color: '#ff3e3e',
						type: 'dotted',
						width: 2,
					},
				},
				{
					name: 'Calls Market Value [$]',
					type: 'line',
					data: callsMarketValue,
					yAxisIndex: 1,
					lineStyle: {
						color: '#00cc96',
						type: 'dotted',
						width: 2,
					},
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

	const handleDownload = useChartExport(chartInstanceRef, asset, `open_interest_by_strike_${asset}.png`);

	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Open Interest By Strike Price (24h)</b> visualizes the</br> distribution of options trading activity from the last 24</br> hours across different strike prices.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                Chart elements:
                <div style="margin-top: 5px;">• Bar chart shows contracts traded in last 24h</div>
                <div>• Red bars - Put options volume</div>
                <div>• Green bars - Call options volume</div>
                <div>• Red dotted line - Put options market value</div>
                <div style="margin-bottom: 5px;">• Green dotted line - Call options market value</div>
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                Reading the axes:
                <div style="margin-top: 5px;">• Left axis - Number of contracts (24h volume)</div>
                <div>• Right axis - Market value in USD</div>
                <div>• Bottom axis - Strike prices</div>
                <div style="margin-bottom: 5px;">• Hover over bars for detailed values</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Insights:</b>
                <div style="margin-top: 5px;">• Popular strike prices show market expectations</div>
                <div>• Put/Call ratio per strike indicates local sentiment</div>
                <div style="margin-bottom: 5px;">• Volume clusters suggest key price levels</div>
            </div>
        </div>
    `;

	const controls = [
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
			options={expirations.map((exp) => ({ value: exp, label: exp }))}
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
			title="Open Interest By Strike Price"
			icon="😬"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="strikeCamera"
			tooltipId="strikeInfo"
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

export default VolumeByStrikePriceChart;
