/**
 * Утилиты для расчетов связанных со сделками
 */

/**
 * Вычисляет чистый дебет или кредит для группы сделок
 * @param {Array} trades - Массив сделок
 * @returns {Object} Объект с типом и суммой {type, amount, totalBought, totalSold}
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
			type: 'Net Debit',
			amount: (totalBought - totalSold).toFixed(4),
			totalBought: totalBought.toFixed(4),
			totalSold: totalSold.toFixed(4),
		};
	} else {
		return {
			type: 'Net Credit',
			amount: (totalSold - totalBought).toFixed(4),
			totalBought: totalBought.toFixed(4),
			totalSold: totalSold.toFixed(4),
		};
	}
};

/**
 * Вычисляет изменение открытого интереса для сделки
 * @param {Object} trade - Сделка
 * @returns {number} Изменение OI
 */
export const calculateOIChange = (trade) => {
	const size = trade.size ? parseFloat(trade.size) : 0;
	return trade.side === 'sell' ? size : 0;
};

/**
 * Получает детали исполнения сделки
 * @param {string} side - Сторона сделки ('buy' или 'sell')
 * @param {string} executionType - Тип исполнения
 * @returns {string} Сообщение о деталях исполнения
 */
export const getExecutionDetails = (side, executionType) => {
	if (executionType === 'Below the ask') {
		return '(Market Maker PREVENTED liquidity by buying cheaper\nthan the market)';
	} else if (executionType === 'Above the bid') {
		return '(Market Maker PREVENTED liquidity by selling\nabove the market)';
	}
	return '';
};

/**
 * Форматирует размеры сделок для отображения
 * @param {Array} trades - Массив сделок
 * @returns {string} Отформатированная строка размеров
 */
export const formatSize = (trades) => {
	const sizes = trades.map((trade) => {
		const size = trade.size ? parseFloat(trade.size).toFixed(1) : '0';
		const type = trade.instrument_name.endsWith('-C') ? 'C' : 'P';
		return `x${size}${type}`;
	});

	return `(${sizes.join('/')})`;
};

/**
 * Форматирует детали сделки для отображения
 * @param {Object} trade - Сделка
 * @returns {string} Отформатированная строка с деталями сделки
 */
export const formatTradeDetails = (trade) => {
	const instrumentName = trade.instrument_name || 'N/A';
	const size = trade.size ? parseFloat(trade.size).toFixed(1) : 'N/A';

	const sideBase = trade.side === 'buy' ? '🟢 Bought' : '🔴 Sold';
	const sideWithSize = `${sideBase} x${size}`;

	const executionType = trade.side === 'buy' ? 'Below the ask' : 'Above the bid';
	const executionMessage = getExecutionDetails(trade.side, executionType);
	const oiChange = calculateOIChange(trade);

	const premium = trade.premium ? parseFloat(trade.premium).toFixed(4) : 'N/A';
	const premiumUSD = trade.price ? parseFloat(trade.price).toLocaleString() : 'N/A';
	const premiumInBaseAsset = trade.price && trade.spot ? (parseFloat(trade.price) / trade.spot).toFixed(4) : 'N/A';
	const premiumAllInBaseAsset =
		trade.premium && trade.spot ? (parseFloat(trade.premium) / trade.spot).toFixed(4) : 'N/A';

	return `${sideWithSize} 🔷 ${instrumentName} 📈 at ${premiumInBaseAsset} Ξ ($${premiumUSD})
Total ${trade.side === 'buy' ? 'Bought' : 'Sold'}: ${premiumAllInBaseAsset} Ξ ($${premium}), IV: ${
		trade.iv || 'N/A'
	}%,  mark: ${trade.mark_price}
${executionType} ${executionMessage}
OI Change: ${oiChange}`;
};
