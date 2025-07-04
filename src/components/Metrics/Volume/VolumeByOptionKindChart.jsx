import React, { useState, useMemo } from 'react';
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from '../../../utils/cacheService.js';
import { useChart } from '../../../hooks/useChart.js';
import { useChartExport } from '../../../hooks/useChartExport.js';
import FlowOptionBase from '../../Chart/FlowOptionBase.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import ChartContainer from '../../Chart/ChartContainer.jsx';
import { ASSET_OPTIONS, EXCHANGE_OPTIONS } from '../../../constants/chartOptions.js';

const VolumeByOptionKindChart = () => {
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [expiration, setExpiration] = useState('All Expirations');

	// API call for expirations
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

	// API call for open interest data
	const {
		data: interestData,
		loading: dataLoading,
		error: dataError,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/volume/open-interest/${asset.toLowerCase()}/${
			expiration === 'All Expirations' ? 'all' : expiration
		}`,
		{ exchange },
		optionsCache,
		CACHE_TTL.SHORT,
	);

	// Process data
	const expirations = ['All Expirations', ...(Array.isArray(expirationsData) ? expirationsData : [])];
	const data = interestData || { Calls: 0, Puts: 0 };

	const loading = expirationsLoading || dataLoading;
	const error = expirationsError || dataError;

	// Chart options
	const chartOptions = useMemo(() => {
		if (loading) return null;

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
					data: [data.Calls.toFixed(2), data.Puts.toFixed(2)],
					itemStyle: {
						color: function (params) {
							return params.dataIndex === 0 ? '#00cc96' : '#ff3e3e';
						},
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

	// Chart hook
	const { chartRef, chartInstanceRef } = useChart(chartOptions, [chartOptions]);

	// Export hook
	const handleDownload = useChartExport(chartInstanceRef, asset, `open_interest_by_kind_${asset}.png`);

	// Tooltip content
	const tooltipContent = `
        <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <b>Open Interest By Option Type</b> shows the distribution</br> of options activity between Calls and Puts over the last</br> 24 hours of trading.
            </div>

            <div style="margin-left: 10px; margin-bottom: 10px;">
                How to read:
                <div style="margin-top: 5px;">• Green bar - Total Call option contracts</div>
                <div>• Red bar - Total Put option contracts</div>
                <div>• Bar length shows number of contracts</div>
                <div style="margin-bottom: 5px;">• Compare Call vs Put volume to gauge market sentiment</div>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                <b>Trading Applications:</b>
                <div style="margin-top: 5px;">• Higher Call volume suggests bullish sentiment</div>
                <div>• Higher Put volume suggests bearish sentiment</div>
                <div style="margin-bottom: 5px;">• Balance between Calls/Puts shows market conviction</div>
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
			/>
		</FlowOptionBase>
	);
};

export default VolumeByOptionKindChart;
