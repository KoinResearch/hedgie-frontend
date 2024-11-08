import React from 'react';
import OpenInterestChart from "../components/ForMetricsPage/ForOpenInterest/OpenInterestChart.jsx";
import OpenInterestByExpirationChart from "../components/ForMetricsPage/ForOpenInterest/OpenInterestByExpirationChart.jsx";
import OpenInterestByStrikeChart from "../components/ForMetricsPage/ForOpenInterest/OpenInterestByStrikeChart.jsx";
import DeltaAdjustedOpenInterestChart from "../components/ForMetricsPage/ForOpenInterest/DeltaAdjustedOpenInterestChart.jsx";
import MaxPainByExpirationChart from "../components/ForMetricsPage/ForOpenInterest/MaxPainByExpirationChart.jsx";
import HistoricalOpenInterestChart from "../components/ForMetricsPage/ForOpenInterest/HistoricalOpenInterestChart.jsx";
import '../components/ForMetricsPage/StandartStyle.css';
import './OpenInterest.css';
import ErrorBoundary from './errors/ErrorBoundary';

const OpenInterest = () => {
    return (
        <div>
            <div className="rounded-container">
                <ErrorBoundary>
                    <OpenInterestChart />
                </ErrorBoundary>
            </div>
            <div className="rounded-container">
                <ErrorBoundary>
                    <OpenInterestByExpirationChart />
                </ErrorBoundary>
            </div>
            <div className="rounded-container">
                <ErrorBoundary>
                    <OpenInterestByStrikeChart />
                </ErrorBoundary>
            </div>
            <div className="rounded-container">
                <ErrorBoundary>
                    <DeltaAdjustedOpenInterestChart />
                </ErrorBoundary>
            </div>
            <div className="rounded-container">
                <ErrorBoundary>
                    <HistoricalOpenInterestChart />
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default OpenInterest;
