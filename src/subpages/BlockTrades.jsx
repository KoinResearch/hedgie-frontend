// src/subpages/BlockTrades.jsx
import React from 'react';
import BTCETHBlockTrades from "../components/ForMetricsPage/ForForBlockTrades/BTCETHBlockTrades.jsx";
import MaxPainByExpirationBlockTrades
    from "../components/ForMetricsPage/ForForBlockTrades/MaxPainByExpirationBlockTrades.jsx";
import OptionVolumeChartBlockTrades
    from "../components/ForMetricsPage/ForForBlockTrades/OptionVolumeChartBlockTrades.jsx";
import StrikeActivityChartBlockTrades
    from "../components/ForMetricsPage/ForForBlockTrades/StrikeActivityChartBlockTrades.jsx";
import ExpirationActivityChartBlockTrades
    from "../components/ForMetricsPage/ForForBlockTrades/ExpirationActivityChartBlockTrades.jsx";
import TimeDistributionChartBlockTrades
    from "../components/ForMetricsPage/ForForBlockTrades/TimeDistributionChartBlockTrades.jsx";
import KeyMetricsBlockTrades from "../components/ForMetricsPage/ForForBlockTrades/KeyMetricsBlockTrades.jsx";
import TopTradesByVolumeBlockTrades
    from "../components/ForMetricsPage/ForForBlockTrades/TopTradesByVolumeBlockTrades.jsx";
import '../components/ForMetricsPage/StandartStyle.css';
import KeyMetrics from "../components/ForMetricsPage/ForOverview/KeyMetrics.jsx";

const BlockTrades = () => {
    return (
        <div>
            <h1 className="page-title">Block Trades Key Metrics Dashboard</h1>
            <div className="full-width-container">
                <KeyMetricsBlockTrades/>
            </div>
            <div className="flow-row">
                <div className="rounded-container">
                    <BTCETHBlockTrades asset="BTC"/>
                </div>
                <div className="rounded-container">
                    <MaxPainByExpirationBlockTrades/>
                </div>
                <div className="rounded-container">
                    <OptionVolumeChartBlockTrades/>
                </div>
                <div className="rounded-container">
                    <TopTradesByVolumeBlockTrades/>
                </div>
                <div className="rounded-container">
                    <StrikeActivityChartBlockTrades/>
                </div>
                <div className="rounded-container">
                    <ExpirationActivityChartBlockTrades/>
                </div>
                <div className="full-width-container">
                    <TimeDistributionChartBlockTrades/>
                </div>
            </div>
        </div>
    );
};

export default BlockTrades;
