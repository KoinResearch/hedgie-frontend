import React, { createContext, useContext } from 'react';
import { useFilters } from '../hooks/useFilters';
import { usePagination } from '../hooks/usePagination';

const FilterContext = createContext();

/**
 * Провайдер контекста для управления фильтрами
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @param {Object} props.initialFilters - Начальные значения фильтров
 */
export const FilterProvider = ({ children, initialFilters = {} }) => {
	const {
		filters,
		updateFilter,
		updateFilters,
		resetFilters,
		hasActiveFilters,
		getActiveFiltersCount,
		validateFilters,
	} = useFilters(initialFilters);

	const { currentPage, totalPages, nextPage, previousPage, goToPage, resetToFirstPage, canGoNext, canGoPrevious } =
		usePagination(1, 1);

	const value = {
		// Фильтры
		filters,
		updateFilter,
		updateFilters,
		resetFilters,
		hasActiveFilters,
		getActiveFiltersCount,
		validateFilters,

		// Пагинация
		currentPage,
		totalPages,
		nextPage,
		previousPage,
		goToPage,
		resetToFirstPage,
		canGoNext,
		canGoPrevious,
	};

	return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

/**
 * Хук для использования контекста фильтров
 * @returns {Object} Контекст фильтров
 */
export const useFilterContext = () => {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error('useFilterContext must be used within a FilterProvider');
	}
	return context;
};
