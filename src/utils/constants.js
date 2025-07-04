/**
 * Константы приложения
 */

// Описания типов мейкеров
export const MAKER_DESCRIPTIONS = {
	'🐙🦑': 'Shrimp < $250',
	'🐟🎣': 'Fish < $1,000',
	'🐡🚣': 'Blowfish < $10,000',
	'🐬🌊': 'Dolphin < $100,000',
	'🐋🐳': 'Whale < $1,000,000',
	'🦈': 'Shark < $10,000,000',
};

// Опции для фильтров
export const FILTER_OPTIONS = {
	ASSETS: ['ALL', 'BTC', 'ETH'],
	OPTION_TYPES: ['ALL', 'C', 'P'],
	SIDES: ['ALL', 'buy', 'sell'],
	EXCHANGES: ['ALL', 'DER'],
	MAKERS: ['ALL', '🐙🦑', '🐟🎣', '🐡🚣', '🐬🌊', '🐋🐳', '🦈'],
	PAGE_SIZES: [15, 30, 50],
	COMBO_TYPES: ['ALL', 'SINGLE', 'COMBO', 'BLOCK'],
};

// API endpoints
export const API_ENDPOINTS = {
	TRADES: '/api/block/flow/trades',
	EXPIRATIONS: '/api/expirations',
	AI_ANALYSIS: '/api/ai/analyze',
};

// Кэш TTL
export const CACHE_TTL = {
	SHORT: 5 * 60 * 1000, // 5 минут
	MEDIUM: 15 * 60 * 1000, // 15 минут
	LONG: 60 * 60 * 1000, // 1 час
};

// Цвета для UI
export const COLORS = {
	BUY: 'green',
	SELL: 'red',
	CALL: 'green',
	PUT: 'red',
	HIGHLIGHT: '#4b88e1',
	ACTIVE_BORDER: '#37948c',
};

// CSS классы
export const CSS_CLASSES = {
	ACTIVE_ROW: 'block-flow-filters__table-row--active',
	TRADE_SIDE_BUY: 'block-flow-filters__trade-side--buy',
	TRADE_SIDE_SELL: 'block-flow-filters__trade-side--sell',
	TRADE_SIDE_CALL: 'block-flow-filters__trade-side--call',
	TRADE_SIDE_PUT: 'block-flow-filters__trade-side--put',
};

// Сообщения
export const MESSAGES = {
	LOADING: 'Loading...',
	NO_DATA: 'No data available',
	ERROR: 'An error occurred',
	COPY_SUCCESS: 'Data copied to clipboard!',
	COPY_ERROR: 'Failed to copy data',
	ANALYSIS_LOADING: 'Analyzing trade...',
	ANALYSIS_ERROR: 'Failed to get analysis',
};

// Финансовые константы
export const FINANCIAL_CONSTANTS = {
	RISK_FREE_RATE: 0.01, // 1%
	DAYS_IN_YEAR: 365.25,
	SQRT_2_PI: Math.sqrt(2 * Math.PI),
};

// Лимиты
export const LIMITS = {
	MAX_PAGE_SIZE: 100,
	MAX_TRADES_PER_REQUEST: 1000,
	MAX_ANALYSIS_LENGTH: 10000,
};

// Опции для селектов
export const ASSET_OPTIONS = [
	{ value: 'BTC', label: 'BTC' },
	{ value: 'ETH', label: 'ETH' },
];

export const TIME_RANGE_OPTIONS = [
	{ value: '1h', label: '1 Hour' },
	{ value: '4h', label: '4 Hours' },
	{ value: '24h', label: '24 Hours' },
	{ value: '7d', label: '7 Days' },
	{ value: '30d', label: '30 Days' },
];

export const EXCHANGE_OPTIONS = [
	{ value: 'DER', label: 'Deribit' },
	{ value: 'ALL', label: 'All Exchanges' },
];
