import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { TIME_RANGE_OPTIONS, ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../constants/chartOptions.js';
import * as echarts from 'echarts';

const TopTradesByVolumeBlockTrades = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [timeRange, setTimeRange] = useState('24h');

	const { data, loading, error } = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/block-trades/option-volumes/${asset.toLowerCase()}`,
		{ timeRange, exchange },
		optionsCache,
		CACHE_TTL.MEDIUM,
	);

	const volumes = Array.isArray(data) ? data : [];

	const chartOptions = useMemo(() => {
		if (volumes.length === 0) return null;

		const instrumentNames = volumes.map((volume) => {
			return volume.instrument_name.split('-').slice(1).join('-');
		});
		const totalVolumes = volumes.map((volume) => volume.total_volume);

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
				data: ['Total Volume'],
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
				name: 'Total Volume (USD)',
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
					name: 'Total Volume',
					type: 'bar',
					data: totalVolumes,
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
	}, [volumes]);

	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	const handleDownload = useChartExport(chartInstanceRef, asset, `top_trades_by_volume_${asset}.png`);

	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Top Options by Volume</b> shows the most actively traded</br> option contracts measured in USD value.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• Each bar represents trading volume for a specific contract</div>
                <div>• Contract format: DDMMYY-STRIKE-TYPE (P/C)</div>
                <div style="margin-bottom: 5px;">• Bar height shows total transaction value in USD</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Insights:</b>
                <div style="margin-top: 5px;">• Large volume often indicates institutional activity</div>
                <div>• Helps identify most significant price levels</div>
                <div style="margin-bottom: 5px;">• Shows real market interest in specific strikes</div>
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
			key="exchange"
			value={exchange}
			onChange={(e) => setExchange(e.target.value)}
			options={EXCHANGE_OPTIONS}
		/>,
	];

	return (
		<FlowOptionBase
			title="Top Options by Volume"
			icon="🏆"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="cameraTop"
			tooltipId="optionTopInfo"
		>
			<ChartContainer
				loading={loading}
				error={error}
				data={volumes}
				chartRef={chartRef}
			/>
		</FlowOptionBase>
	);
};

export default TopTradesByVolumeBlockTrades;
