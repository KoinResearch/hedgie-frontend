import React from 'react';
import BTCETHOptionFlow from '../components/ForMetricsPage/BTCETHOptionFlow';
import BTCETHBlockTrades from '../components/ForMetricsPage/BTCETHBlockTrades';
import MaxPainByExpiration from '../components/ForMetricsPage/MaxPainByExpiration';
import OptionVolumeChart from '../components/ForMetricsPage/OptionVolumeChart';
import StrikeActivityChart from "../components/ForMetricsPage/StrikeActivityChart";
import ExpirationActivityChart from "../components/ForMetricsPage/ExpirationActivityChart";
import TimeDistributionChart from "../components/ForMetricsPage/TimeDistributionChart";
import KeyMetrics from "../components/ForMetricsPage/KeyMetrics";
import './Metrics.css';

const MetricsPage = () => {
    return (
        <div className="metrics-page-container">
            <h1 className="page-title">Key Metrics Dashboard</h1>
            <div className="flow-row">
                <div className="rounded-container">
                    <BTCETHOptionFlow asset="BTC"/>
                </div>
                <div className="rounded-container">
                    <BTCETHBlockTrades asset="ETH"/>
                </div>
            </div>
            <div className="flow-row">
                <div className="rounded-container">
                    <MaxPainByExpiration/>
                </div>
                <div className="rounded-container">
                    <OptionVolumeChart/>
                </div>
            </div>
            <div className="flow-row">
                <div className="rounded-container">
                    <StrikeActivityChart/>
                </div>
                <div className="rounded-container">
                    <ExpirationActivityChart/>
                </div>
            </div>
            <div className="flow-row">
                <div className="full-width-container">
                    <TimeDistributionChart/>
                </div>
            </div>
            <div className="flow-row">
                <div className="full-width-container">
                    <KeyMetrics/>
                </div>
            </div>
        </div>
    );
};

export default MetricsPage;
