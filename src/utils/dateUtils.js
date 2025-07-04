/**
 * Утилиты для работы с датами и временем
 */

/**
 * Форматирует время UTC в локальное время
 * @param {string} timeUtc - Время в формате UTC (HH:MM:SS)
 * @returns {string} Отформатированное локальное время
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
 * Форматирует дату в удобочитаемый формат
 * @param {string|Date} date - Дата для форматирования
 * @param {string} locale - Локаль (по умолчанию 'en-US')
 * @returns {string} Отформатированная дата
 */
export const formatDate = (date, locale = 'en-US') => {
	if (!date) return 'N/A';

	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return 'Invalid date';

	return dateObj.toLocaleDateString(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

/**
 * Вычисляет разность между двумя датами в днях
 * @param {string|Date} date1 - Первая дата
 * @param {string|Date} date2 - Вторая дата
 * @returns {number} Количество дней между датами
 */
export const getDaysDifference = (date1, date2) => {
	const d1 = new Date(date1);
	const d2 = new Date(date2);

	if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
		return 0;
	}

	const diffTime = Math.abs(d2 - d1);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	return diffDays;
};

/**
 * Проверяет, является ли дата сегодняшней
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean} true если дата сегодняшняя
 */
export const isToday = (date) => {
	if (!date) return false;

	const dateObj = new Date(date);
	const today = new Date();

	return dateObj.toDateString() === today.toDateString();
};

/**
 * Получает относительное время (например, "2 hours ago")
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Относительное время
 */
export const getRelativeTime = (date) => {
	if (!date) return 'N/A';

	const dateObj = new Date(date);
	const now = new Date();
	const diffMs = now - dateObj;

	if (diffMs < 0) return 'In the future';

	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

	return formatDate(date);
};
