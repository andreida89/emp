import { isNumber } from 'lodash';
import hud from 'helpers/hud';
import money from 'helpers/money';
import playerInventory from 'player/inventory';
import tasks from 'awards/tasks';
import Service from './service';
import { pay } from 'helpers/pay';


const prices = {
	bottle: 70,
	dagger: 500,
	bat: 400,
	golfclub: 380,
	knuckle: 800,
	knife: 350,
	pistol: 2000,
	pistol50: 2500,
	snspistol: 1500,
	vintagepistol: 2800,
	doubleaction: 3500,
	mavyrevolver: 800000,
	gadgetpistol: 1000000,
	machinepistol: 6000,
	microsmg: 6300,
	minismg: 6800,
	smg: 7000,
	combatpdw: 7500,
	assaultsmg: 8000,
	compactrifle: 10000,
	assaultrifle: 12000,
	carbinerifle: 12000,
	advancedrifle: 15000,
	specialcarbine: 18000,
	sawnoffshotgun: 10000,
	pumpshotgun: 11500,
	assaultshotgun: 13000,
	heavyshotgun: 15000,
	musket: 25000,
	dbshotgun: 12000,
	'9mm': 2,
	'7.62mm': 5,
	'12gauge': 7
};

class Weapons extends Service {
	constructor() {
		super('weapons', { name: 'Magazin de Arme', model: 110, color: 4 });
	}

	load() {
		// Do not load old static weapons shops
		console.log('[Weapons] Static loading disabled.');
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'Weapons-Buy': this.buyWeapon.bind(this),
			'Weapons-BuyAmmo': this.buyAmmo.bind(this),
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

		if (!player.hasLicense('weapon')) {
			return hud.showNotification(player, 'error', 'Nu aveti licenta pentru arme');
		}

		player.callEvent('Weapons-ShowMenu', prices);
	}

	private getPriceOfAmmo(ammo: string, amount: number) {
		if (!prices[ammo] || !isNumber(amount) || amount <= 0 || amount > 1000) {
			throw new SilentError('wrong ammo data');
		}

		return prices[ammo] * amount;
	}

	private async buyAmmo(
		player: Player,
		type: string,
		amount: number,
		payment: PaymentType
	) {
		const price = this.getPriceOfAmmo(type, amount);
		const item = { name: type, amount };

		playerInventory.checkEnoughSlots(player, [item]);

		await money.change(player, payment, -price, 'weapons ammo');
		await playerInventory.addItem(player, item);
	}

	private async buyWeapon(player: Player, weapon: string, payment: PaymentType) {
		const price = prices[weapon];

		if (!price) throw new SilentError('wrong weapon name');

		const item = {
			name: weapon,
			amount: 1
		};

		try {
			playerInventory.checkEnoughSlots(player, [item]);
		} catch(e) {
			return 'SPATIU INSUFICIENT IN INVENTAR';
		}

		const success = await pay(player, payment, price, 'weapons');
		if (!success) {
			if (payment === 'cash') return 'NU AI DESTUI BANI LA TINE';
			return 'FONDURI BANCARE INSUFICIENTE';
		}

		await playerInventory.addItem(player, item);

		await tasks.implement(player, 'buy_weapon');
		return true;
	}
}

const service = new Weapons();
