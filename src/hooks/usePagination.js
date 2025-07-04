import { useState, useCallback, useEffect } from 'react';

export const usePagination = (initialTotalPages = 1) => {
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(initialTotalPages);

	useEffect(() => {
		setTotalPages(initialTotalPages);
	}, [initialTotalPages]);

	useEffect(() => {
		if (page > totalPages && totalPages > 0) {
			setPage(1);
		}
	}, [totalPages, page]);

	const handleNextPage = useCallback(() => {
		setPage((prevPage) => {
			if (prevPage < totalPages) {
				return prevPage + 1;
			}
			return prevPage;
		});
	}, [totalPages]);

	const handlePreviousPage = useCallback(() => {
		setPage((prevPage) => {
			if (prevPage > 1) {
				return prevPage - 1;
			}
			return prevPage;
		});
	}, []);

	const goToPage = useCallback(
		(pageNumber) => {
			if (pageNumber >= 1 && pageNumber <= totalPages) {
				setPage(pageNumber);
			}
		},
		[totalPages],
	);

	const resetPage = useCallback(() => {
		setPage(1);
	}, []);

	return {
		page,
		totalPages,
		handleNextPage,
		handlePreviousPage,
		goToPage,
		resetPage,
		setPage,
		setTotalPages,
	};
};
