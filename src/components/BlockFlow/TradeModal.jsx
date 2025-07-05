import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { calculateNetDebitOrCredit, formatNumber } from '../../utils/tradeCalculations.js';
import { calculateGreeks } from '../../utils/calculations.js';
import { useGreeksCalculation } from '../../hooks/useGreeksCalculation.js';
import './TradeModal.css';

const TradeModal = ({ trades, onClose }) => {
	const { isAuthenticated } = useAuth();
	const [analysis, setAnalysis] = useState('');
	const [errorAI, setErrorAI] = useState(null);
	const [loadingAI, setLoadingAI] = useState(false);
	const [showAnalysis, setShowAnalysis] = useState(false);

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		sessionStorage.setItem('hideMobileNavigation', 'true');
		window.dispatchEvent(new Event('hideMobileNavigationChange'));

		return () => {
			document.body.style.overflow = 'unset';
			sessionStorage.removeItem('hideMobileNavigation');
			window.dispatchEvent(new Event('hideMobileNavigationChange'));
		};
	}, []);

	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [onClose]);

	const { calculateOverallGreeks } = useGreeksCalculation();

	const getAnalysis = async (trades) => {
		setLoadingAI(true);
		try {
			console.log('Sending trades for analysis:', trades);
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/analyze`, { trades });
			console.log('AI Analysis response:', response.data);
			setAnalysis(response.data.analysis || 'No analysis available');
		} catch (error) {
			console.error('AI Analysis request error:', error);
			console.error('Error details:', error.response?.data);
			setAnalysis('Failed to get analysis');
		}
		setLoadingAI(false);
	};

	const handleAnalyzeClick = () => {
		setShowAnalysis(true);
		getAnalysis(trades);
	};

	const calculateOIChange = (trade) => {
		const size = trade.size ? parseFloat(trade.size) : 0;
		return trade.side === 'sell' ? size : 0;
	};

	const getExecutionDetails = (side, executionType) => {
		if (executionType === 'Below the ask') {
			return '(Market Maker PREVENTED liquidity by buying cheaper\nthan the market)';
		} else if (executionType === 'Above the bid') {
			return '(Market Maker PREVENTED liquidity by selling\nabove the market)';
		}
		return '';
	};

	const formatSize = (trades) => {
		const sizes = trades.map((trade) => {
			const size = trade.size ? parseFloat(trade.size).toFixed(1) : '0';
			const type = trade.instrument_name.endsWith('-C') ? 'C' : 'P';
			return `x${size}${type}`;
		});

		return `(${sizes.join('/')})`;
	};

	const formatTradeDetails = (trade) => {
		const instrumentName = trade.instrument_name || 'N/A';
		const size = trade.size ? parseFloat(trade.size).toFixed(1) : 'N/A';

		const sideBase = trade.side === 'buy' ? '🟢 Bought' : '🔴 Sold';
		const sideWithSize = `${sideBase} x${size}`;

		const executionType = trade.side === 'buy' ? 'Below the ask' : 'Above the bid';
		const executionMessage = getExecutionDetails(trade.side, executionType);
		const oiChange = calculateOIChange(trade);

		const premium = trade.premium ? parseFloat(trade.premium).toFixed(4) : 'N/A';
		const premiumUSD = trade.price ? parseFloat(trade.price).toLocaleString() : 'N/A';
		const premiumInBaseAsset = trade.price && trade.spot ? (parseFloat(trade.price) / trade.spot).toFixed(4) : 'N/A';
		const premiumAllInBaseAsset =
			trade.premium && trade.spot ? (parseFloat(trade.premium) / trade.spot).toFixed(4) : 'N/A';

		return `${sideWithSize} 🔷 ${instrumentName} 📈 at ${premiumInBaseAsset} Ξ ($${premiumUSD})
Total ${trade.side === 'buy' ? 'Bought' : 'Sold'}: ${premiumAllInBaseAsset} Ξ ($${premium}), IV: ${
			trade.iv || 'N/A'
		}%,  mark: ${trade.mark_price}
${executionType} ${executionMessage}
OI Change: ${oiChange}`;
	};

	const handleCopy = () => {
		const sizeText = formatSize(trades);
		const tradeDetailsText = trades.map((trade) => formatTradeDetails(trade)).join('\n\n');

		const liquidityNote = `
---- TRADE EXECUTION NOTE ----
When Market Maker PREVENTS liquidity:
• Below the ask - buying cheaper than the market
• Above the bid - selling above the market

When Market Maker PROVIDES liquidity:
• Below the ask - offering better prices for buyers
• Above the bid - offering better prices for sellers
`;

		const { delta: totalDelta, gamma: totalGamma, vega: totalVega, theta: totalTheta } = calculateOverallGreeks(trades);

		const greekDetailsText = `
---- OVERALL GREEKS ----
Δ: ${totalDelta.toFixed(4)}, Γ: ${totalGamma.toFixed(6)}, ν: ${totalVega.toFixed(2)}, Θ: ${totalTheta.toFixed(2)}

---- ADDITIONAL INFO ----
Block Trade ID: ${trades[0]?.blockTradeId}

-------------------------

* Delta (Δ): Represents the option's price change when the underlying asset changes by one unit.
* Gamma (Γ): Measures the rate of change of Delta as the underlying price changes.
* Vega (ν): Reflects the sensitivity of the option's price to changes in implied volatility.
* Theta (Θ): Indicates how the option price decreases over time due to time decay.
`;

		const copyText = `---- TRADE DETAILS ----\n\n${sizeText}\n\n${tradeDetailsText}\n\n${liquidityNote}\n${greekDetailsText}`;

		navigator.clipboard
			.writeText(copyText)
			.then(() => {
				alert('Data copied to clipboard!');
			})
			.catch((err) => {
				console.error('Error copying to clipboard: ', err);
				alert('Failed to copy data');
			});
	};

	if (!trades || trades.length === 0) return null;

	const { type, amount } = calculateNetDebitOrCredit(trades);
	const { delta: totalDelta, gamma: totalGamma, vega: totalVega, theta: totalTheta } = calculateOverallGreeks(trades);

	return (
		<div
			className="trade-modal"
			onClick={onClose}
		>
			<div
				className="trade-modal__content"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					className="trade-modal__close-button"
					onClick={onClose}
				>
					×
				</button>

				<div className="trade-modal__header">
					<h1 className="trade-modal__title">Trade Details</h1>
					<button
						className="trade-modal__copy-button"
						onClick={handleCopy}
					>
						Copy Data
					</button>
				</div>

				<div className="trade-modal__divider"></div>

				<div className="trade-modal__trade-details">{formatSize(trades)}</div>

				{trades.map((trade, index) => (
					<div
						key={index}
						className="trade-modal__trade-details"
					>
						{formatTradeDetails(trade)}
					</div>
				))}

				<p className="trade-modal__info-text">
					<span className="trade-modal__info-text--bold">{type}:</span> {amount} Ξ ($
					{trades[0]?.spot ? (parseFloat(amount) * trades[0].spot).toFixed(2) : 'N/A'})
				</p>

				<p className="trade-modal__info-text">
					<span className="trade-modal__info-text--bold">Overall Greeks:</span> <br />
					Δ: {totalDelta.toFixed(4)}, Γ: {totalGamma.toFixed(6)}, ν: {totalVega.toFixed(2)}, Θ: {totalTheta.toFixed(2)}
				</p>

				<p className="trade-modal__info-text">Block Trade ID: {trades[0].blockTradeId}</p>
			</div>

			{isAuthenticated && (
				<div
					className="trade-modal__analysis"
					onClick={(e) => e.stopPropagation()}
				>
					<h3 className="trade-modal__analysis-title">AI Analysis</h3>
					{!showAnalysis ? (
						<button
							className="trade-modal__analyze-trigger"
							onClick={(e) => {
								e.stopPropagation();
								handleAnalyzeClick();
							}}
						>
							Analyze Trade
						</button>
					) : loadingAI ? (
						<div className="trade-modal__analysis-loading">Analyzing trade...</div>
					) : (
						<div className="trade-modal__analysis-content">{analysis}</div>
					)}
				</div>
			)}
		</div>
	);
};

export default TradeModal;
