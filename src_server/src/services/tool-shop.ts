import { isNumber } from 'lodash';
import playerInventory from 'player/inventory';
import Service from './service';
import { pay } from 'helpers/pay';

type Product = {
	name: string;
	amount: number;
};

const prices = {
	flashlight: 400,
	rod: 5000,
	backpack_small: 5000,
	backpack_medium: 25000,
	backpack_large: 75000
};

class ToolShop extends Service {
	constructor() {
		super('tool_shop', { name: 'Magazin de unelte', model: 446, color: 0 });
	}

	load() {
		console.log('[ToolShop] Static loading disabled.');
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'ToolShop-Buy': this.buy.bind(this),
			'ToolShop-GetCash': this.getCashAmount.bind(this)
		});
	}

	private getCashAmount(player: Player) {
		return player.inventory
				.filter(i => i.name === 'ron')
				.reduce((acc, i) => acc + i.amount, 0);
	}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;

		player.callEvent('ToolShop-ShowMenu', prices);
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

		const success = await pay(player, payment, price, 'tool_shop');
		if (!success) return 'TRANZACTIE RESPINGA';

		await playerInventory.addItem(player, product);
		
		return true;
	}
}

const service = new ToolShop();
