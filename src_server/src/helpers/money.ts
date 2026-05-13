import { isNumber } from 'lodash';
import logs from 'basic/logs';
import UserModel from 'models/User';
import CharModel from 'models/Character';
import hud from './hud';

class Money {
	async change(player: Player, type: PaymentType, value: any, note?: string) {
		const sum = Math.round(parseInt(value, 10));

		if (!isNumber(sum) || sum === 0) throw new SilentError('wrong value');

		if (type === 'cash') {
			const playerInventory = require('player/inventory').default;
			if (sum > 0) {
				await playerInventory.addItem(player, { name: 'ron', amount: sum });
			} else {
				try {
					await playerInventory.removeItemAmount(player, 'ron', -sum);
				} catch (e) {
					console.log(`[MONEY] Update failed for ${player.dbId} (${type}) value: ${sum}`);
					hud.showNotification(player, 'error', this.getErrorMessage(type), true);
					throw new SilentError('insufficient funds');
				}
			}
			this.logOperation(player.dbId, type, sum, note);
			return;
		}

		const status = await this.updateInDb(
			type === 'points' ? player.account : player.dbId,
			type,
			sum
		);
		if (!status) {
			console.log(`[MONEY] Update failed for ${player.dbId} (${type}) value: ${sum}`);
			hud.showNotification(player, 'error', this.getErrorMessage(type), true);
			throw new SilentError('insufficient funds');
		}

		this.updatePlayer(player, { [type]: player.money[type] + sum });
		this.logOperation(player.dbId, type, sum, note);
	}

	async changeById(userId: string, type: PaymentType, value: any, note?: string) {
		const sum = parseInt(value, 10);

		if (!isNumber(sum) || sum === 0) throw new SilentError('wrong value');

		const status = await this.updateInDb(userId, type, sum);
		if (!status) throw new SilentError('insufficient funds');

		const player = mp.players.getByDbId(userId);

		if (player) {
			this.updatePlayer(player, { [type]: player.money[type] + sum });
		}

		this.logOperation(userId, type, sum, note);
	}

	async exchange(
		player: Player,
		from: PaymentType,
		to: PaymentType,
		value: any,
		note?: string
	) {
		const sum = parseInt(value, 10);

		if (!isNumber(sum) || sum <= 0) throw new SilentError('wrong value');

		await this.change(player, from, -sum, note);
		await this.change(player, to, sum, note);
	}

	updatePlayer(player: Player, money: Partial<PlayerMoney>) {
		player.money = { ...player.money, ...money };
		hud.updateMoney(player.mp, player.money);
	}

	syncCashWithHUD(player: Player) {
		const cashAmount = player.inventory
			.filter(i => i.name === 'ron')
			.reduce((acc, i) => acc + i.amount, 0);
		this.updatePlayer(player, { cash: cashAmount });
	}

	private async updateInDb(userId: string, type: PaymentType, sum: number) {
		let status;

		if (type !== 'points') {
			status = await CharModel.updateOne(
				sum < 0 ? { _id: userId, [`money.${type}`]: { $gt: -sum - 1 } } : { _id: userId },
				{ $inc: { [`money.${type}`]: sum } }
			);
		} else {
			status = await UserModel.updateOne(
				sum < 0 ? { _id: userId, donate: { $gt: -sum - 1 } } : { _id: userId },
				{ $inc: { donate: sum } }
			);
		}

		return !!status?.nModified;
	}

	private logOperation(user: string, payment: PaymentType, sum: number, note: string) {
		logs.create('money', {
			recipient: user,
			payment,
			sum,
			note
		});

		if (payment === 'bank' && sum !== 0) {
			const entry = {
				name: note || (sum > 0 ? 'Creditare' : 'Debitare'),
				amount: sum,
				date: new Date().toLocaleString('ro-RO')
			};
			CharModel.findByIdAndUpdate(user, { 
				$push: { 
					bankHistory: { 
						$each: [entry], 
						$position: 0, 
						$slice: 20 
					} 
				} 
			}).catch(err => console.error(`[BANK_LOG] Failed for ${user}:`, err));
		}
	}

	private getErrorMessage(payment: PaymentType) {
		switch (payment) {
			case 'points':
				return "Monede EMPIRE insuficiente";
			case 'cash':
				return 'Numerar insuficient';

			default:
				return 'Fonduri bancare insuficiente';
		}
	}
}

export default new Money();
