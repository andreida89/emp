import factions from 'factions';
import owning from './owning';
import passengers from './passengers';
import VehicleModel from 'models/Vehicle';

class VehicleDespawn {
	private despawnTimeout: number;

	constructor() {
		this.despawnTimeout = 1;

		mp.events.subscribe({
			'Vehicle-DespawnItem': this.despawnByPlayer.bind(this)
		});
	}

	despawnFactionsVehicles() {
		Object.values(factions.items).forEach(({ garage }) => {
			if (!garage) return;

			garage.vehicles.forEach((vehicle) => {
				if (vehicle.despawnAt && Date.now() >= vehicle.despawnAt) {
					garage.despawnVehicle(vehicle);
				}
			});
		});
	}

	despawnPlayerVehicles(player: Player) {
		player.vehicles.forEach((item) => this.removeVehicle(mp.vehicles.getById(item)));
	}

	private despawnByPlayer(player: Player, id: string) {
		const vehicle = mp.vehicles.getById(id);
		const error = this.checkErrors(player, vehicle);

		if (error) return mp.events.reject(error);

		mp.players.withTimeout(
			player.mp,
			() => {
				player.mp.setOwnVariable('vehicleDespawn', false);

				if (this.checkErrors(player, vehicle)) return;

				this.removeVehicle(vehicle);
			},
//			this.despawnTimeout * 60 * 1000
this.despawnTimeout * 3000

);

		player.mp.setOwnVariable('vehicleDespawn', true);
	}

private removeVehicle(vehicle: VehicleMp) {
    if (!vehicle) return;

    // Oprește motorul logic pe entity
    vehicle.engine = false;

    // Deblochează și vehiculul (locked = false)
    vehicle.locked = false;

    // Trimiți la client să oprească efectiv motorul
    if (vehicle.getOccupant && vehicle.getOccupant(0)) {
        vehicle.getOccupant(0).call('ForceEngineOff', [vehicle.id]);
    }

    // Salvează și în DB
    if (vehicle.dbId) {
        VehicleModel.updateOne(
            { _id: vehicle.dbId },
            { 'state.engine': false, 'state.locked': false }
        ).exec();
    }

    // Șterge vehiculul DOAR la final!
    mp.vehicles.delete(vehicle);
}



private checkErrors(player: Player, vehicle: VehicleMp) {
    let error: string;
    let admin = player.getVariable && player.getVariable('adminLvl') || player.adminLvl || 0;

    if (!vehicle) error = 'Acest vehicul a fost deja parcat';
    else if (player.mp.getOwnVariable('vehicleDespawn')) error = 'Asteptati parcarea vehiculului';
    else if (!owning.isRealOwner(vehicle, player) && admin < 1)
        error = 'Nu sunteti proprietarul acestui vehicul';
    //else if (passengers.isExists(vehicle)) error = 'Exista un pasager in vehicul';

    return error;
}


}

export default new VehicleDespawn();
