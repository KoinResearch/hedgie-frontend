import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, strikeCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { TIME_RANGE_OPTIONS, ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../utils/constants.js';

const ExpirationActivityChartBlockTrades = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [strike, setStrike] = useState('all');
	const [timeRange, setTimeRange] = useState('24h');

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

	const activityUrl = `${import.meta.env.VITE_API_URL}/api/block-trades/expiration-activity/${asset.toLowerCase()}${
		strike !== 'all' ? `/${strike}` : ''
	}`;
	const {
		data: activityData,
		loading: activityLoading,
		error: activityError,
	} = useCachedApiCall(activityUrl, { timeRange, exchange }, optionsCache, CACHE_TTL.MEDIUM);

	const strikes = Array.isArray(strikesData) ? strikesData : [];
	const data = {
		calls: Array.isArray(activityData) ? activityData.filter((item) => item.option_type === 'call') : [],
		puts: Array.isArray(activityData) ? activityData.filter((item) => item.option_type === 'put') : [],
	};

	const loading = strikesLoading || activityLoading;
	const error = strikesError || activityError;

	const chartOptions = useMemo(() => {
		if (data.calls.length === 0 && data.puts.length === 0) return null;

		const expirationDates = [
			...new Set([...data.calls.map((d) => d.expiration_date), ...data.puts.map((d) => d.expiration_date)]),
		];

		const callCounts = expirationDates.map((date) => {
			const call = data.calls.find((d) => d.expiration_date === date);
			return call ? call.trade_count : 0;
		});

		const putCounts = expirationDates.map((date) => {
			const put = data.puts.find((d) => d.expiration_date === date);
			return put ? put.trade_count : 0;
		});

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
				data: expirationDates,
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
					data: callCounts,
					barWidth: '30%',
					itemStyle: {
						color: 'rgba(39,174,96, 0.8)',
					},
				},
				{
					name: 'Puts',
					type: 'bar',
					data: putCounts,
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

	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	const handleDownload = useChartExport(chartInstanceRef, asset, `expiration_activity_chart_${asset}.png`);

	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Volume By Expiration</b> displays the distribution of option</br> trading activity across different expiration dates,</br> separated into Calls and Puts.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• X-axis shows expiration dates chronologically</div>
                <div>• Green bars show Call options trading volume</div>
                <div>• Red bars show Put options trading volume</div>
                <div style="margin-bottom: 5px;">• Bar height represents number of contracts traded</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Applications:</b>
                <div style="margin-top: 5px;">• Shows which expiration dates are most liquid</div>
                <div>• Helps identify market's time-based expectations</div>
                <div style="margin-bottom: 5px;">• Reveals temporal distribution of trading activity</div>
            </div>
        </div>
    `;

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
			key="strike"
			value={strike}
			onChange={(e) => setStrike(e.target.value || 'all')}
			options={[{ value: 'all', label: 'All Strikes' }, ...strikes.map((s) => ({ value: s, label: s }))]}
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
			title="Block Trades by Expiration"
			icon="📉"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="cameraExp"
			tooltipId="expInfo"
		>
			<ChartContainer
				loading={loading}
				error={error}
				data={data.calls.length > 0 || data.puts.length > 0 ? data : null}
				chartRef={chartRef}
			/>
		</FlowOptionBase>
	);
};

export default ExpirationActivityChartBlockTrades;
