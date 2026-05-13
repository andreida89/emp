import { last } from 'lodash';
import logger from 'utils/logger';
import HouseModel from 'models/House';
import houses from 'data/houses.json';
import building from './building';

export type Entity = {
	id: string;
	index: number;
	type: string;
	customId?: number;
	name?: string;
	price?: number;
	locked: boolean;
	inventory: InventoryItem[];
	position: PositionEx;
	dimension: number;
	paid: number;
	owner?: string;
	blip?: BlipMp;
	colshapes?: ColshapeMp[];
};

class HouseEntities {
	public items: Entity[];

	constructor() {
		this.items = [];
	}

	get count() {
		return this.items.length;
	}

	getItem(player: Player, index?: number) {
		const data: number = index ?? mp.colshapes.getData(player.mp);
		const entity = this.items[data];

		return entity?.index === data ? entity : null;
	}

	getInventoryCapacity(house: Entity) {
		return houses[house.type].inventory as InventoryCapacity;
	}

	getVehicleSlots(house: Entity) {
		return houses[house.type].vehicles as number;
	}

	async load() {
		const cursor = await HouseModel.find().lean().cursor();

		cursor.on('data', this.prepare.bind(this));
		cursor.on('close', () => logger.success(`Houses loaded: ${this.count}`));
	}

	async create(player: Player, type: string, extraData: { customId?: number, name?: string, price?: number, owner?: string } = {}) {
		const house = await HouseModel.create({
			type,
			position: player.mp.position,
			...extraData
		});

		this.prepare(house.toObject() as HouseModel);

		return last(this.items);
	}

	async delete(index: number) {
		const house = this.items[index];

		if (house) {
			await HouseModel.findByIdAndDelete(house.id);

			if (house.blip) house.blip.destroy();
			
			if (house.colshapes) {
				house.colshapes.forEach(c => {
					if (mp.colshapes.exists(c)) c.destroy();
				});
			}

			// In case the house had an owner, remove blips and data for all players
			mp.players.call('house:removeMarker', [index]);
			mp.players.forEach(p => {
				if (p && p.houses) {
					mp.blips.delete(p, `Casa nr. ${house.index}`);
					
					// If the player was the owner, update their house list and slots
					if (house.owner && p.dbId === house.owner) {
						const houseCtrl = require('./index').default;
						houseCtrl.changePlayerData(p, house);
					}
				}
			});

			this.items[index] = null;
		}
	}

	async update(entity: Entity, data: Partial<Entity>) {
		await HouseModel.findByIdAndUpdate(entity.id, { $set: data });

		Object.assign(entity, data);
	}

	async reset(house: Entity) {
		const state = {
			paid: 1,
			locked: false,
			owner: null,
			inventory: []
		};

		await this.update(house, state);
	}

	private prepare({ _id, owner, customId, name, price, ...data }: HouseModel) {
		const entity: Entity = {
			...data,
			id: _id.toString(),
			owner: owner?.toString(),
			customId,
			name,
			price,
			dimension: 0,
			index: this.count
		};

		const houseObj = { ...entity, ...building.create(entity) };
		this.items.push(houseObj);

		mp.players.call('house:addMarker', [houseObj.index, houseObj.position, building.getExitPosition(houseObj), houseObj.dimension]);
	}
}

export default new HouseEntities();
