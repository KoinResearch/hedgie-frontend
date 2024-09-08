import React from 'react';
import "./AssetSwitcher.css";

const AssetSwitcher = ({ selectedAsset, onChange }) => {
    return (
        <select value={selectedAsset} onChange={(e) => onChange(e.target.value)}>
            <option value="BTC">Bitcoin</option>
            <option value="ETH">Ethereum</option>
        </select>
    );
};

export default AssetSwitcher;
