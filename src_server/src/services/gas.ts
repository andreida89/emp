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
	electric: number;
	kerosen: number;
	jerrycan: number;
};

const prices = {
	diesel: 15,
	benzina: 18,
	electric: 20,
	kerosen: 25,
	jerrycan: 400
};

class Gas extends Service {
	constructor() {
		super('gas', { name: 'Benzinarie', model: 361, color: 78, scale: 0.75 }, 5);
	}

	load() {
		// Do not load old static gas stations to avoid duplicate interaction points and blips
		console.log('[Gas] Static gas stations loading disabled.');
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'Gas-Buy': this.buy.bind(this),
			'Gas-FillJerrycan': this.fillJerrycan.bind(this)
		});
	}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) {
			return hud.showNotification(player, 'error', 'Trebuie sa te dai jos din masina pentru a putea alimenta!', true);
		}

		const vehicle = this.getClosestVehicle(player, 5.0);
		if (!vehicle) {
			return hud.showNotification(player, 'error', 'Nu a fost gasit niciun vehicul in apropiere!', true);
		}

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

	private getClosestVehicle(player: Player, range: number): VehicleMp | null {
		const pos = player.mp.position;
		let closest: VehicleMp | null = null;
		let minDist = range;

		mp.vehicles.forEach((v) => {
			if (!v || !mp.vehicles.exists(v)) return;
			const dist = player.mp.dist(v.position);
			if (dist < minDist) {
				minDist = dist;
				closest = v;
			}
		});

		return closest;
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
	if (fuelType === 'electric') {
		// hud.showNotification(player, 'error', 'Nu poți umple canistra cu electricitate', true);
		return 'Nu poți umple canistra cu electricitate';
	}

	const inventory = player.inventory;
	const emptyJerrycan = inventoryHelper.findItem(inventory, 'jerrycan');

	if (!emptyJerrycan) {
		// hud.showNotification(player, 'error', 'Nu ai nicio canistră goală', true);
		return 'Nu ai nicio canistră goală';
	}

	const prices: Record<string, number> = {
		diesel: 200,
		benzina: 250,
		kerosen: 300
	};

	const price = prices[fuelType];
	if (!price) {
		// hud.showNotification(player, 'error', 'Tip de combustibil invalid', true);
		return 'Tip de combustibil invalid';
	}

	if (payment === 'cash') {
		const cashAmount = player.inventory
			.filter(i => i.name === 'ron')
			.reduce((acc, i) => acc + i.amount, 0);
		if (cashAmount < price) return 'Nu ai suficienti bani cash (RON)';
	} else {
		if (player.money[payment as keyof PlayerMoney] < price) return 'Fonduri bancare insuficiente';
	}

	const success = await pay(player, payment, price, 'gas-jerrycan');
	if (!success) return 'Tranzactie respinsa';

	inventoryHelper.changeItemAmount(inventory, emptyJerrycan, -1);

	await playerInventory.addItem(player, {
		name: 'canistraplina',
		amount: 1,
		data: { fuelType }
	});

	// hud.showNotification(player, 'success', `Ai umplut canistra cu ${fuelType.toUpperCase()}`, true);
	return true;
}








private async buy(player: Player, basket: Basket, payment: PaymentType) {
	if (player.mp.vehicle) {
		return 'Trebuie sa fii in afara vehiculului!';
	}

	let { vehicle } = player.mp;
	if (!vehicle) {
		vehicle = this.getClosestVehicle(player, 5.0);
	}

	if (!vehicle && (basket.diesel > 0 || basket.benzina > 0 || basket.electric > 0 || basket.kerosen > 0)) {
		return 'Nu a fost gasit niciun vehicul in apropiere';
	}

	const fuelType = vehicle ? this.getFuelType(vehicle) : 'benzina'; // default if only buying jerrycan
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
			return 'COMBUSTIBIL INCOMPATIBIL';
		}

		try {
			this.checkInventorySlots(player, basket);
		} catch(e) {
			return 'Nu ai destul spațiu în inventar';
		}
		console.log('[DEBUG] Verificare sloturi inventar OK');

		if (payment === 'cash') {
			const cashAmount = player.inventory
				.filter(i => i.name === 'ron')
				.reduce((acc, i) => acc + i.amount, 0);
			if (cashAmount < price) return 'Nu ai suficienti bani cash (RON)';
		} else {
			if (player.money[payment as keyof PlayerMoney] < price) return 'Fonduri bancare insuficiente';
		}

		// ✅ Verificăm dacă are bani
		const success = await pay(player, payment, price, 'gas');
		if (!success) return 'Tranzactie respinsa';

		console.log('[DEBUG] Plata efectuata cu succes');

		const litres = basket[fuelType as keyof Basket] || 0;

		if (litres > 0 && vehicle) {
			console.log(`[DEBUG] Adaug combustibil: ${litres}`);
			await vehicleFuel.fillUp(player, litres, vehicle);
			await tasks.implement(player, 'refuel');
			console.log('[DEBUG] Combustibil adaugat + task completat');
		} else {
			console.log(`[DEBUG] NU adauga combustibil | litres: ${litres}, vehicle valid: ${!!vehicle}`);
		}

		this.addToInventory(player, basket);
		console.log('[DEBUG] Itemele din cos au fost adaugate in inventar');
		return true;
	} catch (err) {
		console.log('[DEBUG] Eroare in buy:', err);
		return 'Eroare la tranzactie';
	}
}




}

const service = new Gas();
