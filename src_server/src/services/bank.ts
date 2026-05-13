import cryptoRandomString from 'crypto-random-string';
import CharModel from 'models/Character';
import money from 'helpers/money';
import tasks from 'awards/tasks';
import houseTax from 'house/tax';
import businessTax from 'business/tax';
import Service from './service';
import playerInventory from 'player/inventory';

const comission = 2;
const prices = {
	account: 3000
};

class Bank extends Service {
	constructor() {
		super('bank', { name: 'Banca', model: 500, color: 2, scale: 0.85 });
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'Bank-CreateAccount': this.createAccount.bind(this),
			'Bank-CashOut': this.cashOut.bind(this),
			'Bank-Replenish': this.replenishAccount.bind(this),
			'Bank-Transfer': this.transferMoney.bind(this),
			'Bank-SetPin': this.setPin.bind(this),
			'Bank-CheckPin': this.checkPin.bind(this),
			'Bank-UpdatePin': this.updatePin.bind(this)
		});
	}

	async onKeyPress(player: Player) {
		if (player.mp.vehicle) return;

		const char = await CharModel.findById(player.dbId).select('bankHistory').lean();
		const history = char?.bankHistory || [];

		player.callEvent('Bank-ShowMenu', [player.bankAccount, prices, comission, !!player.bankPin, history]);
	}

	private async setPin(player: Player, pin: any) {
		if (!player.bankAccount) return mp.events.reject('Pentru inceput, inregistrati contul bancar');
		
		const pinStr = String(pin);
		await CharModel.findByIdAndUpdate(player.dbId, { $set: { bankPin: pinStr } });
		player.bankPin = pinStr;

		return true;
	}

	private async checkPin(player: Player, pin: string) {
		if (!player.bankPin) return true; // Safety if not set
		return player.bankPin === pin;
	}

	private async updatePin(player: Player, [oldPin, newPin]: [any, any]) {
		if (player.bankPin && player.bankPin !== String(oldPin)) return mp.events.reject('PIN-ul actual este incorect');
		
		const pinStr = String(newPin);
		await CharModel.findByIdAndUpdate(player.dbId, { $set: { bankPin: pinStr } });
		player.bankPin = pinStr;

		return true;
	}

	private async createAccount(player: Player, custom?: string) {
		if (player.bankAccount) return mp.events.reject('Ai deschis deja un cont.');

		if (custom) {
			const isExists = await this.checkExists(custom);

			if (isExists) return mp.events.reject('Acest cont bancar este deja inregistrat');

			await money.change(player, 'points', -prices.account, 'Cont Personalizat');
		}

		const account = custom || (await this.generateAccount());

		await CharModel.findByIdAndUpdate(player.dbId, { $set: { bankAccount: account } });
		player.bankAccount = account;

		// We can log a 0 amount if we want, but Money needs adjustment to allow 0.
		// For now we just won't log the opening if it's free.

		return account;
	}

	private async generateAccount() {
		let num: string;

		do {
			const str = cryptoRandomString({ type: 'numeric', length: 6 });
			const isExists = await this.checkExists(str);

			if (!isExists) num = str;
		} while (!num);

		return num;
	}

	private async checkExists(account: string) {
		const count = await CharModel.findOne({ bankAccount: account }).countDocuments();

		return count > 0;
	}

//	private async cashOut(player: Player, sum: number) {
//		if (!player.bankAccount) {
//			return mp.events.reject('Pentru inceput, inregistrati contul bancar');
//		}
//
//		await money.exchange(player, 'bank', 'cash', sum, 'Retragere Numerar');
//	}

private async cashOut(player: Player, sum: number) {
	if (!player.bankAccount) {
		return mp.events.reject('Pentru inceput, inregistrati contul bancar');
	}

	// 1. Scad banii din contul bancar
	await money.exchange(player, 'bank', 'cash', sum, 'Retragere Numerar');

	// 2. Adaug banii ca item in inventar
	await playerInventory.addItem(player, { name: 'ron', amount: sum });
}


//	private async replenishAccount(player: Player, sum: number) {
//		if (!player.bankAccount) {
//			return mp.events.reject('Pentru inceput, inregistrati contul bancar');
//		}
//
//		await money.exchange(player, 'cash', 'bank', sum, 'Depunere Numerar');
//		await tasks.implement(player, 'bank_replenish');
//	}

private async replenishAccount(player: Player, sum: number) {
	if (!player.bankAccount) {
		return mp.events.reject('Pentru inceput, inregistrati contul bancar');
	}

	// 1. Verifică și scoate RON-ul din inventar
	try {
		await playerInventory.removeItemAmount(player, 'ron', sum);
	} catch (e) {
		return mp.events.reject('Nu ai suficienti bani RON in inventar');
	}

	// 2. Adaugă suma în contul bancar (folosind sistemul vechi)
	await money.change(player, 'bank', sum, 'Depunere Numerar');

	// 3. (Opțional) trigger task
	await tasks.implement(player, 'bank_replenish');
}


	private async transferMoney(player: Player, account: string, value: any) {
		const user = await CharModel.findOne({ bankAccount: account })
			.select({ _id: 1, firstName: 1, lastName: 1 })
			.lean();

		if (!user) return mp.events.reject('Contul indicat nu este inregistrat');

		const sum = parseInt(value, 10);
		const sumWithComission = sum + Math.floor(sum / 100) * comission;

		if (sumWithComission <= 0) throw new SilentError('wrong sum');

		await money.change(player, 'bank', -sumWithComission, `Transfer catre ${user.firstName} ${user.lastName}`);
		await money.changeById(user._id, 'bank', sum, `Transfer de la Cont #${player.bankAccount}`);
	}
}

const service = new Bank();
