import { useState, useCallback } from 'react';
import axios from 'axios';
import { MESSAGES } from '../utils/constants';

/**
 * Хук для AI анализа сделок
 * @returns {Object} Функции и состояние для анализа
 */
export const useTradeAnalysis = () => {
	const [analysis, setAnalysis] = useState('');
	const [errorAI, setErrorAI] = useState(null);
	const [loadingAI, setLoadingAI] = useState(false);
	const [showAnalysis, setShowAnalysis] = useState(false);

	/**
	 * Получает анализ сделок от AI
	 * @param {Array} trades - Массив сделок для анализа
	 */
	const getAnalysis = useCallback(async (trades) => {
		setLoadingAI(true);
		setErrorAI(null);

		try {
			console.log('Sending trades for analysis:', trades);
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/analyze`, { trades });
			console.log('AI Analysis response:', response.data);
			setAnalysis(response.data.analysis || MESSAGES.NO_DATA);
		} catch (error) {
			console.error('AI Analysis request error:', error);
			console.error('Error details:', error.response?.data);
			setErrorAI(error.message || MESSAGES.ANALYSIS_ERROR);
			setAnalysis(MESSAGES.ANALYSIS_ERROR);
		} finally {
			setLoadingAI(false);
		}
	}, []);

	/**
	 * Запускает анализ сделок
	 * @param {Array} trades - Массив сделок для анализа
	 */
	const handleAnalyzeClick = useCallback(
		(trades) => {
			setShowAnalysis(true);
			getAnalysis(trades);
		},
		[getAnalysis],
	);

	/**
	 * Сбрасывает состояние анализа
	 */
	const resetAnalysis = useCallback(() => {
		setAnalysis('');
		setErrorAI(null);
		setLoadingAI(false);
		setShowAnalysis(false);
	}, []);

	return {
		analysis,
		errorAI,
		loadingAI,
		showAnalysis,
		getAnalysis,
		handleAnalyzeClick,
		resetAnalysis,
		setShowAnalysis,
	};
};
