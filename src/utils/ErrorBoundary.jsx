import React from 'react';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		console.error('Error caught by boundary:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div
					style={{
						color: '#f2f2f2',
						padding: '20px',
						textAlign: 'center',
						fontFamily: 'Paloseco, sans-serif',
					}}
				>
					Something went wrong with this component.
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
