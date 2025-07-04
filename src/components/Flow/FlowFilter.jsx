import React, { useState, useEffect } from 'react';
import { CACHE_TTL, expirationCache, useCachedApiCall } from '../../utils/cacheService';
import SelectControl from '../SelectControl/SelectControl';
import Filter from '../../assets/Filter';
import Close from '../../assets/Close';
import './FlowFilter.css';

const FlowFilter = ({
	asset,
	setAsset,
	tradeType,
	setTradeType,
	optionType,
	setOptionType,
	expiration,
	setExpiration,
	sizeOrder,
	setSizeOrder,
	premiumOrder,
	setPremiumOrder,
}) => {
	const [showFilters, setShowFilters] = useState(false);
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	const initialValues = {
		asset: 'BTC',
		tradeType: 'Buy/Sell',
		optionType: 'Call/Put',
		expiration: 'All Expirations',
		sizeOrder: 'All Sizes',
		premiumOrder: 'All Premiums',
	};

	const hasActiveFilters = () => {
		return (
			asset !== initialValues.asset ||
			tradeType !== initialValues.tradeType ||
			optionType !== initialValues.optionType ||
			expiration !== initialValues.expiration ||
			sizeOrder !== initialValues.sizeOrder ||
			premiumOrder !== initialValues.premiumOrder
		);
	};

	const getActiveFiltersCount = () => {
		let count = 0;
		if (asset !== initialValues.asset) count++;
		if (tradeType !== initialValues.tradeType) count++;
		if (optionType !== initialValues.optionType) count++;
		if (expiration !== initialValues.expiration) count++;
		if (sizeOrder !== initialValues.sizeOrder) count++;
		if (premiumOrder !== initialValues.premiumOrder) count++;
		return count;
	};

	const assetOptions = [
		{ value: 'BTC', label: 'BTC' },
		{ value: 'ETH', label: 'ETH' },
	];

	const tradeTypeOptions = [
		{ value: 'Buy/Sell', label: 'Buy/Sell' },
		{ value: 'Buy', label: 'Buy' },
		{ value: 'Sell', label: 'Sell' },
	];

	const optionTypeOptions = [
		{ value: 'Call/Put', label: 'Call/Put' },
		{ value: 'Call', label: 'Call' },
		{ value: 'Put', label: 'Put' },
	];

	const sizeOrderOptions = [
		{ value: 'All Sizes', label: 'All Sizes' },
		{ value: 'higher to lower', label: 'Higher to Lower' },
		{ value: 'lesser to greater', label: 'Lesser to Greater' },
		{ value: 'low', label: 'Low' },
		{ value: 'high', label: 'High' },
	];

	const premiumOrderOptions = [
		{ value: 'All Premiums', label: 'All Premiums' },
		{ value: 'higher to lower', label: 'Higher to Lower' },
		{ value: 'lesser to greater', label: 'Lesser to Greater' },
		{ value: 'low', label: 'Low' },
		{ value: 'high', label: 'High' },
	];

	const { data: expirationsData } = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`,
		null,
		expirationCache,
		CACHE_TTL.LONG,
	);

	const expirations = Array.isArray(expirationsData) ? expirationsData : [];

	const expirationOptions = [
		{ value: 'All Expirations', label: 'All Expirations' },
		...expirations.map((exp) => ({ value: exp, label: exp })),
	];

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

	const handleResetFilters = () => {
		setAsset(initialValues.asset);
		setTradeType(initialValues.tradeType);
		setOptionType(initialValues.optionType);
		setExpiration(initialValues.expiration);
		setSizeOrder(initialValues.sizeOrder);
		setPremiumOrder(initialValues.premiumOrder);

		if ('vibrate' in navigator) navigator.vibrate(50);
	};

	const handleApply = () => {
		if ('vibrate' in navigator) navigator.vibrate(100);
		toggleMobileFilters();
	};

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

	return (
		<div className="flow-filter">
			<div className="flow-filter__header">
				<button
					className="flow-filter__filter-btn-desktop"
					onClick={toggleFilters}
				>
					<Filter />
					{showFilters ? `Hide Filters` : `Show Filters`}
				</button>

				<button
					className={`flow-filter__filter-btn-mobile ${
						hasActiveFilters() ? 'flow-filter__filter-btn-mobile--active' : ''
					}`}
					onClick={toggleMobileFilters}
				>
					<Filter /> Filters
					{hasActiveFilters() && <span className="flow-filter__filter-indicator">{getActiveFiltersCount()}</span>}
				</button>
			</div>

			{showFilters && (
				<div className="flow-filter-panel">
					<div className="flow-filter-panel__grid">
						<div className="flow-filter-panel__column">
							<div className="flow-filter-panel__field">
								<SelectControl
									options={assetOptions}
									value={asset}
									onChange={(e) => setAsset(e.target.value)}
								/>
							</div>
							<div className="flow-filter-panel__field">
								<SelectControl
									options={tradeTypeOptions}
									value={tradeType}
									onChange={(e) => setTradeType(e.target.value)}
								/>
							</div>
						</div>

						<div className="flow-filter-panel__column">
							<div className="flow-filter-panel__field">
								<SelectControl
									options={optionTypeOptions}
									value={optionType}
									onChange={(e) => setOptionType(e.target.value)}
								/>
							</div>
							<div className="flow-filter-panel__field">
								<SelectControl
									options={expirationOptions}
									value={expiration}
									onChange={(e) => setExpiration(e.target.value)}
								/>
							</div>
						</div>

						<div className="flow-filter-panel__column">
							<div className="flow-filter-panel__field">
								<SelectControl
									options={sizeOrderOptions}
									value={sizeOrder}
									onChange={(e) => setSizeOrder(e.target.value)}
								/>
							</div>
							<div className="flow-filter-panel__field">
								<SelectControl
									options={premiumOrderOptions}
									value={premiumOrder}
									onChange={(e) => setPremiumOrder(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="flow-filter-panel__actions">
						<button
							className="flow-filter-panel__action-button"
							onClick={handleResetFilters}
						>
							Reset
						</button>
					</div>
				</div>
			)}

			{showMobileFilters && (
				<div
					className="flow-filter__mobile-modal"
					onClick={toggleMobileFilters}
				>
					<div
						className="flow-filter__mobile-modal-content"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flow-filter__mobile-modal-body">
							<button
								className="flow-filter__mobile-modal-close"
								onClick={toggleMobileFilters}
							>
								<Close />
							</button>
							<div className="flow-filter__mobile-modal-title">Filter</div>
							<div className="flow-filter-panel flow-filter-panel--mobile">
								<div className="flow-filter-panel__grid flow-filter-panel__grid--mobile">
									<div className="flow-filter-panel__column">
										<div className="flow-filter-panel__field">
											<SelectControl
												options={assetOptions}
												value={asset}
												onChange={(e) => setAsset(e.target.value)}
											/>
										</div>
										<div className="flow-filter-panel__field">
											<SelectControl
												options={tradeTypeOptions}
												value={tradeType}
												onChange={(e) => setTradeType(e.target.value)}
											/>
										</div>
									</div>

									<div className="flow-filter-panel__column">
										<div className="flow-filter-panel__field">
											<SelectControl
												options={optionTypeOptions}
												value={optionType}
												onChange={(e) => setOptionType(e.target.value)}
											/>
										</div>
										<div className="flow-filter-panel__field">
											<SelectControl
												options={expirationOptions}
												value={expiration}
												onChange={(e) => setExpiration(e.target.value)}
											/>
										</div>
									</div>

									<div className="flow-filter-panel__column">
										<div className="flow-filter-panel__field">
											<SelectControl
												options={sizeOrderOptions}
												value={sizeOrder}
												onChange={(e) => setSizeOrder(e.target.value)}
											/>
										</div>
										<div className="flow-filter-panel__field">
											<SelectControl
												options={premiumOrderOptions}
												value={premiumOrder}
												onChange={(e) => setPremiumOrder(e.target.value)}
											/>
										</div>
									</div>
								</div>

								<div className="flow-filter-panel__actions">
									<button
										className="flow-filter-panel__action-button"
										onClick={handleResetFilters}
									>
										Reset
									</button>
									<button
										className="flow-filter-panel__action-button flow-filter-panel__action-button--apply"
										onClick={handleApply}
									>
										Apply
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default FlowFilter;
