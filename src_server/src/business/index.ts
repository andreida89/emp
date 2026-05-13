import money from 'helpers/money';
import hud from 'helpers/hud';
import tasks from 'awards/tasks';
import building from './building';
import tax from './tax';
import owning from './owning';
import entities, { Entity } from './entities';
import './trade';

class BusinessController {
	private readonly workTime = 24;

	constructor() {
		this.subscribeToEvents();
	}

	loadForPlayer(player: Player) {
		player.businesses = [];

		entities.items.forEach((item) => {
			if (!item || !owning.isOwner(player, item.owner)) return;

			building.createBlipForPlayer(player, item);
			this.changePlayerData(player, item);
		});
	}

	changePlayerData(player: Player, entity: Entity) {
		if (owning.isOwner(player, entity.owner)) {
			player.businesses.push(entity.index);
		} else {
			player.businesses = player.businesses.filter((item) => item !== entity.index);
		}
	}

	getPrice(entity: Entity, owner = false) {
		const { price } = entity;
		return owner ? (price / 100) * 60 : price;
	}

	showMenu = async (player: Player) => {
		const entity = entities.getItem(player);
		if (!entity || player.mp.vehicle) return;

		const owner = await owning.getOwnerName(entity.owner);
		const paymentTime = entity.paymentTime
			? BusinessController.getTimeDifference(entity.paymentTime)
			: null;

		player.callEvent('Business-ShowMenu', {
			owner,
			paymentTime,
			name: entity.name,
			isOwner: owning.isOwner(player, entity.owner),
			price: this.getPrice(entity, !!entity.owner),
			income: entity.income,
			paid: entity.paid,
			tax: tax.getTax(entity)
		});
	};

	showInteractionPointMenu = (player: Player, biz: Entity, point: any) => {
		const serviceMap: { [key: string]: string } = {
			'Magazin 24/7': 'supermarket',
			'Magazin de Haine': 'clothing_shop',
			'Magazin de haine': 'clothing_shop',
			'Benzinarie': 'gas',
			'Gunshop': 'weapons',
			'Magazin de Arme': 'weapons',
			'Frizerie': 'barbershop',
			'Tattoo Shop': 'tattoo_shop',
			'Tattoo shop': 'tattoo_shop',
			'Magazin de unelte': 'tool_shop',
			'Magazin de Unelte': 'tool_shop',
			'MAGAZIN DE UNELTE': 'tool_shop',
			'Magazin de electronice': 'electronics_shop',
			'Magazin de Electronice': 'electronics_shop',
			'MAGAZIN DE ELECTRONICE': 'electronics_shop',
			'FASTFOOD': 'fastfood',
			'Fastfood': 'fastfood',
			'FastFood': 'fastfood',
			'Tuning': 'lscustoms',
			'Service': 'lscustoms',
			'Service auto': 'lscustoms',
			'Service tuning': 'lscustoms'
		};

		const serviceName = serviceMap[point.name];
		if (serviceName) {
			mp.events.call('Services-ShowMenu', player.mp, serviceName);
		}
	};

	async withdraw(entity: Entity) {
		const { owner: ownerId } = entity;
		const player = mp.players.getByDbId(ownerId);

		await entities.reset(entity);
		await money.changeById(
			ownerId,
			'bank',
			this.getPrice(entity, true),
			'withdraw business'
		);

		if (player) this.changePlayerData(player, entity);

		building.toggleBlip(entity, player);
	}

	checkCanBuy(player: Player) {
		let error;

		if (player.businesses.length) error = 'Limita de afaceri detinute a fost atinsa!';
		else if (!player.hasLicense('business')) error = 'Nu aveti licenta pentru afaceri!';

		if (error) {
			hud.showNotification(player, 'error', error, true);
			throw new SilentError("user doesn't can buy business");
		}
	}

	private async trade(player: Player) {
		const entity = entities.getItem(player);
		if (!entity) throw new SilentError('business object does not exists');

		if (!owning.isOwner(player, entity?.owner)) await this.buy(player, entity);
		else await this.sell(player);

		this.changePlayerData(player, entity);
		building.toggleBlip(entity, player);
	}

	private async buy(player: Player, entity: Entity) {
		if (entity.owner) throw new SilentError('this business already has an owner');
		this.checkCanBuy(player);

		await money.change(player, 'bank', -this.getPrice(entity), 'business buy');

		await owning.setOwner(player, entity);
		await tasks.implement(player, 'buy_prop');
	}

	private async sell(player: Player) {
		const entity = entities.getItem(player);

		if (!owning.isOwner(player, entity?.owner)) throw new SilentError('is not owner');

		await money.change(player, 'bank', this.getPrice(entity, true), 'business sell');
		await entities.reset(entity);
	}

	private async startWork(player: Player) {
		const entity = entities.getItem(player);

		if (!entity.paymentTime) {
			const date = new Date();
			date.setHours(date.getHours() + this.workTime);
			await entities.update(entity, { paymentTime: date });
		}

		return entity.paymentTime
			? BusinessController.getTimeDifference(entity.paymentTime)
			: null;
	}

	private async finishWork(player: Player) {
		const entity = entities.getItem(player);
		const date = new Date(entity.paymentTime);

		if (entity.paymentTime && date.getTime() - Date.now() <= 0) {
			await entities.update(entity, { paymentTime: null });
			await money.change(player, 'bank', entity.income, 'business income');
		}
	}

	private subscribeToEvents() {
		mp.events.subscribe({
			'Business-Trade': this.trade.bind(this),
			'Business-Start': this.startWork.bind(this),
			'Business-Finish': this.finishWork.bind(this)
		});
	}

	private static getTimeDifference(date: Date) {
		return date.getTime() - Date.now();
	}
}

export default new BusinessController();
