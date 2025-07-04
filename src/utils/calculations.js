/**
 * Утилиты для расчетов греков опционов
 */

/**
 * Функция ошибки (error function)
 * @param {number} x - аргумент
 * @returns {number} значение функции ошибки
 */
const erf = (x) => {
	// Приближение функции ошибки
	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = 0.3275911;

	const sign = x >= 0 ? 1 : -1;
	const absX = Math.abs(x);
	const t = 1.0 / (1.0 + p * absX);
	const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
	return sign * y;
};

/**
 * Вычисляет греки опциона по формуле Блэка-Шоулза
 * @param {number} S - текущая цена актива
 * @param {number} X - цена исполнения
 * @param {number} T - время до экспирации (в годах)
 * @param {number} r - безрисковая ставка
 * @param {number} sigma - волатильность
 * @param {string} optionType - тип опциона ('call' или 'put')
 * @returns {Object} объект с греками
 */
export const calculateGreeks = (S, X, T, r, sigma, optionType = 'call') => {
	if (T <= 0 || sigma <= 0) {
		return {
			delta: 0,
			gamma: 0,
			theta: 0,
			vega: 0,
		};
	}

	const SQRT_2_PI = Math.sqrt(2 * Math.PI);
	const sqrtT = Math.sqrt(T);
	const d1 = (Math.log(S / X) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
	const d2 = d1 - sigma * sqrtT;

	// Функции плотности и распределения
	const normPDF = (x) => Math.exp(-0.5 * x * x) / SQRT_2_PI;
	const normCDF = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));

	const Nd1 = normCDF(d1);
	const Nd2 = normCDF(d2);
	const N_d1 = normCDF(-d1);
	const N_d2 = normCDF(-d2);
	const pdf_d1 = normPDF(d1);

	let delta, gamma, theta, vega;

	if (optionType.toLowerCase() === 'call') {
		delta = Nd1;
		gamma = pdf_d1 / (S * sigma * sqrtT);
		theta = (-S * pdf_d1 * sigma) / (2 * sqrtT) - r * X * Math.exp(-r * T) * Nd2;
		vega = S * sqrtT * pdf_d1;
	} else {
		delta = Nd1 - 1;
		gamma = pdf_d1 / (S * sigma * sqrtT);
		theta = (-S * pdf_d1 * sigma) / (2 * sqrtT) + r * X * Math.exp(-r * T) * N_d2;
		vega = S * sqrtT * pdf_d1;
	}

	return {
		delta: parseFloat(delta.toFixed(6)),
		gamma: parseFloat(gamma.toFixed(6)),
		theta: parseFloat(theta.toFixed(6)),
		vega: parseFloat(vega.toFixed(6)),
	};
};

/**
 * Вычисляет теоретическую цену опциона по формуле Блэка-Шоулза
 * @param {number} S - текущая цена актива
 * @param {number} X - цена исполнения
 * @param {number} T - время до экспирации (в годах)
 * @param {number} r - безрисковая ставка
 * @param {number} sigma - волатильность
 * @param {string} optionType - тип опциона ('call' или 'put')
 * @returns {number} теоретическая цена опциона
 */
export const calculateOptionPrice = (S, X, T, r, sigma, optionType = 'call') => {
	if (T <= 0 || sigma <= 0) {
		return 0;
	}

	const sqrtT = Math.sqrt(T);
	const d1 = (Math.log(S / X) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
	const d2 = d1 - sigma * sqrtT;

	const normCDF = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));

	const Nd1 = normCDF(d1);
	const Nd2 = normCDF(d2);
	const N_d1 = normCDF(-d1);
	const N_d2 = normCDF(-d2);

	let price;

	if (optionType.toLowerCase() === 'call') {
		price = S * Nd1 - X * Math.exp(-r * T) * Nd2;
	} else {
		price = X * Math.exp(-r * T) * N_d2 - S * N_d1;
	}

	return parseFloat(price.toFixed(6));
};

/**
 * Вычисляет подразумеваемую волатильность методом Ньютона-Рафсона
 * @param {number} S - текущая цена актива
 * @param {number} X - цена исполнения
 * @param {number} T - время до экспирации (в годах)
 * @param {number} r - безрисковая ставка
 * @param {number} marketPrice - рыночная цена опциона
 * @param {string} optionType - тип опциона ('call' или 'put')
 * @returns {number} подразумеваемая волатильность
 */
export const calculateImpliedVolatility = (S, X, T, r, marketPrice, optionType = 'call') => {
	if (T <= 0 || marketPrice <= 0) {
		return 0;
	}

	let sigma = 0.5; // начальное приближение
	const tolerance = 1e-6;
	const maxIterations = 100;

	for (let i = 0; i < maxIterations; i++) {
		const theoreticalPrice = calculateOptionPrice(S, X, T, r, sigma, optionType);
		const vega = calculateGreeks(S, X, T, r, sigma, optionType).vega;

		if (Math.abs(vega) < 1e-10) {
			break;
		}

		const diff = marketPrice - theoreticalPrice;
		const newSigma = sigma + diff / vega;

		if (Math.abs(newSigma - sigma) < tolerance) {
			return parseFloat(newSigma.toFixed(6));
		}

		sigma = Math.max(0.001, newSigma); // волатильность не может быть отрицательной
	}

	return parseFloat(sigma.toFixed(6));
};
