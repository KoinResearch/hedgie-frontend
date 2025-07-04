import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export const useChart = (options, dependencies = []) => {
	const chartRef = useRef(null);
	const chartInstanceRef = useRef(null);

	useEffect(() => {
		if (chartRef.current && options) {
			const chartInstance = echarts.init(chartRef.current);
			chartInstanceRef.current = chartInstance;

			chartInstance.setOption(options);

			const handleResize = () => chartInstance.resize();
			window.addEventListener('resize', handleResize);

			return () => {
				window.removeEventListener('resize', handleResize);
				chartInstance.dispose();
			};
		}
	}, dependencies);

	return { chartRef, chartInstanceRef };
};
