import React, { useState } from 'react';
import './FlowContent.css';
import { CACHE_TTL, optionsCache, useCachedApiCall } from '../../utils/cacheService';
import Arrow from '../../assets/Arrow';
import FlowMetrics from './FlowMetrics';
import FlowFilter from './FlowFilter.jsx';
import Skeleton from '../Skeleton/Skeleton.jsx';

const FlowContent = () => {
	const [asset, setAsset] = useState('BTC');
	const [tradeType, setTradeType] = useState('Buy/Sell');
	const [optionType, setOptionType] = useState('Call/Put');
	const [expiration, setExpiration] = useState('All Expirations');
	const [page, setPage] = useState(1);
	const [sizeOrder, setSizeOrder] = useState('All Sizes');
	const [premiumOrder, setPremiumOrder] = useState('All Premiums');

	const { data: metricsData, loading: isLoading } = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/trades`,
		{
			asset,
			tradeType,
			optionType,
			expiration,
			sizeOrder,
			premiumOrder,
			page,
		},
		optionsCache,
		CACHE_TTL.SHORT,
	);

	const {
		putCallRatio = 0,
		totalPuts = 0,
		totalCalls = 0,
		putsPercentage = 0,
		callsPercentage = 0,
		totalPages = 1,
		trades = [],
	} = metricsData || {};

	const handleNextPage = () => {
		if (page < totalPages) {
			setPage(page + 1);
		}
	};

	const handlePreviousPage = () => {
		if (page > 1) {
			setPage(page - 1);
		}
	};

	return (
		<div className="flow-content">
			<FlowFilter
				asset={asset}
				setAsset={setAsset}
				tradeType={tradeType}
				setTradeType={setTradeType}
				optionType={optionType}
				setOptionType={setOptionType}
				expiration={expiration}
				setExpiration={setExpiration}
				sizeOrder={sizeOrder}
				setSizeOrder={setSizeOrder}
				premiumOrder={premiumOrder}
				setPremiumOrder={setPremiumOrder}
			/>

			<div className="flow-content__pagination-controls">
				<button
					className="flow-content__toggle-button"
					onClick={handlePreviousPage}
					disabled={page === 1}
				>
					<Arrow direction="left" /> Previous
				</button>
				<button
					className="flow-content__toggle-button"
					onClick={handleNextPage}
					disabled={page === totalPages}
				>
					Next <Arrow />
				</button>
			</div>

			<FlowMetrics
				putCallRatio={putCallRatio}
				totalPuts={totalPuts}
				totalCalls={totalCalls}
				putsPercentage={putsPercentage}
				callsPercentage={callsPercentage}
			/>

			<div className="flow__table">
				{isLoading ? (
					<Skeleton />
				) : (
					<table>
						<thead>
							<tr>
								<th>Market</th>
								<th>Side</th>
								<th>Type</th>
								<th>Expiry</th>
								<th>Strike</th>
								<th>Size</th>
								<th>Price</th>
								<th>Time</th>
							</tr>
						</thead>
						<tbody>
							{trades.map((trade, index) => (
								<tr key={index}>
									<td>{asset}</td>
									<td>
										<span
											style={{
												padding: '4px 8px',
												backgroundColor:
													trade.direction.toUpperCase() === 'BUY' ? 'rgba(58, 165, 108, 1)' : 'rgba(244, 0, 0, 1)',
												color: 'rgba(255, 255, 255, 1)',
												borderRadius: '4px',
												fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
												fontWeight: '500',
												fontStyle: 'normal',
												fontSize: '13px',
												lineHeight: '100%',
												letterSpacing: '0%',
												display: 'inline-block',
												textTransform: 'uppercase',
											}}
										>
											{trade.direction}
										</span>
									</td>
									<td>
									<span
											style={{
												padding: '4px 8px',
												backgroundColor:
													trade.direction.toUpperCase() === 'BUY' ? 'rgba(58, 165, 108, 1)' : 'rgba(244, 0, 0, 1)',
												color: 'rgba(255, 255, 255, 1)',
												borderRadius: '4px',
												fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
												fontWeight: '500',
												fontStyle: 'normal',
												fontSize: '13px',
												lineHeight: '100%',
												letterSpacing: '0%',
												display: 'inline-block',
												textTransform: 'uppercase',
											}}
										>
										{trade.instrument_name.includes('-C') ? 'CALL' : 'PUT'}
										</span>
									</td>
									<td style={{ color: '#4B88E1' }}>{trade.instrument_name.match(/(\d{1,2}[A-Z]{3}\d{2})/)[0]}</td>
									<td>{trade.instrument_name.match(/(\d+)-[CP]$/)[1]}</td>
									<td>{Number(trade.amount).toFixed(2)}</td>
									<td>{Number(trade.price).toFixed(2)}</td>
									<td>
										{new Date(trade.timestamp).toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
											second: '2-digit',
										})}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default FlowContent;
