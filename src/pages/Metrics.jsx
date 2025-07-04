import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import ErrorBoundary from '../utils/ErrorBoundary';
import './Metrics.css';

import BTCETHOptionFlow from '../components/ForMetricsPage/Overview/BTCETHOptionFlow.jsx';
import MaxPainByExpiration from '../components/ForMetricsPage/Overview/MaxPainByExpiration.jsx';
import OptionVolumeChart from '../components/ForMetricsPage/Overview/OptionVolumeChart.jsx';
import StrikeActivityChart from '../components/ForMetricsPage/Overview/StrikeActivityChart.jsx';
import ExpirationActivityChart from '../components/ForMetricsPage/Overview/ExpirationActivityChart.jsx';
import TimeDistributionChart from '../components/ForMetricsPage/Overview/TimeDistributionChart.jsx';
import KeyMetrics from '../components/ForMetricsPage/Overview/KeyMetrics.jsx';
import TopTradesByVolume from '../components/ForMetricsPage/Overview/TopTradesByVolume.jsx';

import BTCETHBlockTrades from '../components/ForMetricsPage/BlockTrades/BTCETHBlockTrades.jsx';
import OptionVolumeChartBlockTrades from '../components/ForMetricsPage/BlockTrades/OptionVolumeChartBlockTrades.jsx';
import StrikeActivityChartBlockTrades from '../components/ForMetricsPage/BlockTrades/StrikeActivityChartBlockTrades.jsx';
import ExpirationActivityChartBlockTrades from '../components/ForMetricsPage/BlockTrades/ExpirationActivityChartBlockTrades.jsx';
import TimeDistributionChartBlockTrades from '../components/ForMetricsPage/BlockTrades/TimeDistributionChartBlockTrades.jsx';
import KeyMetricsBlockTrades from '../components/ForMetricsPage/BlockTrades/KeyMetricsBlockTrades.jsx';
import TopTradesByVolumeBlockTrades from '../components/ForMetricsPage/BlockTrades/TopTradesByVolumeBlockTrades.jsx';

import OpenInterestChart from '../components/ForMetricsPage/OpenInterest/OpenInterestChart.jsx';
import OpenInterestByExpirationChart from '../components/ForMetricsPage/OpenInterest/OpenInterestByExpirationChart.jsx';
import OpenInterestByStrikeChart from '../components/ForMetricsPage/OpenInterest/OpenInterestByStrikeChart.jsx';
import DeltaAdjustedOpenInterestChart from '../components/ForMetricsPage/OpenInterest/DeltaAdjustedOpenInterestChart.jsx';
import HistoricalOpenInterestChart from '../components/ForMetricsPage/OpenInterest/HistoricalOpenInterestChart.jsx';

import VolumeByOptionKindChart from '../components/ForMetricsPage/Volume/VolumeByOptionKindChart';
import VolumeByExpirationChart from '../components/ForMetricsPage/Volume/VolumeByExpirationChart.jsx';
import VolumeByStrikePriceChart from '../components/ForMetricsPage/Volume/VolumeByStrikePriceChart.jsx';
import TopTradedOptionsChart from '../components/ForMetricsPage/Volume/TopTradedOptionsChart.jsx';

const metricsConfig = {
	overview: {
		path: 'overview',
		title: 'Key Metrics Dashboard',
		showTitle: true,
		components: [
			{ Component: KeyMetrics, fullWidth: true },
			{ Component: BTCETHOptionFlow, props: { asset: 'BTC' } },
			{ Component: MaxPainByExpiration },
			{ Component: OptionVolumeChart },
			{ Component: TopTradesByVolume },
			{ Component: StrikeActivityChart },
			{ Component: ExpirationActivityChart },
			{ Component: TimeDistributionChart, fullWidth: true },
		],
	},
	blockTrades: {
		path: 'block-trades',
		title: 'Block Trades Key Metrics Dashboard',
		showTitle: true,
		components: [
			{ Component: KeyMetricsBlockTrades, fullWidth: true },
			{ Component: BTCETHBlockTrades, props: { asset: 'BTC' } },
			{ Component: OptionVolumeChartBlockTrades },
			{ Component: TopTradesByVolumeBlockTrades },
			{ Component: StrikeActivityChartBlockTrades },
			{ Component: ExpirationActivityChartBlockTrades },
			{ Component: TimeDistributionChartBlockTrades, fullWidth: true },
		],
	},
	openInterest: {
		path: 'open-interest',
		title: 'Open Interest Dashboard',
		showTitle: false,
		components: [
			{ Component: OpenInterestChart, withErrorBoundary: true },
			{ Component: OpenInterestByExpirationChart, withErrorBoundary: true },
			{ Component: OpenInterestByStrikeChart, withErrorBoundary: true },
			{ Component: DeltaAdjustedOpenInterestChart, withErrorBoundary: true },
			{ Component: HistoricalOpenInterestChart, fullWidth: true, withErrorBoundary: true },
		],
	},
	volume: {
		path: 'volume',
		title: 'Volume Dashboard',
		showTitle: false,
		components: [
			{ Component: VolumeByOptionKindChart },
			{ Component: VolumeByExpirationChart },
			{ Component: VolumeByStrikePriceChart },
			{ Component: TopTradedOptionsChart },
		],
	},
};

const Dashboard = ({ type }) => {
	const config = metricsConfig[type];

	if (!config) {
		return <div className="metrics__error">Dashboard type not found</div>;
	}

	return (
		<div className="metrics__dashboard">
			{config.showTitle && <h1 className="metrics__title">{config.title}</h1>}
			<div className="metrics__content">
				{config.components.map((component, index) => {
					const { Component, props = {}, fullWidth = false, withErrorBoundary = false } = component;

					return (
						<div
							key={index}
							className={`metrics__item ${fullWidth ? 'metrics__item--full-width' : ''}`}
						>
							{withErrorBoundary ? (
								<ErrorBoundary>
									<Component {...props} />
								</ErrorBoundary>
							) : (
								<Component {...props} />
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

const Metrics = () => {
	const sidebarItems = Object.entries(metricsConfig).map(([key, config]) => ({
		key,
		path: config.path,
		title: config.title,
	}));

	return (
		<div className="metrics">
			<Sidebar items={sidebarItems} />
			<div className="metrics__divider"></div>
			<div className="metrics__main">
				<Routes>
					<Route
						path="/"
						element={<Dashboard type="overview" />}
					/>
					<Route
						path="/overview"
						element={<Dashboard type="overview" />}
					/>
					{Object.entries(metricsConfig).map(([key, config]) => (
						<Route
							key={key}
							path={config.path}
							element={<Dashboard type={key} />}
						/>
					))}
				</Routes>
			</div>
		</div>
	);
};

export default Metrics;
