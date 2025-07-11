import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Tooltip } from 'react-tooltip';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from '../../utils/cacheService.js';
import { useTradeContext } from '../../contexts/TradeContext.jsx';
import { useFilterContext } from '../../contexts/FilterContext.jsx';
import { useTradeData } from '../../hooks/useTradeData.js';
import { useGreeksCalculation } from '../../hooks/useGreeksCalculation.js';
import { usePagination } from '../../hooks/usePagination.js';
import { calculateNetDebitOrCredit, getFormattedTime } from '../../utils/tradeCalculations.js';
import FilterPanel from './BlockFlowFilter.jsx';
import TradeModal from './TradeModal.jsx';
import SelectControl from '../SelectControl/SelectControl.jsx';
import './BlockFlowContent.css';
import 'react-tooltip/dist/react-tooltip.css';
import Filter from '../../assets/Filter.jsx';
import Arrow from '../../assets/Arrow.jsx';
import Close from '../../assets/Close.jsx';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const makerDescriptions = {
	'🐙🦑': 'Shrimp < $250',
	'🐟🎣': 'Fish < $1,000',
	'🐡🚣': 'Blowfish < $10,000',
	'🐬🌊': 'Dolphin < $100,000',
	'🐋🐳': 'Whale < $1,000,000',
	'🦈': 'Shark < $10,000,000',
};

const getMakerDescription = (makerEmoji) => {
	return makerDescriptions[makerEmoji] || 'Unknown Tier';
};

const MakerCell = ({ maker, index }) => {
	const tooltipId = `maker-tooltip-${index}`;
	const description = getMakerDescription(maker);

	return (
		<td
			id={tooltipId}
			data-tooltip-content={description}
		>
			<span>{maker}</span>
			<Tooltip anchorId={tooltipId} />
		</td>
	);
};

