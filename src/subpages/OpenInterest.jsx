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

const OpenInterest = () => {
    return (
        <div>
            <h1 className="page-title">Open Interest</h1>
            <div>
                <OpenInterestChart/>
            </div>
            <div>
                <OpenInterestByExpirationChart/>
            </div>
            <div>
                <OpenInterestByStrikeChart/>
            </div>
            <div>
                <DeltaAdjustedOpenInterestChart/>
            </div>
            <div>
                <MaxPainByExpirationChart/>
            </div>
            <div>
                <HistoricalOpenInterestChart/>
            </div>
        </div>
    );
};

export default OpenInterest;
