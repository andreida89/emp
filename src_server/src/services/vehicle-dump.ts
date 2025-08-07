import VehicleModel from 'models/Vehicle';
import hud from 'helpers/hud';
import money from 'helpers/money';
import vehicleOwning from 'vehicle/owning';
import vehicles from 'data/vehicles.json';
import Service from './service';
import { pay } from 'helpers/pay';


class VehicleDump extends Service {
	constructor() {
		super('vehicle_dump', { name: 'R.E.M.A.T', model: 380, color: 21 }, 4);
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'VehicleDump-Recycle': this.recycleVehicle.bind(this)
		});
	}

	onKeyPress(player: Player) {
		const { vehicle } = player.mp;

		if (!vehicleOwning.isRealOwner(vehicle, player)) {
			return hud.showNotification(player, 'error', 'Urcati in vehiculul personal');
		}

		player.callEvent('VehicleDump-ShowMenu', [vehicle.name, this.getPrice(vehicle)]);
	}

//	private getPrice(vehicle: VehicleMp) {
//		return vehicle ? (vehicles[vehicle.name].price / 100) * 40 : 0;
//	}
private getPrice(vehicle: VehicleMp) {
	const basePrice = vehicles[vehicle.name]?.price ?? 10000;
	return (basePrice / 100) * 40;
}

	private async recycleVehicle(player: Player) {
		const { vehicle } = player.mp;
		const cost = this.getPrice(vehicle);

		if (!cost) throw new SilentError("vehicle doesn't have price");

		await VehicleModel.findByIdAndDelete(vehicle.dbId);
		player.vehicles = player.vehicles.filter((item) => item !== vehicle.dbId);
		mp.vehicles.delete(vehicle);

		await money.change(player, 'bank', cost, 'vehicle recycle');
		//await pay(player, 'cash', cost, 'remat'); 

	}
}

const service = new VehicleDump();
