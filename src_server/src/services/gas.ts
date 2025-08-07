import { isNumber } from 'lodash';
import money from 'helpers/money';
import tasks from 'awards/tasks';
import playerInventory from 'player/inventory';
import vehicleCtrl from 'vehicle';
import vehicleFuel from 'vehicle/fuel';
import Service from './service';
import { pay } from 'helpers/pay';
import hud from 'helpers/hud';
import inventoryHelper from 'basic/inventory/helper';
import {
	getVehicleDisplayName,
	getVehicleFuelType,
	getVehicleType
} from 'vehicle/afiseazamodel';

type Basket = {
	diesel: number;
	benzina: number;
	electricitate: number;
	kerosen: number;
	jerrycan: number;
};

const prices = {
	diesel: 15,
	benzina: 18,
	electricitate: 20,
	kerosen: 25,
	jerrycan: 400
};

class Gas extends Service {
	constructor() {
		super('gas', { name: 'Benzinarie', model: 361, color: 78, scale: 0.75 }, 5);
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'Gas-Buy': this.buy.bind(this),
			'Gas-FillJerrycan': this.fillJerrycan.bind(this)
		});
	}

	onKeyPress(player: Player) {
		const { vehicle } = player.mp;
		if (!vehicle) return;

		const fuelType = this.getFuelType(vehicle);
		const vehicleModel = this.getVehicleName(vehicle); // "BW M2 F87"
		const vehicleClass = this.getVehicleType(vehicle); // "sport"

		const fuel = vehicle.getVariable('fuel');
		const fuelLevel = fuel?.current || 0;
		const fuelMax = fuel?.max || 100;
		const fuelPercent = Math.floor((fuelLevel / fuelMax) * 100);

		console.log(`[DEBUG] Fuel: ${fuelType}, Name: ${vehicleModel}, Class: ${vehicleClass}, FuelLevel: ${fuelPercent}%`);

		player.callEvent('Gas-ShowMenu', {
			fuelType,
			fuelLevel: fuelPercent,
			vehicleModel,
			vehicleClass,
			prices
		});
	}

	private getPricePerLiter(type: string): number {
		return prices[type as keyof typeof prices] || 0;
	}

	private getFullPrice(basket: Basket, fuelType: string): number {
		let fullPrice = 0;

		Object.entries(basket).forEach(([product, count]) => {
			if (!prices[product] || !isNumber(count) || count < 0 || count > 10000)
				throw new SilentError('wrong product');

			const price =
				product === 'fuel' ? this.getPricePerLiter(fuelType) : prices[product];

			fullPrice += price * count;
		});

		return fullPrice;
	}

	private getFuelType(vehicle: VehicleMp): string {
		return getVehicleFuelType(vehicle);
	}

	private getVehicleName(vehicle: VehicleMp): string {
		return getVehicleDisplayName(vehicle);
	}

	private getVehicleType(vehicle: VehicleMp): string {
		return getVehicleType(vehicle);
	}

	private checkInventorySlots(player: Player, basket: Basket) {
		const items = Object.entries(basket).map(([name, amount]) => ({ name, amount }));
		playerInventory.checkEnoughSlots(player, items);
	}

//	private addToInventory(player: Player, basket: Basket) {
//		Object.entries(basket).forEach(([name, amount]) => {
//			if (name !== 'fuel' && amount) {
//				playerInventory.addItem(player, { name, amount });
//			}
//		});
//	}


private addToInventory(player: Player, basket: Basket) {
  if (basket.jerrycan > 0) {
    playerInventory.addItem(player, { name: 'jerrycan', amount: basket.jerrycan });
  }

  // Adaugă și alte iteme fizice dacă ai, ex:
  // if (basket.repair_kit > 0) {
  //   playerInventory.addItem(player, { name: 'repair_kit', amount: basket.repair_kit });
  // }
}



private async fillJerrycan(player: Player, fuelType: string, payment: PaymentType) {
	if (fuelType === 'electricitate') {
		hud.showNotification(player, 'error', 'Nu poți umple canistra cu electricitate', true);
		return;
	}

	const inventory = player.inventory;
	const emptyJerrycan = inventoryHelper.findItem(inventory, 'jerrycan');

	if (!emptyJerrycan) {
		hud.showNotification(player, 'error', 'Nu ai nicio canistră goală', true);
		return;
	}

	const prices: Record<string, number> = {
		diesel: 200,
		benzina: 250,
		kerosen: 300
	};

	const price = prices[fuelType];
	if (!price) {
		hud.showNotification(player, 'error', 'Tip de combustibil invalid', true);
		return;
	}

	const success = await pay(player, payment, price, 'gas-jerrycan');
	if (!success) return;

	inventoryHelper.changeItemAmount(inventory, emptyJerrycan, -1);

	await playerInventory.addItem(player, {
		name: 'canistraplina',
		amount: 1,
		data: { fuelType }
	});

	hud.showNotification(player, 'success', `Ai umplut canistra cu ${fuelType.toUpperCase()}`, true);
}








private async buy(player: Player, basket: Basket, payment: PaymentType) {
	const { vehicle } = player.mp;
	const fuelType = this.getFuelType(vehicle);
	const price = this.getFullPrice(basket, fuelType);

	console.log(`[DEBUG] Incepe cumpararea | FuelType: ${fuelType}, Price: ${price}, Basket:`, basket);

	try {
		const invalidFuel = Object.entries(basket).find(
			([key, value]) =>
				key !== 'jerrycan' &&
				key !== fuelType &&
				value > 0
		);

		if (invalidFuel) {
			hud.showNotification(player, 'error', 'COMBUSTIBIL INCOMPATIBIL', true);
			return;
		}

		this.checkInventorySlots(player, basket);
		console.log('[DEBUG] Verificare sloturi inventar OK');

		// ✅ Verificăm dacă are bani
		const success = await pay(player, payment, price, 'gas');
		if (!success) return;

		console.log('[DEBUG] Plata efectuata cu succes');

		const litres = basket[fuelType as keyof Basket] || 0;

		if (litres > 0 && vehicle && player.isDriver()) {
			console.log(`[DEBUG] Adaug combustibil: ${litres}`);
			await vehicleFuel.fillUp(player, litres);
			await tasks.implement(player, 'refuel');
			console.log('[DEBUG] Combustibil adaugat + task completat');
		} else {
			console.log(`[DEBUG] NU adauga combustibil | litres: ${litres}, vehicle valid: ${!!vehicle}, isDriver: ${player.isDriver()}`);
		}

		this.addToInventory(player, basket);
		console.log('[DEBUG] Itemele din cos au fost adaugate in inventar');
	} catch (err) {
		console.log('[DEBUG] Eroare in buy:', err);
	}
}




}

const service = new Gas();
