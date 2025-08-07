import CharModel from 'models/Character';
import money from 'helpers/money';
import Service from './service';
import { pay } from 'helpers/pay';

type FullName = {
	firstName: string;
	lastName: string;
};

const price = 500000;

class Passport extends Service {
	constructor() {
		super('passport', { name: 'Birou Pasapoarte', model: 498, color: 38, scale: 0 });
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'Passport-Buy': this.buy.bind(this)
		});
	}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;

		player.callEvent('Passport-ShowMenu', price);
	}

	private async changeName(player: Player, name: FullName) {
		await CharModel.findByIdAndUpdate(player.dbId, { $set: { ...name } });

		player.mp.name = `${name.firstName}_${name.lastName}`;
	}

	private async buy(player: Player, name: FullName) {
		const isExists = await CharModel.findOne({ ...name }).countDocuments();

		if (isExists) {
			return mp.events.reject('Cetateanul cu acest nume este deja inregistrat');
		}

		//await money.change(player, 'points', -price, 'passport');
		await pay(player, 'points', price, 'passport');

		await this.changeName(player, name);
	}
}

const service = new Passport();
