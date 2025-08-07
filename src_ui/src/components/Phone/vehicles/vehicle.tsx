import React from 'react';
import vehicles from 'data/vehicles.json';
import Navigation from '../partials/navigation';
import Button from '../partials/button';
import Group from '../partials/group';
import { VehicleData } from './index';

type Props = {
	data: VehicleData;

	getPosition: () => void;
	spawn: () => void;
	despawn: () => void;
	close: () => void;
};

export default function Vehicle({ data, getPosition, spawn, despawn, close }: Props) {
	let km = "0 km";
	if (data.mileage != null) {
		km = (parseInt(data.mileage) / 100).toString() + " km";
	}
	
	return (
		<div className="vehicles_vehicle">
			<Navigation close={{ title: 'Vehicul', onClick: close }} />

			<Group className="vehicles_vehicle-info">
				<Button current={(vehicles as any)[data.model] ?? data.model}>Nume</Button>
				<Button current={data.govNumber || 'Absent'}>Nr. Inmatriculare</Button>
				<Button current={km}>Kilometraj</Button>
			</Group>

			<Group className="vehicles_vehicle-actions">
				<Button color="blue" onClick={spawn}>
					Livreaza pentru 80 RON
				</Button>

				{data.spawned && (
					<Button color="red" onClick={despawn}>
						Parcheaza
					</Button>
				)}

				<Button color="blue" onClick={getPosition}>
					Locatia vehiculului
				</Button>
			</Group>
		</div>
	);
}
