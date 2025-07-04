/**
 * Утилиты для расчетов сделок
 */

/**
 * Вычисляет чистый дебет или кредит для группы сделок
 * @param {Array} trades - массив сделок
 * @returns {Object} объект с totalBought, totalSold и netDebitOrCredit
 */
export const calculateNetDebitOrCredit = (trades) => {
	let totalBought = 0;
	let totalSold = 0;

	trades.forEach((trade) => {
		const premiumAllInBaseAsset = trade.premium && trade.spot ? parseFloat(trade.premium) / parseFloat(trade.spot) : 0;

		if (trade.side === 'buy') {
			totalBought += premiumAllInBaseAsset;
		} else if (trade.side === 'sell') {
			totalSold += premiumAllInBaseAsset;
		}
	});

	if (totalBought > totalSold) {
		return {
			totalBought,
			totalSold,
			netDebitOrCredit: totalBought - totalSold,
			type: 'debit',
		};
	} else {
		return {
			totalBought,
			totalSold,
			netDebitOrCredit: totalSold - totalBought,
			type: 'credit',
		};
	}
};

/**
 * Форматирует время UTC в локальное время
 * @param {string} timeUtc - время в формате UTC (HH:MM:SS)
 * @returns {string} отформатированное время
 */
export const getFormattedTime = (timeUtc) => {
	if (!timeUtc) {
		console.error('Invalid timeUtc:', timeUtc);
		return 'Invalid time';
	}

	const currentDate = new Date().toISOString().split('T')[0];
	const dateTimeString = `${currentDate} ${timeUtc}`;
	const dateObj = new Date(dateTimeString);

	if (isNaN(dateObj.getTime())) {
		console.error('Invalid Date:', dateTimeString);
		return 'Invalid time';
	}

	return dateObj.toLocaleTimeString();
};

/**
 * Вычисляет общую стоимость позиции
 * @param {Array} trades - массив сделок
 * @returns {number} общая стоимость
 */
export const calculateTotalPositionValue = (trades) => {
	return trades.reduce((total, trade) => {
		const premium = parseFloat(trade.premium) || 0;
		return total + premium;
	}, 0);
};

/**
 * Вычисляет среднюю цену сделки
 * @param {Array} trades - массив сделок
 * @returns {number} средняя цена
 */
export const calculateAveragePrice = (trades) => {
	if (trades.length === 0) return 0;

	const totalPrice = trades.reduce((sum, trade) => {
		const price = parseFloat(trade.price) || 0;
		return sum + price;
	}, 0);

	return totalPrice / trades.length;
};

/**
 * Вычисляет общий размер позиции
 * @param {Array} trades - массив сделок
 * @returns {number} общий размер
 */
export const calculateTotalSize = (trades) => {
	return trades.reduce((total, trade) => {
		const size = parseFloat(trade.size) || 0;
		return total + size;
	}, 0);
};

/**
 * Форматирует число с разделителями тысяч
 * @param {number} value - число для форматирования
 * @param {number} decimals - количество десятичных знаков
 * @returns {string} отформатированное число
 */
export const formatNumber = (value, decimals = 2) => {
	if (value === null || value === undefined || isNaN(value)) {
		return 'N/A';
	}

	const num = parseFloat(value);
	if (isNaN(num)) return 'N/A';

	return num.toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
};

/**
 * Форматирует процентное значение
 * @param {number} value - значение в процентах
 * @param {number} decimals - количество десятичных знаков
 * @returns {string} отформатированный процент
 */
export const formatPercentage = (value, decimals = 2) => {
	if (value === null || value === undefined || isNaN(value)) {
		return 'N/A';
	}

	const num = parseFloat(value);
	if (isNaN(num)) return 'N/A';

	return `${num.toFixed(decimals)}%`;
};

/**
 * Вычисляет прибыль/убыток
 * @param {number} currentPrice - текущая цена
 * @param {number} entryPrice - цена входа
 * @param {number} size - размер позиции
 * @returns {Object} объект с P&L и процентным изменением
 */
export const calculatePnL = (currentPrice, entryPrice, size) => {
	const currentValue = currentPrice * size;
	const entryValue = entryPrice * size;
	const pnl = currentValue - entryValue;
	const pnlPercentage = ((currentPrice - entryPrice) / entryPrice) * 100;

	return {
		pnl,
		pnlPercentage,
		currentValue,
		entryValue,
	};
};
