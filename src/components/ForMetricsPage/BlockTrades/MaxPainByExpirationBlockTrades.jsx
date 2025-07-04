import React, { useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { CACHE_TTL, optionsCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../ChartFlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { ASSET_OPTIONS } from '../../../constants/chartOptions.js';

const convertToISODate = (dateStr) => {
	const year = `20${dateStr.slice(-2)}`;
	const monthStr = dateStr.slice(-5, -2).toUpperCase();
	let day = dateStr.slice(0, dateStr.length - 5);

	const monthMap = {
		JAN: '01',
		FEB: '02',
		MAR: '03',
		APR: '04',
		MAY: '05',
		JUN: '06',
		JUL: '07',
		AUG: '08',
		SEP: '09',
		OCT: '10',
		NOV: '11',
		DEC: '12',
	};

	const month = monthMap[monthStr];
	if (!month) {
		console.error(`Ошибка: не удалось найти месяц для строки: ${dateStr}`);
		return null;
	}

	if (day.length === 1) {
		day = `0${day}`;
	}

	const isoDate = `${year}-${month}-${day}`;
	return new Date(isoDate);
};

const calculateNotionalValue = (intrinsicValues) => {
	return Object.values(intrinsicValues).reduce((acc, val) => acc + val, 0);
};

const getOptimalAxisSettings = (values, steps) => {
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const range = maxValue - minValue;
	const step = range / steps;

	const roundedStep = Math.ceil(step / 1000) * 1000;
	const optimalMin = Math.floor(minValue / roundedStep) * roundedStep;
	const optimalMax = Math.ceil(maxValue / roundedStep) * roundedStep;

	return { min: optimalMin, max: optimalMax, step: roundedStep };
};

const MaxPainByExpirationBlockTrades = () => {
	const [asset, setAsset] = useState('BTC');

	// API call
	const {
		data: responseData,
		loading,
		error,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/max-pain-data`,
		{ currency: asset.toLowerCase() },
		optionsCache,
		CACHE_TTL.MEDIUM,
	);

	const data = responseData?.maxPainByExpiration || null;

	// Chart options
	const chartOptions = useMemo(() => {
		if (!data) return null;

		let expirationDates = Object.keys(data);
		expirationDates = expirationDates.sort((a, b) => convertToISODate(a) - convertToISODate(b));

		const maxPainValues = expirationDates.map((exp) => parseFloat(data[exp].maxPain));
		const notionalValues = expirationDates.map((exp) => calculateNotionalValue(data[exp].intrinsicValues));

		const maxPainSettings = getOptimalAxisSettings(maxPainValues, 6);
		const notionalSettings = getOptimalAxisSettings(notionalValues, 4);

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
				data: ['Max Pain Price [$]', 'Notional Value'],
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
				splitLine: { show: false },
			},
			yAxis: [
				{
					type: 'value',
					name: 'Max Pain Price [$]',
					position: 'left',
					min: maxPainSettings.min,
					max: maxPainSettings.max,
					interval: maxPainSettings.step,
					axisLine: { lineStyle: { color: '#B8B8B8' } },
					axisLabel: {
						color: '#7E838D',
						formatter: (value) => value.toLocaleString(),
						fontFamily: 'JetBrains Mono',
					},
					splitLine: { lineStyle: { color: '#393E47' } },
				},
				{
					type: 'value',
					name: 'Notional Value',
					position: 'right',
					min: notionalSettings.min,
					max: notionalSettings.max,
					interval: notionalSettings.step,
					axisLine: { lineStyle: { color: '#B8B8B8' } },
					axisLabel: {
						color: '#A9A9A9',
						formatter: (value) => `${(value / 1e9).toFixed(1)}b`,
						fontFamily: 'JetBrains Mono',
					},
					splitLine: { show: false },
				},
			],
			series: [
				{
					name: 'Max Pain Price [$]',
					type: 'line',
					data: maxPainValues,
					smooth: true,
					lineStyle: {
						color: '#882A35',
						width: 2,
					},
					itemStyle: {
						color: '#882A35',
					},
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(255, 148, 160, 0.9)' },
							{ offset: 1, color: 'rgba(255, 148, 160, 0)' },
						]),
					},
					yAxisIndex: 0,
				},
				{
					name: 'Notional Value',
					type: 'bar',
					data: notionalValues,
					barWidth: '30%',
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#889FCD' },
							{ offset: 1, color: '#445067' },
						]),
					},
					yAxisIndex: 1,
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
	const handleDownload = useChartExport(chartInstanceRef, asset, `max_pain_chart_${asset}.png`);

	// Tooltip content
	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Max Pain by Expiration</b> shows the maximum pain price and notional value</br> across different option expiration dates.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• Red line shows Max Pain price for each expiration</div>
                <div>• Blue bars show total notional value of options</div>
                <div style="margin-bottom: 5px;">• Max Pain is where option sellers have minimum losses</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Insights:</b>
                <div style="margin-top: 5px;">• Price often gravitates toward Max Pain at expiration</div>
                <div>• Higher notional value indicates more market activity</div>
                <div style="margin-bottom: 5px;">• Helps identify key price levels and market sentiment</div>
            </div>
        </div>
    `;

	// Controls
	const controls = [
		<SelectControl
			key="asset"
			value={asset}
			onChange={(e) => setAsset(e.target.value)}
			options={ASSET_OPTIONS}
		/>,
	];

	return (
		<FlowOptionBase
			title="Max Pain by Expiration"
			icon="😡"
			tooltipContent={tooltipContent}
			controls={controls}
			onDownload={handleDownload}
			downloadId="cameraMaxPain"
			tooltipId="maxPainData"
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

export default MaxPainByExpirationBlockTrades;
