import React from 'react';
import VolumeByOptionKindChart from '../components/ForMetricsPage/ForVolume/VolumeByOptionKindChart';
import VolumeByExpirationChart from "../components/ForMetricsPage/ForVolume/VolumeByExpirationChart.jsx";
import VolumeByStrikePriceChart from "../components/ForMetricsPage/ForVolume/VolumeByStrikePriceChart.jsx";
import TopTradedOptionsChart from "../components/ForMetricsPage/ForVolume/TopTradedOptionsChart.jsx";
import "./Volume.css"
import '../components/ForMetricsPage/StandartStyle.css';


const Volume = () => {
    return (
        <div>
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
