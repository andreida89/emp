import vehicleCtrl from 'vehicle';

const player = mp.players.local;

class Gas {
	constructor() {
		mp.events.subscribe({
			'Gas-ShowMenu': this.showMenu.bind(this),
			'Gas-CloseMenu': this.closeMenu
		});
	}

	private showMenu(data: any) {
		const payload = Array.isArray(data) ? data[0] : data;

		// Debug direct în chat
		mp.gui.chat.push(`[CLIENT][DEBUG] Gas menu received`);
		mp.gui.chat.push(`FuelType: ${payload.fuelType}`);
		mp.gui.chat.push(`FuelLevel: ${payload.fuelLevel}%`);
		mp.gui.chat.push(`VehicleModel: ${payload.vehicleModel}`);
		mp.gui.chat.push(`VehicleClass: ${payload.vehicleClass}`);

		const {
			fuelType,
			fuelLevel,
			vehicleModel,
			vehicleClass,
			prices
		} = payload;

		const { vehicle } = player;
		if (vehicle) vehicle.freezePosition(true);

mp.browsers.showPage(
	'gas',
	{
		type: fuelType,
		prices,
		fuel: { current: fuelLevel, max: 100 }, // adaugă `max` ca să nu fie undefined
		vehicleModel,
		vehicleClass,
		fuelLevel,
		fuelType
	},
	true,
	true
);

	}

	private closeMenu() {
		const { vehicle } = player;

		if (vehicle) vehicle.freezePosition(false);

		mp.browsers.hidePage();
	}
}

const gas = new Gas();
