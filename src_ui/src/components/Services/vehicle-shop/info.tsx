import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';

const Icons = {
  Package: ({ size = 12, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
  ),
  Droplet: ({ size = 12, color = "currentColor" }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
  )
};

type Props = {
	model: string;
};
type State = {
	tank: number;
	trunk: {
		cells: number;
		slots: number;
	};
};

export default function VehicleShopInfo({ model }: Props) {
	const [state, setState] = useState<State>({
		tank: 0,
		trunk: { cells: 0, slots: 0 }
	});

	useEffect(() => {
		rpc
			.callServer('Vehicle-GetInfo', model)
			.then(({ tank, trunk }: State) => setState({ tank, trunk }));
	}, [model]);

	return (
		<div className="vshop-capacity-row">
			<div className="vshop-cap-card">
				<span><Icons.Package /> Portbagaj</span>
				<strong>{state.trunk.slots} KG</strong>
			</div>
			<div className="vshop-cap-card">
				<span><Icons.Droplet /> Rezervor</span>
				<strong>{state.tank} L</strong>
			</div>
		</div>
	);
}
