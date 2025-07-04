import React, { createContext, useContext, useState, useCallback } from 'react';

const TradeContext = createContext();

/**
 * Провайдер контекста для управления состоянием сделок
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 */
export const TradeProvider = ({ children }) => {
	const [selectedTrade, setSelectedTrade] = useState(null);
	const [selectedMarkPrice, setSelectedMarkPrice] = useState(null);
	const [showFilters, setShowFilters] = useState(false);

	/**
	 * Выбирает сделку для отображения в модальном окне
	 * @param {Array} trades - Массив сделок
	 */
	const selectTrade = useCallback((trades) => {
		setSelectedTrade(trades);
	}, []);

	/**
	 * Закрывает модальное окно сделки
	 */
	const closeTrade = useCallback(() => {
		setSelectedTrade(null);
	}, []);

	/**
	 * Переключает видимость фильтров
	 */
	const toggleFilters = useCallback(() => {
		setShowFilters((prev) => !prev);
	}, []);

	/**
	 * Устанавливает видимость фильтров
	 * @param {boolean} visible - Видимость фильтров
	 */
	const setFiltersVisible = useCallback((visible) => {
		setShowFilters(visible);
	}, []);

	const value = {
		selectedTrade,
		selectedMarkPrice,
		showFilters,
		selectTrade,
		closeTrade,
		toggleFilters,
		setFiltersVisible,
		setSelectedMarkPrice,
	};

	return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
};

/**
 * Хук для использования контекста сделок
 * @returns {Object} Контекст сделок
 */
export const useTradeContext = () => {
	const context = useContext(TradeContext);
	if (!context) {
		throw new Error('useTradeContext must be used within a TradeProvider');
	}
	return context;
};
