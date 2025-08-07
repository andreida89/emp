import money from 'helpers/money';
import playerInventory from 'player/inventory';
import hud from 'helpers/hud';
import Service from '../service';

const prices = {
    oblete: 15,
    biban: 20,
    caras: 25,
    crap: 30,
	clean: 35,
    pastrav: 40,
    salau: 45,
    stiuca: 50,
    dorada: 60,
    calcan: 70,
    ton: 1000,
    rechin: 2000
};
const ciuperciprices = {
	opintici: 20,
	champignon: 25,
	ghebe: 35,
	hribi: 45,
	trufe: 80
};

class FishSale extends Service {
	constructor() {
		super('fish_sale', { name: 'Pescarie', model: 356, color: 30 });
	}

	protected subscribeToEvents() {}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;
		this.sellFish(player);
	}

	private async sellFish(player: Player) {
		let price = 0;
		player.inventory = player.inventory.filter((item) => {
			if (prices[item.name]) {
				price += Math.floor(prices[item.name] * item.amount);
				return false;
			}
			return true;
		});

		if (price <= 0) return;
		//await money.change(player, 'cash', price, 'fish sale');
		await playerInventory.addItem(player, { name: 'ron', amount: price });
		//hud.showNotification(player, 'success', `Ati vandut pestele pentru ${price} RON`, true);
		player.mp.call("AnuntNotification", [`Ai vandut pestele pentru ${price} RON`, 'success']);
	}
}


class CiuperciSale extends Service {

	constructor() {
		super('ciuperci_sale', { name: 'Vanzare Ciuperci', model: 356, color: 30 });
	}

	protected subscribeToEvents() {}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;
		this.sellCiuperci(player);
	}

	private async sellCiuperci(player: Player) {
		let price = 0;
		player.inventory = player.inventory.filter((item) => {
			if (ciuperciprices[item.name]) {
				price += Math.floor(ciuperciprices[item.name] * item.amount);
				return false;
			}
			return true;
		});

		if (price <= 0) return;
		//await money.change(player, 'cash', price, 'ciuperci sale');
		await playerInventory.addItem(player, { name: 'ron', amount: price });
		//hud.showNotification(player, 'success', `Ati vandut ciupercile pentru ${price} RON`, true);
		player.mp.call("AnuntNotification", [`Ai vandut ciupercile pentru ${price} RON`, 'success']);
	}
}
const ciuperciService = new CiuperciSale();
const service = new FishSale();
