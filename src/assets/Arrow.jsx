const Arrow = ({ direction = 'right', color = '#667085', size = 'medium' }) => {

	const directions = {
		left: {
			path: 'M6.5 1.5L1.5 6.5L6.5 11.5',
			viewBox: '0 0 8 13',
			width: 8,
			height: 13,
		},
		right: {
			path: 'M1.5 11.5L6.5 6.5L1.5 1.5',
			viewBox: '0 0 8 13',
			width: 8,
			height: 13,
		},
		top: {
			path: 'M1.5 6.5L6.5 1.5L11.5 6.5',
			viewBox: '0 0 13 8',
			width: 13,
			height: 8,
		},
		bottom: {
			path: 'M1.5 1.5L6.5 6.5L11.5 1.5',
			viewBox: '0 0 13 8',
			width: 13,
			height: 8,
		},
	};

	const sizes = {
		small: { scale: 0.75 },
		medium: { scale: 1 },
		large: { scale: 1.25 },
	};

	const config = directions[direction] || directions.left;
	const sizeConfig = sizes[size] || sizes.medium;

	return (
		<svg
			width={config.width * sizeConfig.scale}
			height={config.height * sizeConfig.scale}
			viewBox={config.viewBox}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d={config.path}
				stroke={color}
				strokeWidth="1.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default Arrow;
