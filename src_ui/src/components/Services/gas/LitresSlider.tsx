import React from 'react';

type Props = {
	value: number; // aici value este fuelLevel actual (0-100)
	onChange: (val: number) => void;
};

export default function LitresSlider({ value, onChange }: Props) {
	return (
		<div className="gas-litres-slider">
			<input
				type="range"
				min={value}
				max={100}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="slider"
				id="litresRange"
			/>
			<span className="gas-litres-value" id="litresOut">{value}%</span>
		</div>
	);
}
