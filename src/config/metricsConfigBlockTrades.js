export const metricsConfigBlockTrades = [
	{
		key: 'avg_price',
		icon: 'fas fa-dollar-sign',
		labelIcon: '🤑',
		desktopLabel: 'Average Price',
		mobileLabel: 'Average\nPrice',
		tooltipId: 'avgPriceBlockTrades',
		tooltipContent: `
			<div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
				<div style="margin-bottom: 10px;">
					<b>Average Transaction Price</b> shows the weighted average</br> cost of all trades during the selected period.
				</div>

				<div style="margin-left: 10px; margin-bottom: 10px;">
					This metric helps to:
					<div style="margin-top: 5px;">• Identify most active price levels</div>
					<div>• Reveal trading concentration zones</div>
					<div style="margin-bottom: 5px;">• Understand overall price trend</div>
				</div>

				<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
					<b>Market Insights:</b>
					<div style="margin-top: 5px;">• Price above market: buyers dominate</div>
					<div style="margin-bottom: 5px;">• Price below market: sellers dominate</div>
				</div>
			</div>
		`,
	},
	{
		key: 'total_nominal_volume',
		icon: 'fas fa-chart-bar',
		labelIcon: '📊',
		desktopLabel: 'Total Volume',
		mobileLabel: 'Total\nVolume',
		tooltipId: 'totalVolumeBlockTrades',
		tooltipContent: `
			<div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
				<div style="margin-bottom: 10px;">
					<b>Total Trading Volume</b> represents the cumulative value of all</br> executed trades during the selected period.
				</div>

				<div style="margin-left: 10px; margin-bottom: 10px;">
					This metric helps to:
					<div style="margin-top: 5px;">• Assess current market liquidity</div>
					<div>• Determine trader activity levels</div>
					<div style="margin-bottom: 5px;">• Identify periods of increased market interest</div>
				</div>

				<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
					<b>Market Insights:</b>
					<div style="margin-top: 5px;">• High volume often accompanies significant price movements</div>
					<div>• Low volume may indicate consolidation periods</div>
					<div style="margin-bottom: 5px;">• Sudden volume spikes can signal potential trend changes</div>
				</div>
			</div>
		`,
	},
	{
		key: 'total_premium',
		icon: 'fas fa-coins',
		labelIcon: '📈',
		desktopLabel: 'Total Premium',
		mobileLabel: 'Total\nPremium',
		tooltipId: 'totalPremiumBlockTrades',
		tooltipContent: `
			<div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
				<div style="margin-bottom: 10px;">
					<b>Total Premium</b> represents the cumulative value of all option</br> premiums paid during the selected period.
				</div>

				<div style="margin-left: 10px; margin-bottom: 10px;">
					Premium is:
					<div style="margin-top: 5px;">• The price paid by option buyers to sellers</div>
					<div>• Payment for the right (not obligation) to buy/sell the asset</div>
					<div style="margin-bottom: 5px;">• Income source for option sellers</div>
				</div>

				<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
					<b>Market Insights:</b>
					<div style="margin-top: 5px;">• High premiums indicate increased volatility expectations</div>
					<div>• Growing total premium shows rising interest in options trading</div>
					<div style="margin-bottom: 5px;">• Premium size reflects market's volatility expectations</div>
				</div>
			</div>
		`,
	},
];
