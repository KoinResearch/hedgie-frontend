import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { CACHE_TTL, metricsCache, useCachedApiCall } from '../../../utils/cacheService.js';
import MetricCard from '../../MetricCard/MetricCard.jsx';
import SelectControl from '../../SelectControl/SelectControl.jsx';
import { metricsConfig } from '../../../config/metricsConfig.js';
import './KeyMetrics.css';

const KeyMetrics = () => {
	const { isAuthenticated } = useAuth();
	const [asset, setAsset] = useState('BTC');
	const [exchange, setExchange] = useState('DER');
	const [loadingAI, setLoadingAI] = useState(true);
	const [errorAI, setErrorAI] = useState(null);
	const [timeRange, setTimeRange] = useState('24h');
	const [showAnalysis, setShowAnalysis] = useState(false);
	const [analysis, setAnalysis] = useState('');

	const {
		data: metricsData,
		loading,
		error,
	} = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/metrics/key-metrics/${asset.toLowerCase()}`,
		{ timeRange, exchange },
		metricsCache,
		CACHE_TTL.MEDIUM,
	);

	const metrics = metricsData || {
		avg_price: 0,
		total_nominal_volume: 0,
		total_premium: 0,
	};

	const getAIAnalysis = async () => {
		setLoadingAI(true);
		setErrorAI(null);
		try {
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/analyze-metrics`, {
				metrics: {
					avgPrice: metrics.avg_price,
					totalVolume: metrics.total_nominal_volume,
					totalPremium: metrics.total_premium,
					timeRange,
					asset,
					exchange,
				},
			});
			setAnalysis(response.data.analysis);
		} catch (errorAI) {
			setErrorAI('Failed to load analysis');
		}
		setLoadingAI(false);
	};

	const selectOptions = {
		timeRange: [
			{ value: '24h', label: 'Past 24 Hours' },
			{ value: '7d', label: 'Last Week' },
			{ value: '30d', label: 'Last Month' },
		],
		asset: [
			{ value: 'BTC', label: 'Bitcoin' },
			{ value: 'ETH', label: 'Ethereum' },
		],
		exchange: [
			{ value: 'DER', label: 'Deribit' },
			{ value: 'OKX', label: 'OKX' },
		],
	};

	return (
		<div className="key-metrics">
			<div className="key-metrics__controls">
				<SelectControl
					value={timeRange}
					onChange={(e) => setTimeRange(e.target.value)}
					options={selectOptions.timeRange}
				/>
				<SelectControl
					value={asset}
					onChange={(e) => setAsset(e.target.value)}
					options={selectOptions.asset}
				/>
				<SelectControl
					value={exchange}
					onChange={(e) => setExchange(e.target.value)}
					options={selectOptions.exchange}
				/>
				{isAuthenticated && (
					<button
						className="key-metrics__analyze-btn"
						onClick={() => {
							setShowAnalysis(true);
							getAIAnalysis();
						}}
					>
						AI Analysis
					</button>
				)}
			</div>
			<div className="key-metrics__grid">
				{metricsConfig.map((config) => (
					<MetricCard
						key={config.key}
						config={config}
						value={metrics[config.key]}
						loading={loading}
						error={error}
					/>
				))}
				{showAnalysis && (
					<div
						className="key-metrics__modal"
						onClick={() => setShowAnalysis(false)}
					>
						<div
							className="key-metrics__modal-content"
							onClick={(e) => e.stopPropagation()}
						>
							<h3 className="key-metrics__modal-title">AI Analysis</h3>
							<button
								className="key-metrics__modal-close"
								onClick={() => setShowAnalysis(false)}
							>
								×
							</button>
							{loadingAI ? (
								<div className="key-metrics__modal-loading">Loading...</div>
							) : errorAI ? (
								<div className="key-metrics__modal-error">{errorAI}</div>
							) : (
								<div className="key-metrics__modal-text">{analysis}</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default KeyMetrics;
