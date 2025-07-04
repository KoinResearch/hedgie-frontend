import React from 'react';
import { useFilterContext } from '../../contexts/FilterContext';
import { FILTER_OPTIONS } from '../../utils/constants';
import SelectControl from '../SelectControl/SelectControl';
import InputControl from '../InputControl/InputControl';
import './BlockFlowFilter.css';

const BlockFlowFilter = ({ isMobile = false, onApply }) => {
	const { filters, updateFilter, resetFilters } = useFilterContext();

	const assetOptions = FILTER_OPTIONS.ASSETS.map((asset) => ({
		value: asset,
		label: asset,
	}));

	const optionTypeOptions = FILTER_OPTIONS.OPTION_TYPES.map((type) => ({
		value: type,
		label: type === 'C' ? 'CALL' : type === 'P' ? 'PUT' : type,
	}));

	const exchangeOptions = FILTER_OPTIONS.EXCHANGES.map((exchange) => ({
		value: exchange,
		label: exchange === 'DER' ? 'Deribit' : exchange,
	}));

	const makerOptions = FILTER_OPTIONS.MAKERS.map((maker) => ({
		value: maker,
		label:
			maker === '🐙🦑'
				? 'SHRIMP'
				: maker === '🐟🎣'
				? 'FISH'
				: maker === '🐡🚣'
				? 'CARP'
				: maker === '🐬🌊'
				? 'DOLPHIN'
				: maker === '🐋🐳'
				? 'WHALE'
				: maker === '🦈'
				? 'MEGALADON'
				: maker,
	}));

	const sideOptions = FILTER_OPTIONS.SIDES.map((side) => ({
		value: side,
		label: side === 'buy' ? 'BUY' : side === 'sell' ? 'SELL' : side,
	}));

	const comboOptions = FILTER_OPTIONS.COMBO_TYPES.map((combo) => ({
		value: combo,
		label: combo,
	}));

	const handleResetFilters = () => {
		resetFilters();
		if ('vibrate' in navigator) navigator.vibrate(50);
	};

	const handleApply = () => {
		if ('vibrate' in navigator) navigator.vibrate(100);
		onApply && onApply();
	};

	return (
		<div className={`filter-panel ${isMobile ? 'filter-panel--mobile' : ''}`}>
			<div className={`filter-panel__grid ${isMobile ? 'filter-panel__grid--mobile' : ''}`}>
				<div className="filter-panel__column">
					<div className="filter-panel__field">
						<SelectControl
							value={filters.asset || 'ALL'}
							onChange={(e) => updateFilter('asset', e.target.value)}
							options={assetOptions}
							placeholder="Asset: "
						/>
					</div>
					<div className="filter-panel__field">
						<SelectControl
							value={filters.optionType || 'ALL'}
							onChange={(e) => updateFilter('optionType', e.target.value)}
							options={optionTypeOptions}
							placeholder="Type: "
						/>
					</div>
				</div>

				<div className="filter-panel__column">
					<div className="filter-panel__field">
						<InputControl
							type="number"
							placeholder="Strike Min: 0"
							value={filters.strikeMin || ''}
							onChange={(e) => updateFilter('strikeMin', e.target.value)}
							min="0"
						/>
					</div>
					<div className="filter-panel__field">
						<SelectControl
							value={filters.exchange || 'ALL'}
							onChange={(e) => updateFilter('exchange', e.target.value)}
							options={exchangeOptions}
							placeholder="Exchange: "
						/>
					</div>
					<div className="filter-panel__field">
						<SelectControl
							value={filters.maker || 'ALL'}
							onChange={(e) => updateFilter('maker', e.target.value)}
							options={makerOptions}
							placeholder="Maker: "
						/>
					</div>
				</div>

				<div className="filter-panel__column">
					<div className="filter-panel__field">
						<InputControl
							type="number"
							placeholder="Strike Max: 0"
							value={filters.strikeMax}
							onChange={(e) => updateFilter('strikeMax', e.target.value)}
							min="0"
						/>
					</div>
					<div className="filter-panel__field">
						<SelectControl
							value={filters.side || 'ALL'}
							onChange={(e) => updateFilter('side', e.target.value)}
							options={sideOptions}
							placeholder="Side: "
						/>
					</div>
					<div className="filter-panel__field">
						<InputControl
							type="number"
							placeholder="IV Min: 0"
							value={filters.ivMin}
							onChange={(e) => updateFilter('ivMin', e.target.value)}
							min="0"
							max="1000"
						/>
					</div>
				</div>

				<div className="filter-panel__column">
					<div className="filter-panel__field">
						<InputControl
							type="number"
							placeholder="DTE Min: 0"
							value={filters.dteMin}
							onChange={(e) => updateFilter('dteMin', e.target.value)}
							min="0"
							max="3650"
						/>
					</div>
					<div className="filter-panel__field">
						<SelectControl
							value={filters.combo || 'ALL'}
							onChange={(e) => updateFilter('combo', e.target.value)}
							options={comboOptions}
							placeholder="Combo: "
						/>
					</div>
					<div className="filter-panel__field">
						<InputControl
							type="number"
							placeholder="IV Max: 0"
							value={filters.ivMax}
							onChange={(e) => updateFilter('ivMax', e.target.value)}
							min="0"
							max="1000"
						/>
					</div>
				</div>

				{isMobile && (
					<div className="filter-panel__column">
						<div className="filter-panel__field">
							<InputControl
								type="number"
								placeholder="DTE Max: 0"
								value={filters.dteMax}
								onChange={(e) => updateFilter('dteMax', e.target.value)}
								min="0"
								max="3650"
							/>
						</div>
					</div>
				)}
			</div>

			<div className="filter-panel__actions">
				<button
					className="filter-panel__action-button"
					onClick={handleResetFilters}
				>
					Reset
				</button>
				{isMobile && onApply && (
					<button
						className="filter-panel__action-button filter-panel__action-button--apply"
						onClick={handleApply}
					>
						Apply
					</button>
				)}
			</div>
		</div>
	);
};

export default BlockFlowFilter;
