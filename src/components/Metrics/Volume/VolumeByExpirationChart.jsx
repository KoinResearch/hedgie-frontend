import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, strikeCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../constants/chartOptions.js';

const VolumeByExpirationChart = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [strike, setStrike] = useState('All Strikes');

	const {
		data: strikesData,
		loading: strikesLoading,
		error: strikesError,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/strikes/${asset.toLowerCase()}`,
		null,
		strikeCache,
		CACHE_TTL.LONG,
	);

	const {
		data: openInterestData,
		loading: dataLoading,
		error: dataError,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/volume/open-interest-by-expiration/${asset.toLowerCase()}/${
			strike === 'All Strikes' ? 'all' : strike
		}`,
		{ exchange },
		optionsCache,
		CACHE_TTL.SHORT,
	);

	const strikes = ['All Strikes', ...(Array.isArray(strikesData) ? strikesData : [])];
	const data = openInterestData || {};

	const loading = strikesLoading || dataLoading;
	const error = strikesError || dataError;

	const chartOptions = useMemo(() => {
		if (Object.keys(data).length === 0) return null;

		const expirationDates = Object.keys(data);
		const putsOtm = expirationDates.map((date) => parseFloat(data[date].puts_otm).toFixed(2));
		const callsOtm = expirationDates.map((date) => parseFloat(data[date].calls_otm).toFixed(2));
		const putsMarketValue = expirationDates.map((date) => parseFloat(data[date].puts_market_value).toFixed(2));
		const callsMarketValue = expirationDates.map((date) => parseFloat(data[date].calls_market_value).toFixed(2));
		const notionalValue = expirationDates.map((date) => parseFloat(data[date].notional_value).toFixed(2));

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
				data: ['Puts OTM', 'Calls OTM', 'Puts Market Value [$]', 'Calls Market Value [$]', 'Notional Value [$]'],
				textStyle: {
					color: '#B8B8B8',
					fontFamily: 'JetBrains Mono',
				},
				top: 10,
			},
			xAxis: {
				type: 'category',
				data: expirationDates,
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
					splitLine: { lineStyle: { color: '#151518' } },
					position: 'right',
				},
			],
			series: [
				{
					name: 'Puts OTM',
					type: 'bar',
					data: putsOtm,
					itemStyle: { color: '#ff3e3e' },
					barWidth: '25%',
				},
				{
					name: 'Calls OTM',
					type: 'bar',
					data: callsOtm,
					itemStyle: { color: '#00cc96' },
					barWidth: '25%',
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
				{
					name: 'Notional Value [$]',
					type: 'line',
					data: notionalValue,
					yAxisIndex: 1,
					lineStyle: {
						color: '#333',
						type: 'dashed',
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
	}, [data]);

	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	const handleDownload = useChartExport(chartInstanceRef, asset, `open_interest_chart_${asset}.png`);

	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Open Interest By Expiration (24h)</b> shows distribution</br> of options trading activity from the last 24 hours across</br> different expiration dates, including both volume and value.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                Chart components:
                <div style="margin-top: 5px;">• Bars show Out of The Money (OTM) contracts</div>
                <div>• Red bars - Put OTM contracts traded in last 24h</div>
                <div>• Green bars - Call OTM contracts traded in last 24h</div>
                <div>• Dotted lines show 24h market value in USD</div>
                <div style="margin-bottom: 5px;">• Yellow dots show total 24h notional value</div>
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                Value metrics (24h period):
                <div style="margin-top: 5px;">• Left axis - Number of contracts traded</div>
                <div>• Right axis - Current market value in USD</div>
                <div style="margin-bottom: 5px;">• Hover for detailed values per expiration</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Applications:</b>
                <div style="margin-top: 5px;">• Monitor daily options flow by expiration</div>
                <div>• Track 24h Put/Call distribution trends</div>
                <div style="margin-bottom: 5px;">• Analyze daily market positioning changes</div>
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
			key="strike"
			value={strike}
			onChange={(e) => setStrike(e.target.value || 'all')}
			options={strikes.map((s) => ({ value: s, label: s }))}
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
			title="Open Interest By Expiration"
			icon="🤟"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="interestCamera"
			tooltipId="interestInfo"
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

export default VolumeByExpirationChart;
