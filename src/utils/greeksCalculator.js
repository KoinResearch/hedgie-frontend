/**
 * Утилиты для расчета греков опционов
 */

// Функция для вычисления ошибки (error function)
const erf = (x) => {
	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = 0.3275911;

	const sign = x < 0 ? -1 : 1;
	x = Math.abs(x);

	const t = 1.0 / (1.0 + p * x);
	const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

	return sign * y;
};

/**
 * Вычисляет греки для одного опциона
 * @param {number} S - Текущая цена базового актива
 * @param {number} X - Цена исполнения
 * @param {number} T - Время до экспирации (в годах)
 * @param {number} r - Безрисковая ставка
 * @param {number} sigma - Волатильность
 * @param {string} optionType - Тип опциона ('call' или 'put')
 * @returns {Object} Объект с греками {delta, gamma, vega, theta}
 */
export const calculateGreeks = (S, X, T, r, sigma, optionType = 'call') => {
	if (!S || !X || !T || !r || !sigma || S <= 0 || sigma <= 0) {
		console.warn('Invalid input parameters for Greeks calculation');
		return { delta: 0, gamma: 0, vega: 0, theta: 0 };
	}

	const SQRT_2_PI = Math.sqrt(2 * Math.PI);
	const DAYS_IN_YEAR = 365.25;

	const d1 = (Math.log(S / X) + (r + sigma ** 2 / 2) * T) / (sigma * Math.sqrt(T));
	const d2 = d1 - sigma * Math.sqrt(T);

	const normPDF = (x) => Math.exp(-0.5 * x * x) / SQRT_2_PI;
	const normCDF = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));

	let delta, gamma, vega, theta;

	if (optionType === 'call') {
		delta = normCDF(d1);
		gamma = normPDF(d1) / (S * sigma * Math.sqrt(T));
		vega = S * Math.sqrt(T) * normPDF(d1);
		theta = -(S * normPDF(d1) * sigma) / (2 * Math.sqrt(T)) - r * X * Math.exp(-r * T) * normCDF(d2);
	} else if (optionType === 'put') {
		delta = -normCDF(-d1);
		gamma = normPDF(d1) / (S * sigma * Math.sqrt(T));
		vega = S * Math.sqrt(T) * normPDF(d1);
		theta = -(S * normPDF(d1) * sigma) / (2 * Math.sqrt(T)) + r * X * Math.exp(-r * T) * normCDF(-d2);
	} else {
		throw new Error("Invalid option type. Must be 'put' or 'call'.");
	}

	theta = theta / DAYS_IN_YEAR;

	return { delta, gamma, vega, theta };
};

/**
 * Вычисляет общие греки для всех сделок
 * @param {Array} trades - Массив сделок
 * @returns {Object} Общие греки {delta, gamma, vega, theta}
 */
export const calculateOverallGreeks = (trades) => {
	if (!trades || trades.length === 0) {
		return { delta: 0, gamma: 0, vega: 0, theta: 0 };
	}

	let totalDelta = 0,
		totalGamma = 0,
		totalVega = 0,
		totalTheta = 0;

	trades.forEach((trade) => {
		const size = parseFloat(trade.size || 1);
		const optionType = trade.instrument_name.includes('-C') ? 'call' : 'put';

		const greeks = calculateGreeks(
			parseFloat(trade.spot),
			parseFloat(trade.strike),
			parseFloat(trade.dte) / 365.25,
			0.01, // Безрисковая ставка
			parseFloat(trade.iv) / 100,
			optionType,
		);

		const multiplier = trade.side === 'sell' ? -1 : 1;

		totalDelta += greeks.delta * size * multiplier;
		totalGamma += greeks.gamma * size * multiplier;
		totalVega += greeks.vega * size * multiplier;
		totalTheta += greeks.theta * size * multiplier;
	});

	return { delta: totalDelta, gamma: totalGamma, vega: totalVega, theta: totalTheta };
};

/**
 * Вычисляет греки для календарного спреда (2 сделки)
 * @param {Array} trades - Массив из 2 сделок
 * @returns {Object} Греки спреда {delta, gamma, vega, theta}
 */
export const calculateCalendarSpreadGreeks = (trades) => {
	if (trades.length !== 2) {
		console.error('Expected exactly 2 trades for a calendar spread calculation.');
		return { delta: 0, gamma: 0, vega: 0, theta: 0 };
	}

	const [longLeg, shortLeg] = trades;
	const longOptionType = longLeg.instrument_name.includes('-C') ? 'call' : 'put';
	const shortOptionType = shortLeg.instrument_name.includes('-C') ? 'call' : 'put';

	const longGreeks = calculateGreeks(
		parseFloat(longLeg.spot),
		parseFloat(longLeg.strike),
		parseFloat(longLeg.dte) / 365,
		0.01,
		parseFloat(longLeg.iv) / 100,
		longOptionType,
	);

	const shortGreeks = calculateGreeks(
		parseFloat(shortLeg.spot),
		parseFloat(shortLeg.strike),
		parseFloat(shortLeg.dte) / 365,
		0.01,
		parseFloat(shortLeg.iv) / 100,
		shortOptionType,
	);

	const size = parseFloat(longLeg.size || 1);
	const delta = (longGreeks.delta - shortGreeks.delta) * size;
	const gamma = (longGreeks.gamma - shortGreeks.gamma) * size;
	const vega = (longGreeks.vega - shortGreeks.vega) * size;
	const theta = (longGreeks.theta - shortGreeks.theta) * size;

	return { delta, gamma, vega, theta };
};

/**
 * Определяет метод расчета греков в зависимости от количества сделок
 * @param {Array} trades - Массив сделок
 * @returns {Function} Функция для расчета греков
 */
export const getGreekCalculationMethod = (trades) => {
	return trades.length === 2 ? calculateCalendarSpreadGreeks : calculateOverallGreeks;
};
