import { isNumber } from 'lodash';
import money from 'helpers/money';
import playerInventory from 'player/inventory';
import Service from './service';
import { pay } from 'helpers/pay';

type Product = {
	name: string;
	amount: number;
};

const prices = {
	burger: 100,
	donut: 75,
	chocolate: 30,
	water: 8,
	soda: 10,
	cigarettes: 30,
	beer: 50,
	wine: 80,
	vodka: 120,
	whiskey: 200,
	bandage: 100,
	medkit: 700,
};

class Supermarket extends Service {
	constructor() {
		super('supermarket', { name: 'Magazin 24/7', model: 52, color: 81 });
	}

	load() {
		// Do not load old static supermarkets
		console.log('[Supermarket] Static loading disabled.');
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'Supermarket-Buy': this.buy.bind(this),
			'Supermarket-GetCash': this.getCashAmount.bind(this)
		});
	}

	private getCashAmount(player: Player) {
		return player.inventory
				.filter(i => i.name === 'ron')
				.reduce((acc, i) => acc + i.amount, 0);
	}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;

		player.callEvent('Supermarket-ShowMenu', prices);
	}

	private getPrice(product: Product) {
		const { name, amount } = product;

		if (!prices[name] || !isNumber(amount) || amount <= 0 || amount > 10000) {
			throw new SilentError('wrong product');
		}

		return prices[name] * amount;
	}

	private async buy(player: Player, product: Product, payment: PaymentType) {
		const price = this.getPrice(product);

		try {
			playerInventory.checkEnoughSlots(player, [product]);
		} catch(e) {
			return 'SPATIU INSUFICIENT IN INVENTAR';
		}

		if (payment === 'cash') {
			const cashAmount = player.inventory
				.filter(i => i.name === 'ron')
				.reduce((acc, i) => acc + i.amount, 0);
			if (cashAmount < price) return 'NU AI DESTUI BANI LA TINE';
		} else {
			if (player.money[payment as keyof PlayerMoney] < price) return 'FONDURI BANCARE INSUFICIENTE';
		}

		const success = await pay(player, payment, price, 'supermarket');
		if (!success) return 'TRANZACTIE RESPINGA';

		await playerInventory.addItem(player, product);
		
		return true;
	}
}

const service = new Supermarket();