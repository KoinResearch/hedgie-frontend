// src/subpages/Volume.jsx
import React from 'react';
import VolumeByOptionKindChart from '../components/ForMetricsPage/ForVolume/VolumeByOptionKindChart';
import VolumeByExpirationChart from "../components/ForMetricsPage/ForVolume/VolumeByExpirationChart.jsx";
import VolumeByStrikePriceChart from "../components/ForMetricsPage/ForVolume/VolumeByStrikePriceChart.jsx";
import TopTradedOptionsChart from "../components/ForMetricsPage/ForVolume/TopTradedOptionsChart.jsx";
const Volume = () => {
    return (
        <div>
            <h1 className="page-title">Volume</h1>
            <div>
                <VolumeByOptionKindChart/>
            </div>
            <div>
                <VolumeByExpirationChart/>
            </div>
            <div>
                <VolumeByStrikePriceChart/>
            </div>
            <div>
                <TopTradedOptionsChart/>
            </div>
        </div>
    );
};

export default Volume;
