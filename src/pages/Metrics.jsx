import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import ErrorBoundary from '../utils/ErrorBoundary';
import { metricsPageConfig } from '../config/metricsPageConfig';
import './Metrics.css';

const metricsConfig = metricsPageConfig;

const Dashboard = ({ type }) => {
	const config = metricsConfig[type];

	if (!config) {
		return <div className="metrics__error">Dashboard type not found</div>;
	}

	return (
		<div className="metrics__dashboard">
			{config.showTitle && <h1 className="metrics__title">{config.title}</h1>}
			<div className="metrics__content">
				{config.components.map((component, index) => {
					const { Component, props = {}, fullWidth = false, withErrorBoundary = false } = component;

					return (
						<div
							key={index}
							className={`metrics__item ${fullWidth ? 'metrics__item--full-width' : ''}`}
						>
							{withErrorBoundary ? (
								<ErrorBoundary>
									<Component {...props} />
								</ErrorBoundary>
							) : (
								<Component {...props} />
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

const Metrics = () => {
	const sidebarItems = Object.entries(metricsConfig).map(([key, config]) => ({
		key,
		path: config.path,
		name: config.name,
	}));

	return (
		<div className="metrics">
			<Sidebar items={sidebarItems} />
			<div className="metrics__divider"></div>
			<div className="metrics__main">
				<Routes>
					<Route
						path="/"
						element={<Dashboard type="overview" />}
					/>
					<Route
						path="/overview"
						element={<Dashboard type="overview" />}
					/>
					{Object.entries(metricsConfig).map(([key, config]) => (
						<Route
							key={key}
							path={config.path}
							element={<Dashboard type={key} />}
						/>
					))}
				</Routes>
			</div>
		</div>
	);
};

export default Metrics;
