import { isNumber } from 'lodash';
import playerInventory from 'player/inventory';
import Service from './service';
import { pay } from 'helpers/pay';

type Product = {
	name: string;
	amount: number;
};

const prices = {
	burger: 45,
	pizza: 60,
	hotdog: 35,
	shaorma: 55,
	sandwich: 40,
	chickenwings: 65,
	tacos: 50,
	burrito: 55
};

class FastFoodShop extends Service {
	constructor() {
		super('fastfood', { name: 'FASTFOOD', model: 106, color: 0 });
	}

	load() {
		console.log('[FastFoodShop] Static loading disabled.');
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'FastFood-Buy': this.buy.bind(this),
			'FastFood-GetCash': this.getCashAmount.bind(this)
		});
	}

	private getCashAmount(player: Player) {
		return player.inventory
				.filter(i => i.name === 'ron')
				.reduce((acc, i) => acc + i.amount, 0);
	}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;

		player.callEvent('FastFood-ShowMenu', prices);
	}

	private getPrice(product: Product) {
		const { name, amount } = product;

		const price = (prices as any)[name];

		if (!price || !isNumber(amount) || amount <= 0 || amount > 10000) {
			throw new SilentError('wrong product');
		}

		return price * amount;
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

		const success = await pay(player, payment, price, 'fastfood');
		if (!success) return 'TRANZACTIE RESPINSA';

		await playerInventory.addItem(player, product);
		
		return true;
	}
}

const service = new FastFoodShop();
