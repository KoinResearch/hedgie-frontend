import React from 'react';
import './Skeleton.css';

const SkeletonLoader = ({ height = '100%', width = '100%', margin, ...props }) => {
	return (
		<div
			className="skeleton-loader"
			style={{
				height,
				width,
				margin,
				...props.style,
			}}
			{...props}
		/>
	);
};

export default SkeletonLoader;
