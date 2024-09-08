import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BlockTradeCount = ({ currency }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/block-trades/${currency}`);
                setCount(response.data.uniqueBlockTrades);
            } catch (error) {
                console.error('Error fetching block trade count:', error);
            }
        };

        fetchData();
    }, [currency]);

    return (
        <div>
            <h3>Total Unique Block Trades: {count}</h3>
        </div>
    );
};

export default BlockTradeCount;
