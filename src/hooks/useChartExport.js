import { useCallback } from 'react';
import * as echarts from 'echarts';

export const useChartExport = (chartInstanceRef, asset, filename) => {
	const handleDownload = useCallback(() => {
		if (chartInstanceRef.current) {
			// Создаем временный div для нового графика
			const tempDiv = document.createElement('div');
			tempDiv.style.visibility = 'hidden';
			tempDiv.style.position = 'absolute';
			tempDiv.style.width = chartInstanceRef.current.getWidth() + 'px';
			tempDiv.style.height = chartInstanceRef.current.getHeight() + 'px';
			document.body.appendChild(tempDiv);

			// Создаем временный экземпляр графика
			const tempChart = echarts.init(tempDiv);

			// Получаем текущие опции и добавляем водяной знак
			const currentOption = chartInstanceRef.current.getOption();
			const optionWithWatermark = {
				...currentOption,
				graphic: [
					{
						type: 'text',
						left: '50%',
						top: '50%',
						z: -1,
						style: {
							text: 'hedgie.org',
							fontSize: 80,
							fontFamily: 'JetBrains Mono',
							fontWeight: 'bold',
							fill: 'rgba(255, 255, 255, 0.06)',
							align: 'center',
							verticalAlign: 'middle',
							transform: 'translate(-50%, -50%)',
						},
					},
				],
			};

			// Применяем опции к временному графику
			tempChart.setOption(optionWithWatermark);

			// Ждем отрисовки данных
			setTimeout(() => {
				// Создаем URL и скачиваем
				const url = tempChart.getDataURL({
					type: 'png',
					pixelRatio: 2,
					backgroundColor: '#151518',
				});

				// Очищаем временные элементы
				tempChart.dispose();
				document.body.removeChild(tempDiv);

				// Скачиваем изображение
				const a = document.createElement('a');
				a.href = url;
				a.download = filename || `chart_${asset}.png`;
				a.click();
			}, 1000);
		}
	}, [chartInstanceRef, asset, filename]);

	return handleDownload;
};
