import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';

const OpenInterestChart = () => {
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
		data: interestData,
		loading: dataLoading,
		error: dataError,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/open-interest/${asset.toLowerCase()}/${
			expiration === 'All Expirations' ? 'all' : expiration
		}`,
		{ exchange },
		optionsCache,
		CACHE_TTL.SHORT,
	);

	const expirations = ['All Expirations', ...(Array.isArray(expirationsData) ? expirationsData : [])];
	const data = interestData || { Calls: 0, Puts: 0 };
	const loading = expirationsLoading || dataLoading;
	const error = expirationsError || dataError;

	const chartOptions = useMemo(() => {
		if (loading || (data.Calls === 0 && data.Puts === 0)) return null;

		const callsData = parseFloat(data.Calls.toFixed(2)) || 0;
		const putsData = parseFloat(data.Puts.toFixed(2)) || 0;

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
			xAxis: {
				type: 'value',
				name: 'Contracts',
				axisLine: { lineStyle: { color: '#A9A9A9' } },
				axisLabel: {
					color: '#7E838D',
					fontFamily: 'JetBrains Mono',
				},
				splitLine: { lineStyle: { color: '#393E47' } },
			},
			yAxis: {
				type: 'category',
				data: ['Calls', 'Puts'],
				axisLine: { lineStyle: { color: '#A9A9A9' } },
				axisLabel: {
					color: '#7E838D',
					fontFamily: 'JetBrains Mono',
				},
			},
			series: [
				{
					name: 'Open Interest',
					type: 'bar',
					data: [callsData, putsData],
					itemStyle: {
						color: (params) => (params.dataIndex === 0 ? '#00cc96' : '#ff3e3e'),
					},
					barWidth: '10%',
				},
			],
			grid: {
				left: '10%',
				right: '10%',
				bottom: '10%',
				top: '10%',
				containLabel: true,
			},
		};
	}, [data, loading]);

	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	const handleDownload = useChartExport(chartInstanceRef, asset, `open_interest_by_option_kind_${asset}.png`);

	const tooltipContent = `
		<div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
			<div style="margin-bottom: 10px;">
				<b>Open Interest By Option Type</b> shows the total number</br> of outstanding option contracts that are currently</br> held by traders.
			</div>

			<div style="margin-left: 10px; margin-bottom: 10px;">
				How to read:
				<div style="margin-top: 5px;">• Green bar shows total open Call option positions</div>
				<div>• Red bar shows total open Put option positions</div>
				<div>• Length represents number of active contracts</div>
				<div style="margin-bottom: 5px;">• Each contract represents underlying asset quantity</div>
			</div>

			<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
				<b>Trading Insights:</b>
				<div style="margin-top: 5px;">• Higher open interest indicates more market liquidity</div>
				<div>• Call/Put ratio shows market directional bias</div>
				<div style="margin-bottom: 5px;">• Useful for gauging market participation levels</div>
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
			title="Open Interest By Option Kind"
			icon="🦾"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="OpenCamera"
			tooltipId="openInfo"
		>
			<ChartContainer
				loading={loading}
				error={error}
				data={data.Calls > 0 || data.Puts > 0 ? data : null}
				chartRef={chartRef}
				height="290px"
			/>
		</FlowOptionBase>
	);
};

export default OpenInterestChart;