const BlockFlowContent = ({ asset = 'BTC', tradeType = 'ALL', optionType = 'ALL', sizeOrder, premiumOrder }) => {
	const { isAuthenticated } = useAuth();
	const { filters, hasActiveFilters, getActiveFiltersCount } = useFilterContext();

	const [pageSize, setPageSize] = useState(15);

	const { page, handleNextPage, handlePreviousPage, resetPage, setTotalPages } = usePagination(1);

	const {
		trades,
		isLoading,
		totalPages: apiTotalPages,
	} = useTradeData({
		asset: filters.asset || asset,
		tradeType: filters.tradeType || tradeType,
		optionType: filters.optionType || optionType,
		side: filters.side || 'ALL',
		sizeOrder: filters.sizeOrder || sizeOrder,
		premiumOrder,
		page,
		exchange: filters.exchange || '',
		minStrike: filters.strikeMin || '',
		maxStrike: filters.strikeMax || '',
		maker: filters.maker || 'ALL',
		ivMin: filters.ivMin || '',
		ivMax: filters.ivMax || '',
		dteMin: filters.dteMin || '',
		dteMax: filters.dteMax || '',
		pageSize,
	});
	const { calculateOverallGreeks } = useGreeksCalculation();

	useEffect(() => {
		if (apiTotalPages && apiTotalPages > 0) {
			setTotalPages(apiTotalPages);
		}
	}, [apiTotalPages, setTotalPages]);

	const [showFilters, setShowFilters] = useState(false);
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [selectedTrade, setSelectedTrade] = useState(null);
	const [selectedMarkPrice, setSelectedMarkPrice] = useState(null);

	const { data: expirationsData } = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/expirations/${(filters.asset || asset).toLowerCase()}`,
		null,
		expirationCache,
		CACHE_TTL.LONG,
	);

	const expirations = Array.isArray(expirationsData) ? expirationsData : [];

	const toggleFilters = () => setShowFilters(!showFilters);
	const toggleMobileFilters = () => {
		const newState = !showMobileFilters;
		setShowMobileFilters(newState);

		if (newState) {
			document.body.style.overflow = 'hidden';
			sessionStorage.setItem('hideMobileNavigation', 'true');
			window.dispatchEvent(new Event('hideMobileNavigationChange'));
		} else {
			document.body.style.overflow = 'unset';
			sessionStorage.removeItem('hideMobileNavigation');
			window.dispatchEvent(new Event('hideMobileNavigationChange'));
		}

		if ('vibrate' in navigator) {
			navigator.vibrate(50);
		}
	};

	useEffect(() => {
		const handleMouseEnter = (e) => {
			const blockTradeId = e.currentTarget.dataset.blockTradeId;
			if (blockTradeId) {
				document
					.querySelectorAll(`[data-block-trade-id="${blockTradeId}"]`)
					.forEach((el) => el.classList.add('block-flow-filters__table-row--active'));
			}
		};

		const handleMouseLeave = (e) => {
			document
				.querySelectorAll('.block-flow-filters__table-row')
				.forEach((el) => el.classList.remove('block-flow-filters__table-row--active'));
		};

		const rows = document.querySelectorAll('.block-flow-filters__table-row');
		rows.forEach((row) => {
			row.addEventListener('mouseenter', handleMouseEnter);
			row.addEventListener('mouseleave', handleMouseLeave);
		});

		return () => {
			rows.forEach((row) => {
				row.removeEventListener('mouseenter', handleMouseEnter);
				row.removeEventListener('mouseleave', handleMouseLeave);
			});
		};
	}, [trades]);

	useEffect(() => {
		return () => {
			document.body.style.overflow = 'unset';
			sessionStorage.removeItem('hideMobileNavigation');
			window.dispatchEvent(new Event('hideMobileNavigationChange'));
		};
	}, []);

	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape' && showMobileFilters) {
				toggleMobileFilters();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [showMobileFilters]);

	useEffect(() => {
		if (!showMobileFilters) return;

		let startY = 0;
		let currentY = 0;

		const handleTouchStart = (e) => {
			startY = e.touches[0].clientY;
		};

		const handleTouchMove = (e) => {
			currentY = e.touches[0].clientY;
		};

		const handleTouchEnd = () => {
			const diff = startY - currentY;
			if (diff < -100) {
				if ('vibrate' in navigator) {
					navigator.vibrate(75);
				}
				toggleMobileFilters();
			}
		};

		const modal = document.querySelector('.block-flow-filters__mobile-modal-content');
		if (modal) {
			modal.addEventListener('touchstart', handleTouchStart);
			modal.addEventListener('touchmove', handleTouchMove);
			modal.addEventListener('touchend', handleTouchEnd);
		}

		return () => {
			if (modal) {
				modal.removeEventListener('touchstart', handleTouchStart);
				modal.removeEventListener('touchmove', handleTouchMove);
				modal.removeEventListener('touchend', handleTouchEnd);
			}
		};
	}, [showMobileFilters]);

	return (
		<div className="block-flow-filters">
			<div className="block-flow-filters__header">
				<button
					className="block-flow-filters__filter-btn-desktop"
					onClick={toggleFilters}
				>
					<Filter />
					{showFilters ? `Hide Filters` : `Show Filters`}
				</button>

				<button
					className={`block-flow-filters__filter-btn-mobile ${
						hasActiveFilters() ? 'block-flow-filters__filter-btn-mobile--active' : ''
					}`}
					onClick={toggleMobileFilters}
				>
					<Filter /> Filters
					{hasActiveFilters() && (
						<span className="block-flow-filters__filter-indicator">{getActiveFiltersCount()}</span>
					)}
				</button>
			</div>

			{showFilters && <FilterPanel />}

			{showMobileFilters && (
				<div
					className="block-flow-filters__mobile-modal"
					onClick={toggleMobileFilters}
				>
					<div
						className="block-flow-filters__mobile-modal-content"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="block-flow-filters__mobile-modal-body">
							<button
								className="block-flow-filters__mobile-modal-close"
								onClick={toggleMobileFilters}
							>
								<Close />
							</button>
							<div className="block-flow-filters__mobile-modal-title">Filter</div>
							<FilterPanel
								isMobile={true}
								onApply={toggleMobileFilters}
							/>
						</div>
					</div>
				</div>
			)}

			<div className="block-flow-filters__pagination">
				<div className="block-flow-filters__pagination-controls">
					<button
						className="block-flow-filters__toggle-button"
						onClick={handlePreviousPage}
						disabled={page === 1}
					>
						<Arrow direction="left" /> Previous
					</button>
					<button
						className="block-flow-filters__toggle-button"
						onClick={handleNextPage}
						disabled={page === (apiTotalPages || 1)}
					>
						Next <Arrow />
					</button>
				</div>
				<div className="block-flow-filters__page-size-control">
					<label className="block-flow-filters__page-size-label">Show:</label>
					<SelectControl
						value={pageSize}
						onChange={(e) => {
							setPageSize(parseInt(e.target.value));
							if (page !== 1) {
								resetPage();
							}
						}}
						options={[
							{ value: 15, label: '15' },
							{ value: 30, label: '30' },
							{ value: 50, label: '50' },
							{ value: 100, label: '100' },
						]}
						placeholder=""
					/>
				</div>
			</div>

			<div className="block-flow-filters__table">
				{isLoading ? (
					<p className="block-flow-filters__loading">Loading...</p>
				) : (
					<table>
						<thead>
							<tr>
								<th>Time UTC</th>
								<th>Side</th>
								<th className="block-flow-filters__highlight-column">Asset</th>
								<th className="block-flow-filters__highlight-column">Strike</th>
								<th>K</th>
								<th className="block-flow-filters__highlight-column">Chain</th>
								<th>Spot</th>
								<th>DTE</th>
								<th className="block-flow-filters__highlight-column">Ex.</th>
								<th>Size</th>
								<th>Price</th>
								<th>Premium</th>
								<th>IV</th>
								<th>Maker</th>
							</tr>
						</thead>
						<tbody>
							{trades.map((trade, index) => (
								<tr
									key={`${trade.block_trade_id}-${index}`}
									className={`block-flow-filters__table-row ${
										trade.blockTradeId ? 'block-flow-filters__table-row--active' : ''
									}`}
									data-block-trade-id={trade.blockTradeId}
									onMouseEnter={(e) => {
										if (trade.blockTradeId) {
											const blockTradeId = trade.blockTradeId;
											document
												.querySelectorAll(`[data-block-trade-id="${blockTradeId}"]`)
												.forEach((el) => el.classList.add('block-flow-filters__table-row--active'));
										}
									}}
									onMouseLeave={(e) => {
										document
											.querySelectorAll('.block-flow-filters__table-row')
											.forEach((el) => el.classList.remove('block-flow-filters__table-row--active'));
									}}
									onClick={() => {
										const groupTrades = trades.filter((t) => t.blockTradeId === trade.blockTradeId);
										setSelectedTrade(groupTrades);
									}}
								>
									<td>{getFormattedTime(trade.timeutc)}</td>
									<td>
										<span
											style={{
												padding: '4px 8px',
												backgroundColor: trade.side === 'buy' ? 'rgba(58, 165, 108, 1)' : 'rgba(244, 0, 0, 1)',
												color: 'rgba(255, 255, 255, 1)',
												borderRadius: '4px',
												fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
												fontWeight: '500',
												fontStyle: 'normal',
												fontSize: '13px',
												lineHeight: '100%',
												letterSpacing: '0%',
												display: 'inline-block',
											}}
									>
										{trade.side ? trade.side.toUpperCase() : 'N/A'}
										</span>
									</td>
									<td
										style={{
											color: 'rgba(37, 113, 245, 1)',
										}}
									>
										{trade.instrument_name ? trade.instrument_name.slice(0, 3) : 'N/A'}
									</td>
									<td>
										$
										{trade.instrument_name.match(/(\d+)-[CP]$/)
											? Number(trade.instrument_name.match(/(\d+)-[CP]$/)[1]).toLocaleString()
											: 'N/A'}
									</td>
									<td>
										<span
											style={{
												padding: '4px 8px',
												backgroundColor: trade.side === 'buy' ? 'rgba(244, 0, 0, 1)' : 'rgba(58, 165, 108, 1)',
												color: 'rgba(255, 255, 255, 1)',
												borderRadius: '4px',
												fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
												fontWeight: '500',
												fontStyle: 'normal',
												fontSize: '13px',
												lineHeight: '100%',
												letterSpacing: '0%',
												display: 'inline-block',
											}}
									>
										{trade.k === 'C' ? 'CALL' : trade.k === 'P' ? 'PUT' : 'N/A'}
										</span>
									</td>
									<td
										style={{
											color: 'rgba(37, 113, 245, 1)',
										}}
									>
										{trade.chain || 'N/A'}
									</td>
									<td>${trade.spot ? Number(trade.spot).toLocaleString() : 'N/A'}</td>
									<td>
										{trade.dte ? (
											<>
												<span>{trade.dte.slice(0, -1)}</span>
												<span
													style={{
														color: trade.k === 'C' ? '#00ff88' : '#ff4757',
													}}
												>
													d
												</span>
											</>
										) : (
											'N/A'
										)}
									</td>
									<td
										style={{
											color: 'rgba(37, 113, 245, 1)',
										}}
									>
										{trade.exchange || 'N/A'}
									</td>
									<td>{trade.size || 'N/A'}</td>
									<td>${trade.price ? Number(trade.price).toLocaleString() : 'N/A'}</td>
									<td
										style={{
											color: trade.k === 'C' ? '#00ff88' : '#ff4757',
										}}
									>
										${trade.premium ? Number(trade.premium).toLocaleString() : 'N/A'}
									</td>
									<td>{trade.iv || 'N/A'}%</td>
									<MakerCell
										maker={trade.maker}
										index={index}
									/>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{selectedTrade && (
				<TradeModal
					trades={selectedTrade}
					onClose={() => setSelectedTrade(null)}
				/>
			)}
		</div>
	);
};

export default BlockFlowContent;
