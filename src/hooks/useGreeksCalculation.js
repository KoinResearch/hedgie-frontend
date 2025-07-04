import { useMemo } from 'react';
import { calculateGreeks } from '../utils/calculations';

/**
 * Хук для расчета греков
 * @returns {Object} функции для расчета греков
 */
export const useGreeksCalculation = () => {
	const calculateOverallGreeks = useMemo(() => {
		return (trades) => {
			if (!trades || trades.length === 0) {
				return {
					delta: 0,
					gamma: 0,
					theta: 0,
					vega: 0,
				};
			}

			let totalDelta = 0;
			let totalGamma = 0;
			let totalTheta = 0;
			let totalVega = 0;

			trades.forEach((trade) => {
				const S = parseFloat(trade.spot) || 0;
				const X = parseFloat(trade.strike) || 0;
				const T = parseFloat(trade.dte) / 365 || 0;
				const r = 0.05; // risk-free rate
				const sigma = parseFloat(trade.iv) / 100 || 0;
				const optionType = trade.k === 'C' ? 'call' : 'put';
				const size = parseFloat(trade.size) || 0;

				const greeks = calculateGreeks(S, X, T, r, sigma, optionType);

				if (trade.side === 'buy') {
					totalDelta += greeks.delta * size;
					totalGamma += greeks.gamma * size;
					totalTheta += greeks.theta * size;
					totalVega += greeks.vega * size;
				} else if (trade.side === 'sell') {
					totalDelta -= greeks.delta * size;
					totalGamma -= greeks.gamma * size;
					totalTheta -= greeks.theta * size;
					totalVega -= greeks.vega * size;
				}
			});

			return {
				delta: totalDelta,
				gamma: totalGamma,
				theta: totalTheta,
				vega: totalVega,
			};
		};
	}, []);

	const calculateCalendarSpreadGreeks = useMemo(() => {
		return (trades) => {
			// Логика для расчета греков календарного спреда
			// Пока возвращаем базовые значения
			return {
				delta: 0,
				gamma: 0,
				theta: 0,
				vega: 0,
			};
		};
	}, []);

	return {
		calculateOverallGreeks,
		calculateCalendarSpreadGreeks,
	};
};

/**
 * Хук для расчета греков с дополнительной информацией
 * @param {Array} trades - Массив сделок
 * @returns {Object} Греки и дополнительная информация
 */
export const useDetailedGreeks = (trades) => {
	const greeks = useGreeksCalculation(trades);

	const additionalInfo = useMemo(() => {
		if (!trades || trades.length === 0) {
			return {
				tradeCount: 0,
				hasCalls: false,
				hasPuts: false,
				hasBuys: false,
				hasSells: false,
				isCalendarSpread: false,
			};
		}

		const hasCalls = trades.some((trade) => trade.instrument_name.includes('-C'));
		const hasPuts = trades.some((trade) => trade.instrument_name.includes('-P'));
		const hasBuys = trades.some((trade) => trade.side === 'buy');
		const hasSells = trades.some((trade) => trade.side === 'sell');
		const isCalendarSpread = trades.length === 2;

		return {
			tradeCount: trades.length,
			hasCalls,
			hasPuts,
			hasBuys,
			hasSells,
			isCalendarSpread,
		};
	}, [trades]);

	return {
		...greeks,
		...additionalInfo,
	};
};
