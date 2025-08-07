import vehiclesJson from 'data/vehicles.json';
type VehicleEntry = typeof vehiclesJson[keyof typeof vehiclesJson];

// Build a hash-based map once for fast lookup
const vehicleHashMap: Record<number, VehicleEntry> = {};

for (const model in vehiclesJson) {
	const trimmedModel = model.trim(); // eliminate orice spații
	const hash = mp.joaat(trimmedModel);
	vehicleHashMap[hash] = vehiclesJson[model];

	console.log(`[DEBUG] Mapped ${trimmedModel} → hash: ${hash}`);
}

export function getVehicleFuelType(vehicle: VehicleMp): string {
	const data = vehicleHashMap[vehicle.model];
	if (!data) {
		console.log(`[DEBUG] FuelType: Vehicle model hash not found → ${vehicle.model}`);
		return 'necunoscut';
	}
	console.log(`[DEBUG] FuelType: ${data.fuel} for hash ${vehicle.model}`);
	return data.fuel;
}

export function getVehicleDisplayName(vehicle: VehicleMp): string {
	const data = vehicleHashMap[vehicle.model];
	if (!data) {
		console.log(`[DEBUG] DisplayName: Vehicle model hash not found → ${vehicle.model}`);
		return 'necunoscut';
	}
	console.log(`[DEBUG] DisplayName: ${data.name} for hash ${vehicle.model}`);
	return data.name;
}

export function getVehicleType(vehicle: VehicleMp): string {
	const data = vehicleHashMap[vehicle.model];
	if (!data) {
		console.log(`[DEBUG] Type: Vehicle model hash not found → ${vehicle.model}`);
		return 'necunoscut';
	}
	console.log(`[DEBUG] Type: ${data.type} for hash ${vehicle.model}`);
	return data.type;
}

/**
 * Optional: Get full info object
 */
export function getVehicleInfo(vehicle: VehicleMp): VehicleEntry | undefined {
	return vehicleHashMap[vehicle.model];
}