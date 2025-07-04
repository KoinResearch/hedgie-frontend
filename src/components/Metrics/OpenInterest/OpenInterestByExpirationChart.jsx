import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, strikeCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';

const OpenInterestByExpirationChart = () => {
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
		`${import.meta.env.VITE_API_URL}/api/open-interest/open-interest-by-expiration/${asset.toLowerCase()}/${
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
		if (loading || Object.keys(data).length === 0) return null;

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
	}, [data, loading]);

	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	const handleDownload = useChartExport(chartInstanceRef, asset, `open_interest_by_expiration_${asset}.png`);

	const tooltipContent = `
		<div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
			<div style="margin-bottom: 10px;">
				<b>Open Interest By Expiration</b> displays both the number</br> of contracts and their monetary value across different</br> expiration dates.
			</div>

			<div style="margin-left: 10px; margin-bottom: 10px;">
				How to read:
				<div style="margin-top: 5px;">• Bar chart shows number of open contracts (left axis)</div>
				<div>• Red bars - Put options OTM (Out of The Money)</div>
				<div>• Green bars - Call options OTM (Out of The Money)</div>
				<div>• Red dotted line - Put options market value</div>
				<div>• Green dotted line - Call options market value</div>
				<div style="margin-bottom: 5px;">• Yellow dots - Total notional value (right axis)</div>
			</div>

			<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
				<b>Trading Insights:</b>
				<div style="margin-top: 5px;">• Shows concentration of market exposure by date</div>
				<div>• Helps identify significant option expiration dates</div>
				<div style="margin-bottom: 5px;">• Reveals potential market pressure points</div>
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
			key="strike"
			value={strike}
			onChange={(e) => setStrike(e.target.value || 'all')}
			options={strikes.map((s) => ({ value: s, label: s }))}
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
				data={Object.keys(data).length > 0 ? data : null}
				chartRef={chartRef}
			/>
		</FlowOptionBase>
	);
};

export default OpenInterestByExpirationChart;
