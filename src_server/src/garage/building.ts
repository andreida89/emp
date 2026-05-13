const markerData = {
    color: [242, 186, 0, 150] as [number, number, number, number],
    scale: 1,
    type: 36 // car marker
};

export const blipColors: Record<string, number> = {
    'civil': 3,
    'politie': 38,
    'umu': 1,
    'boat': 3,
    'boat_politie': 38,
    'truck': 5,
    'plane': 5,
    'heli': 5,
    'heli_politie': 38,
    'heli_umu': 1,
    'kart': 5,
    'formula1': 5
};

export const blipModels: Record<string, number> = {
    'civil': 50,
    'politie': 50,
    'umu': 50,
    'boat': 427,
    'boat_politie': 427,
    'truck': 477,
    'plane': 423,
    'heli': 43,
    'heli_politie': 43,
    'heli_umu': 43,
    'kart': 523,
    'formula1': 523
};

class GarageBuilding {
	create(data: GarageEntity) {
		const pos = new mp.Vector3(data.position.x, data.position.y, data.position.z);
		
		const colshape = mp.colshapes.create(
			pos,
			4.0,
			{
				onKeyPress: (player) => {
					if (player.mp.vehicle && player.mp.seat !== 0) return;
					mp.events.call('Garage-ShowMenu', player.mp)
				}
			},
			{ dimension: 0, data: data.index }
		);

		return {
			colshape
		};
	}
}

export default new GarageBuilding();
