import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';

const Icons = {
  Gauge: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
  ),
  Zap: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Disc: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Activity: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  )
};

const items: { [name: string]: { label: string, icon: React.ReactNode } } = {
    speed: { label: 'VITEZA', icon: <Icons.Gauge /> },
    acceleration: { label: 'ACCELERATIE', icon: <Icons.Zap /> },
    brakes: { label: 'FRANARE', icon: <Icons.Disc /> },
    clutch: { label: 'MANEVRABILITATE', icon: <Icons.Activity /> }
};

type Props = {
	model: string;
};
type State = {
	speed: number;
	acceleration: number;
	brakes: number;
	clutch: number;
};

export default function VehicleShopSpec({ model }: Props) {
	const [state, setState] = useState<State>({
		speed: 0,
		acceleration: 0,
		brakes: 0,
		clutch: 0
	});

	useEffect(() => {
		rpc.callClient('Vehicle-GetSpec', model).then((data: State) => setState(data));
	}, [model]);

	return (
		<div className="vshop-stats-grid">
			{Object.entries(state).map(([name, value]) => {
				const item = items[name];
				if (!item) return null;
				return (
					<div className="vshop-stat-item" key={name}>
						<div className="vshop-stat-info">
							<span>{item.icon} {item.label}</span>
							<strong>{value}%</strong>
						</div>
						<div className="vshop-bar-container">
							<div className="vshop-bar-fill" style={{ width: `${value}%` }} />
						</div>
					</div>
				);
			})}
		</div>
	);
}
