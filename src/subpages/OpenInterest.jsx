// src/subpages/OpenInterest.jsx
import React from 'react';
import OpenInterestChart from "../components/ForMetricsPage/ForOpenInterest/OpenInterestChart.jsx";
import OpenInterestByExpirationChart
    from "../components/ForMetricsPage/ForOpenInterest/OpenInterestByExpirationChart.jsx";
import OpenInterestByStrikeChart from "../components/ForMetricsPage/ForOpenInterest/OpenInterestByStrikeChart.jsx";
import DeltaAdjustedOpenInterestChart
    from "../components/ForMetricsPage/ForOpenInterest/DeltaAdjustedOpenInterestChart.jsx";
import MaxPainByExpirationChart from "../components/ForMetricsPage/ForOpenInterest/MaxPainByExpirationChart.jsx";
import HistoricalOpenInterestChart from "../components/ForMetricsPage/ForOpenInterest/HistoricalOpenInterestChart.jsx";
import '../components/ForMetricsPage/StandartStyle.css';
import './OpenInterest.css';

const OpenInterest = () => {
    return (
        <div>
            <div className="rounded-container">
                <OpenInterestChart/>
            </div>
            <div className="rounded-container">
                <OpenInterestByExpirationChart/>
            </div>
            <div className="rounded-container">
                <OpenInterestByStrikeChart/>
            </div>
            <div className="rounded-container">
                <DeltaAdjustedOpenInterestChart/>
            </div>
            <div className="rounded-container">
                <MaxPainByExpirationChart/>
            </div>
            <div className="rounded-container">
                <HistoricalOpenInterestChart/>
            </div>
        </div>
    );
};

export default OpenInterest;
