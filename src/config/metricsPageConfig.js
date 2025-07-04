import BTCETHOptionFlow from '../components/Metrics/Overview/BTCETHOptionFlow.jsx';
import BTCETHBlockTrades from '../components/Metrics/BlockTrades/BTCETHBlockTrades.jsx';
import MaxPainByExpiration from '../components/Metrics/Overview/MaxPainByExpiration.jsx';
import OptionVolumeChart from '../components/Metrics/Overview/OptionVolumeChart.jsx';
import StrikeActivityChart from '../components/Metrics/Overview/StrikeActivityChart.jsx';
import ExpirationActivityChart from '../components/Metrics/Overview/ExpirationActivityChart.jsx';
import TimeDistributionChart from '../components/Metrics/Overview/TimeDistributionChart.jsx';
import KeyMetrics from '../components/Metrics/Overview/KeyMetrics.jsx';
import TopTradesByVolume from '../components/Metrics/Overview/TopTradesByVolume.jsx';

import OptionVolumeChartBlockTrades from '../components/Metrics/BlockTrades/OptionVolumeChartBlockTrades.jsx';
import StrikeActivityChartBlockTrades from '../components/Metrics/BlockTrades/StrikeActivityChartBlockTrades.jsx';
import ExpirationActivityChartBlockTrades from '../components/Metrics/BlockTrades/ExpirationActivityChartBlockTrades.jsx';
import TimeDistributionChartBlockTrades from '../components/Metrics/BlockTrades/TimeDistributionChartBlockTrades.jsx';
import KeyMetricsBlockTrades from '../components/Metrics/BlockTrades/KeyMetricsBlockTrades.jsx';
import TopTradesByVolumeBlockTrades from '../components/Metrics/BlockTrades/TopTradesByVolumeBlockTrades.jsx';

import OpenInterestChart from '../components/Metrics/OpenInterest/OpenInterestChart.jsx';
import OpenInterestByExpirationChart from '../components/Metrics/OpenInterest/OpenInterestByExpirationChart.jsx';
import OpenInterestByStrikeChart from '../components/Metrics/OpenInterest/OpenInterestByStrikeChart.jsx';
import DeltaAdjustedOpenInterestChart from '../components/Metrics/OpenInterest/DeltaAdjustedOpenInterestChart.jsx';
import HistoricalOpenInterestChart from '../components/Metrics/OpenInterest/HistoricalOpenInterestChart.jsx';

import VolumeByOptionKindChart from '../components/Metrics/Volume/VolumeByOptionKindChart';
import VolumeByExpirationChart from '../components/Metrics/Volume/VolumeByExpirationChart.jsx';
import VolumeByStrikePriceChart from '../components/Metrics/Volume/VolumeByStrikePriceChart.jsx';
import TopTradedOptionsChart from '../components/Metrics/Volume/TopTradedOptionsChart.jsx';

export const metricsPageConfig = {
	overview: {
		path: 'overview',
		title: 'Key Metrics Dashboard',
		name: 'Overview',
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
		name: 'Block Trades',
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
		name: 'Open Interest',
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
		name: 'Volume',
		showTitle: false,
		components: [
			{ Component: VolumeByOptionKindChart },
			{ Component: VolumeByExpirationChart },
			{ Component: VolumeByStrikePriceChart },
			{ Component: TopTradedOptionsChart },
		],
	},
};
