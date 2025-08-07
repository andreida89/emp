import React from 'react';
export default function Fuel({ amount }: { amount: number }) {
    let fuelClass = "fuelbar-full";
    let iconClass = "fuel-full";
    if (amount <= 25) {
        fuelClass = "fuelbar-empty";
        iconClass = "fuel-empty";
    } else if (amount <= 75) {
        fuelClass = "fuelbar-half";
        iconClass = "fuel-half";
    }
    return (
        <div id="fuel-container">
            <div id="fuel-gauge-bg">
                <div
                    id="fuel-level"
                    className={fuelClass}
                    style={{ height: `${amount}%` }}
                />
            </div>
            {/* SVG Fuel icon */}
            <svg id="fuel-icon" className={iconClass + " indicator-icon"} xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    d="M16 3v4a1 1 0 001 1h3l-1 12a2 2 0 01-2 2h-8a2 2 0 01-2-2l-1-12h3a1 1 0 001-1V3" />
                <rect width="6" height="8" x="9" y="7" rx="1" fill="currentColor" />
            </svg>
        </div>
    );
}
