import { SilentError } from 'utils/errors';
import money from 'helpers/money';
import tasks from 'awards/tasks';
import vehicleCreator, { Builder } from 'vehicle/creator';
import vehicleList from 'data/vehicles.json';
import VehicleModel from 'models/Vehicle';
import Service from '../service';

const shops: { [name: string]: VehicleShop } = {};

class VehicleShop extends Service {
	private vehicles: string[];

	private payment: PaymentType;

	constructor(
		name: string,
		blip: BlipsOptions,
		vehicles: string[],
		payment: PaymentType = 'bank'
	) {
		super(name, blip);

		this.vehicles = vehicles;
		this.payment = payment;

		shops[name] = this;
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'VehicleShop-Buy': async (
				player: Player,
				type: string,
				model: string,
				color: RGB,
				paymentMethod?: PaymentType
			) => {
				const shop = shops[type];
				if (!shop) return;

				try {
					await shop.buy(player, model, color, paymentMethod);
					//player.notify('~g~Ai achizitionat vehiculul');
				} catch (e: any) {
					//player.notify(`~r~${e.message}`);
					throw new SilentError(e.message);
				}
			},
			'VehicleShop-Exit': (player: Player) => {
				player.togglePrivateDimension();
			}
		});
	}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;

		player.togglePrivateDimension();

		player.callEvent('VehicleShop-ShowMenu', [this.name, this.getPrices()]);
	}

	protected getPrices() {
		const prices: { [name: string]: number } = {};
		const isMainShowroom = this.name === 'premium_carshop';
		const targets = isMainShowroom ? Object.keys(vehicleList) : this.vehicles;

		targets.forEach((name) => {
			const data = vehicleList[name];
			if (data) {
				if (!isMainShowroom || !data.faction || data.faction === 'civil') {
					prices[name] = data.price || 0;
				}
			}
		});

		return prices;
	}

	protected getPriceOfModel(model: string) {
		const isMainShowroom = this.name === 'premium_carshop';
		const targets = isMainShowroom ? Object.keys(vehicleList) : this.vehicles;
		
		if (!targets.includes(model)) return -1;
		return vehicleList[model]?.price ?? 0;
	}

	protected async canBuy(player: Player, model: string) {
		if (!player.isEnoughVehicleSlots()) {
			throw new SilentError('Nu ai suficiente sloturi pentru noi vehicule');
		}

		const count = await VehicleModel.countDocuments({ owner: player.dbId, name: model });
		if (count > 0) {
			throw new SilentError('Ai deja un vehicul de acest model!');
		}
	}

	async buy(player: Player, model: string, color: RGB, paymentMethod?: PaymentType) {
		await this.canBuy(player, model);

		const price = this.getPriceOfModel(model);
		if (price === -1) throw new SilentError('Modelul vehiculului este invalid');

		if (price > 0) {
			const method = paymentMethod || this.payment;
			if (method === 'cash') {
				const playerInventory = require('player/inventory').default;
				const playerRon = await playerInventory.getAmount(player, 'ron');
				if (playerRon < price) throw new SilentError('Nu ai destui bani cash');
			} else if (method === 'bank') {
				const currentBank = player.money?.bank || 0;
				if (currentBank < price) throw new SilentError('Nu ai suficienti bani in banca!');
			} else if (method === 'points') {
				if (player.account.donate < price) throw new SilentError('Nu ai suficente puncte premium pentru aceasta achizitie!');
			}

			await money.change(player, method, -price, `${this.name} buy`);
		}

		const builder = new Builder(model, { x: 0, y: 0, z: 0 }, 90, 1000);
		builder.installTuning({
			paint: {
				primary: [...color, 0] as RGBA,
				secondary: [...color, 0] as RGBA
			}
		});

		const vehicle = await vehicleCreator.buildForPlayer(player, builder);
		mp.vehicles.delete(vehicle);

		await tasks.implement(player, 'buy_car');
	}
}

export default VehicleShop;
