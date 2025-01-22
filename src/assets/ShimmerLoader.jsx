import React from 'react';

const ShimmerLoader = () => {
    return (
        <div className="metric-key-content relative overflow-hidden bg-[#1a1b1e] rounded-lg p-4">
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.05)] to-transparent"
                    style={{
                        backgroundSize: '50% 100%',
                    }}
                />
            </div>

            {/* Content structure */}
            <div className="relative z-10 flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#2c2d30] flex items-center justify-center">
                    <span className="opacity-50">🤑</span>
                </div>
                <span className="text-gray-300">Average Price</span>
            </div>
            <div className="text-gray-400 text-lg">Loading...</div>
        </div>
    );
};

export default ShimmerLoader;