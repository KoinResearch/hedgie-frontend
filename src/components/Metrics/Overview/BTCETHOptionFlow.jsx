import React, { useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { CACHE_TTL, optionsCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import { TIME_RANGE_OPTIONS, ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../constants/chartOptions.js';
import './BTCETHOptionFlow.css';
import Skeleton from '../../Skeleton/Skeleton.jsx';

const BTCETHOptionFlow = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [timeRange, setTimeRange] = useState('24h');

	const {
		data: metricsData,
		loading,
		error,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/metrics/${asset.toLowerCase()}`,
		{ timeRange, exchange },
		optionsCache,
		CACHE_TTL.SHORT,
	);

	const metrics = metricsData || {
		Call_Buys: 0,
		Call_Sells: 0,
		Put_Buys: 0,
		Put_Sells: 0,
		Call_Buys_Percent: '0.00',
		Call_Sells_Percent: '0.00',
		Put_Buys_Percent: '0.00',
		Put_Sells_Percent: '0.00',
	};

	const chartOptions = useMemo(() => {
		return {
			tooltip: {
				trigger: 'item',
				formatter: '{b}: {c} ({d}%)',
				textStyle: {
					fontFamily: 'JetBrains Mono',
				},
			},
			series: [
				{
					name: 'Option Flow',
					type: 'pie',
					radius: ['40%', '70%'],
					center: ['50%', '50%'],
					avoidLabelOverlap: false,
					label: {
						show: true,
						position: 'inside',
						formatter: (params) => `${Math.round(params.percent)}%`,
						fontSize: 12,
						color: '#fff',
						fontFamily: 'JetBrains Mono',
					},
					itemStyle: {
						borderRadius: 10,
						borderColor: '#151518',
						borderWidth: 4,
					},
					data: [
						{
							value: metrics.Call_Sells,
							name: 'Call Sells',
							itemStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
									{ offset: 0, color: '#0D866C' },
									{ offset: 1, color: '#5DDC86' },
								]),
							},
						},
						{
							value: metrics.Put_Sells,
							name: 'Put Sells',
							itemStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
									{ offset: 0, color: '#DE495A' },
									{ offset: 1, color: '#881C72' },
								]),
							},
						},
						{
							value: metrics.Put_Buys,
							name: 'Put Buys',
							itemStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
									{ offset: 0, color: '#7A59C4' },
									{ offset: 1, color: '#9B21A2' },
								]),
							},
						},
						{
							value: metrics.Call_Buys,
							name: 'Call Buys',
							itemStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
									{ offset: 0, color: '#9D78F1' },
									{ offset: 1, color: '#362D4B' },
								]),
							},
						},
					],
				},
			],
		};
	}, [metrics]);

	const { chartRef: chartRefDesktop, chartInstanceRef: chartInstanceRefDesktop } = useChart(chartOptions, [
		chartOptions,
	]);
	const { chartRef: chartRefMobile, chartInstanceRef: chartInstanceRefMobile } = useChart(chartOptions, [chartOptions]);

	const handleDownload = useChartExport(chartInstanceRefDesktop, asset, `option_flow_chart_with_metrics_${asset}.png`);

	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                This chart shows the distribution of options trading activity for ${asset}:
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                <div style="margin-bottom: 5px;">• <b>Call Buys (${
									metrics.Call_Buys_Percent
								}%)</b>: Buying the right to purchase - bullish sentiment, expecting price increase</div>
                <div style="margin-bottom: 5px;">• <b>Call Sells (${
									metrics.Call_Sells_Percent
								}%)</b>: Selling the right to purchase - neutral/bearish sentiment or premium collection</div>
                <div style="margin-bottom: 5px;">• <b>Put Buys (${
									metrics.Put_Buys_Percent
								}%)</b>: Buying the right to sell - bearish sentiment or position hedging</div>
                <div style="margin-bottom: 5px;">• <b>Put Sells (${
									metrics.Put_Sells_Percent
								}%)</b>: Selling the right to sell - neutral/bullish sentiment or premium collection</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                Volume ratio: Call (<b>${(
									Number(metrics.Call_Buys_Percent) + Number(metrics.Call_Sells_Percent)
								).toFixed(2)}%</b>)
                to Put (<b>${(Number(metrics.Put_Buys_Percent) + Number(metrics.Put_Sells_Percent)).toFixed(
									2,
								)}%</b>)<br/>
                ${
									(Number(metrics.Call_Buys_Percent) + Number(metrics.Call_Sells_Percent)).toFixed(2) >
									(Number(metrics.Put_Buys_Percent) + Number(metrics.Put_Sells_Percent)).toFixed(2)
										? 'Dominance of Call options indicates prevailing bullish sentiment and expectations of price increase.'
										: 'Dominance of Put options indicates prevailing bearish sentiment and expectations of price decrease.'
								}
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

	const assetSymbol = asset === 'BTC' ? 'BTC' : 'ETH';

	const renderChart = (chartRef, isMobile = false) => {
		const chartSize = isMobile ? '294px' : '490px';
		const chartWrapperClass = isMobile
			? 'btceth-option-flow__chart-wrapper--mobile'
			: 'btceth-option-flow__chart-wrapper--desktop';
		const loadingClass = isMobile ? 'btceth-option-flow__loading--mobile' : 'btceth-option-flow__loading--desktop';
		const errorClass = isMobile ? 'btceth-option-flow__error--mobile' : 'btceth-option-flow__error--desktop';
		const noDataClass = isMobile ? 'btceth-option-flow__no-data--mobile' : 'btceth-option-flow__no-data--desktop';

		return (
			<div className="btceth-option-flow__graph">
				{loading && (
					<Skeleton />
				)}

				{!loading && error && (
					<div className={`btceth-option-flow__error ${errorClass}`}>
						<p>Error loading data: {error}</p>
					</div>
				)}

				{!loading && !error && (!metrics || Object.keys(metrics).length === 0) && (
					<div className={`btceth-option-flow__no-data ${noDataClass}`}>
						<p>No data available</p>
					</div>
				)}

				{!loading && !error && metrics && Object.keys(metrics).length > 0 && (
					<div className={`btceth-option-flow__chart-wrapper ${chartWrapperClass}`}>
						<div
							ref={chartRef}
							style={{ width: chartSize, height: chartSize }}
						></div>
					</div>
				)}
			</div>
		);
	};

	return (
		<FlowOptionBase
			title="Options"
			icon="💸"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="camera"
			tooltipId="optionData"
		>
			<div className="flow-option__chart-container-mobile">{renderChart(chartRefMobile, true)}</div>

			<div className="flow-option__content">
				<div className="metrics-option metrics-option--call">
					<div className="metric-option metric-option--call-buys">
						<p className="metric-option__label">Call Buys</p>
						<div className="metric-option__variable">
							<p className="metric-option__value">
								{assetSymbol} {metrics.Call_Buys}
							</p>
							<p className="metric-option__percentage"> {metrics.Call_Buys_Percent}% </p>
						</div>
					</div>

					<div className="metric-option metric-option--put-buys">
						<p className="metric-option__label">Put Buys</p>
						<div className="metric-option__variable">
							<p className="metric-option__value">
								{assetSymbol} {metrics.Put_Buys}
							</p>
							<p className="metric-option__percentage"> {metrics.Put_Buys_Percent}% </p>
						</div>
					</div>
				</div>

				<div className="flow-option__chart-container-desktop">{renderChart(chartRefDesktop, false)}</div>

				<div className="metrics-option metrics-option--put">
					<div className="metric-option metric-option--call-sells">
						<p className="metric-option__label">Call Sells</p>
						<div className="metric-option__variable">
							<p className="metric-option__value">
								{assetSymbol} {metrics.Call_Sells}
							</p>
							<p className="metric-option__percentage"> {metrics.Call_Sells_Percent}% </p>
						</div>
					</div>

					<div className="metric-option metric-option--put-sells">
						<p className="metric-option__label">Put Sells</p>
						<div className="metric-option__variable">
							<p className="metric-option__value">
								{assetSymbol} {metrics.Put_Sells}
							</p>
							<p className="metric-option__percentage"> {metrics.Put_Sells_Percent}% </p>
						</div>
					</div>
				</div>
			</div>
		</FlowOptionBase>
	);
};

export default BTCETHOptionFlow;
