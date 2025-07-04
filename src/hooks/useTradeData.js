import { useState, useEffect } from 'react';
import { useCachedApiCall, CACHE_TTL, optionsCache } from '../utils/cacheService';

/**
 * Хук для получения данных сделок с фильтрами
 * @param {Object} params - параметры запроса
 * @returns {Object} объект с trades, isLoading, totalPages
 */
export const useTradeData = (params = {}) => {
	const [trades, setTrades] = useState([]);
	const [totalPages, setTotalPages] = useState(1);

	const {
		asset = 'BTC',
		tradeType = 'ALL',
		optionType = 'ALL',
		side = 'ALL',
		sizeOrder,
		premiumOrder,
		page = 1,
		exchange = '',
		minStrike = '',
		maxStrike = '',
		maker = 'ALL',
		ivMin = '',
		ivMax = '',
		dteMin = '',
		dteMax = '',
		pageSize = 15,
	} = params;

	const { data: tradesData, loading: isLoading } = useCachedApiCall(
		`${import.meta.env.VITE_API_URL}/api/block/flow/trades`,
		{
			asset,
			tradeType,
			optionType,
			side,
			sizeOrder,
			premiumOrder,
			page,
			exchange,
			minStrike,
			maxStrike,
			maker,
			ivMin,
			ivMax,
			dteMin,
			dteMax,
			pageSize,
		},
		optionsCache,
		CACHE_TTL.SHORT,
	);

	useEffect(() => {
		if (tradesData) {
			const groupedTradesData = tradesData.groupedTrades || [];
			const processedTrades = groupedTradesData.flatMap((group) =>
				group.trades.map((trade) => ({
					...trade,
					blockTradeId: group.blockTradeId,
					markPrice: trade.markPrice || 'N/A',
				})),
			);
			setTrades(processedTrades);
			setTotalPages(tradesData.totalPages || 1);
		}
	}, [tradesData]);

	return {
		trades,
		isLoading,
		totalPages,
	};
};
