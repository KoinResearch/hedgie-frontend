import React, { useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { CACHE_TTL, optionsCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../constants/chartOptions.js';

const TopTradedOptionsChart = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [tradeType, setTradeType] = useState('simple');

	const { data, loading, error } = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/volume/popular-options/${asset.toLowerCase()}`,
		{ type: tradeType },
		optionsCache,
		CACHE_TTL.SHORT,
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
				axisPointer: { type: 'shadow' },
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
				axisLine: { lineStyle: { color: '#A9A9A9' } },
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
				axisLine: { lineStyle: { color: '#A9A9A9' } },
				axisLabel: {
					color: '#7E838D',
					fontFamily: 'JetBrains Mono',
				},
				splitLine: { lineStyle: { color: '#393E47' } },
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
	const handleDownload = useChartExport(chartInstanceRef, asset, `top_traded_options_${asset}.png`);

	// Tooltip content
	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Top Traded Options (24h)</b> ranks the most actively</br> traded option contracts over the last 24 hours, with the</br> ability to filter by trade type.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                Chart details:
                <div style="margin-top: 5px;">• Blue bars show number of trades per contract</div>
                <div>• X-axis format: DDMMYY-STRIKE-TYPE (P/C)</div>
                <div>• Y-axis shows trade count</div>
                <div style="margin-bottom: 5px;">• Sorted by highest to lowest trade volume</div>
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                Trade type filters:
                <div style="margin-top: 5px;">• Simple Trades: Regular market transactions</div>
                <div>• Block Trades: Large institutional trades</div>
                <div style="margin-bottom: 5px;">• Select filter in top menu to switch view</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Applications:</b>
                <div style="margin-top: 5px;">• Identify most liquid options</div>
                <div>• Track institutional activity via block trades</div>
                <div style="margin-bottom: 5px;">• Monitor market focus on specific strikes</div>
            </div>
        </div>
    `;

	// Controls
	const controls = [
		<SelectControl
			key="tradeType"
			value={tradeType}
			onChange={(e) => setTradeType(e.target.value)}
			options={[
				{ value: 'simple', label: 'Simple Trades' },
				{ value: 'block', label: 'Block Trades' },
			]}
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
			title="Top Traded Options - Past 24h"
			icon="🏆"
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

export default TopTradedOptionsChart;
