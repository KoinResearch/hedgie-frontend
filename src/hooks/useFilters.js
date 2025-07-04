import { useState, useCallback } from 'react';
import { FILTER_OPTIONS } from '../utils/constants';

/**
 * Хук для управления фильтрами
 * @param {Object} initialFilters - Начальные значения фильтров
 * @returns {Object} Состояние фильтров и функции управления
 */
export const useFilters = (initialFilters = {}) => {
	const [filters, setFilters] = useState({
		asset: 'BTC',
		tradeType: 'ALL',
		optionType: 'ALL',
		side: 'ALL',
		expiration: '',
		exchange: '',
		maker: 'ALL',
		strikeMin: '',
		strikeMax: '',
		ivMin: '',
		ivMax: '',
		dteMin: '',
		dteMax: '',
		pageSize: 15,
		sizeOrder: 'ALL',
		...initialFilters,
	});

	/**
	 * Обновляет конкретный фильтр
	 * @param {string} key - Ключ фильтра
	 * @param {any} value - Новое значение
	 */
	const updateFilter = useCallback((key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	/**
	 * Обновляет несколько фильтров одновременно
	 * @param {Object} newFilters - Объект с новыми значениями фильтров
	 */
	const updateFilters = useCallback((newFilters) => {
		setFilters((prev) => ({
			...prev,
			...newFilters,
		}));
	}, []);

	/**
	 * Сбрасывает все фильтры к значениям по умолчанию
	 */
	const resetFilters = useCallback(() => {
		setFilters({
			asset: 'ALL',
			tradeType: 'ALL',
			optionType: 'ALL',
			side: 'ALL',
			expiration: '',
			exchange: '',
			maker: 'ALL',
			strikeMin: '',
			strikeMax: '',
			ivMin: '',
			ivMax: '',
			dteMin: '',
			dteMax: '',
			pageSize: 15,
			sizeOrder: 'ALL',
		});
	}, []);

	/**
	 * Проверяет, активны ли какие-либо фильтры
	 */
	const hasActiveFilters = useCallback(() => {
		return Object.entries(filters).some(([key, value]) => {
			// Исключаем pageSize из проверки
			if (key === 'pageSize') return false;

			// Проверяем, что значение не пустое и не равно 'ALL'
			return value !== '' && value !== 'ALL' && value !== null && value !== undefined;
		});
	}, [filters]);

	/**
	 * Получает количество активных фильтров
	 */
	const getActiveFiltersCount = useCallback(() => {
		return Object.entries(filters).filter(([key, value]) => {
			if (key === 'pageSize') return false;
			return value !== '' && value !== 'ALL' && value !== null && value !== undefined;
		}).length;
	}, [filters]);

	/**
	 * Валидирует значения фильтров
	 */
	const validateFilters = useCallback(() => {
		const errors = [];

		// Проверка strike range
		if (filters.strikeMin && filters.strikeMax) {
			const min = parseFloat(filters.strikeMin);
			const max = parseFloat(filters.strikeMax);
			if (min > max) {
				errors.push('Strike Min cannot be greater than Strike Max');
			}
		}

		// Проверка IV range
		if (filters.ivMin && filters.ivMax) {
			const min = parseFloat(filters.ivMin);
			const max = parseFloat(filters.ivMax);
			if (min > max) {
				errors.push('IV Min cannot be greater than IV Max');
			}
		}

		// Проверка DTE range
		if (filters.dteMin && filters.dteMax) {
			const min = parseFloat(filters.dteMin);
			const max = parseFloat(filters.dteMax);
			if (min > max) {
				errors.push('DTE Min cannot be greater than DTE Max');
			}
		}

		return errors;
	}, [filters]);

	return {
		filters,
		updateFilter,
		updateFilters,
		resetFilters,
		hasActiveFilters,
		getActiveFiltersCount,
		validateFilters,
	};
};
