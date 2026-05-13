import logger from 'utils/logger';
import BusinessModel from 'models/Business';
import building from './building';

export type Entity = {
	id: string;
	index: number;
	paid: number;
	name: string;
	type: string;
	price: number;
	profitPercent: number;
	customId: number;
	position: PositionEx;
	income: number;
	paymentTime?: Date;
	owner?: string;
	blip?: BlipMp;
	marker?: MarkerMp;
	pointBlips?: BlipMp[];
	colshapes?: ColshapeMp[];
	interactionPoints?: { name: string; position: PositionEx }[];
};

class BusinessEntities {
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

	async load() {
		const cursor = await BusinessModel.find().lean().cursor();

		cursor.on('data', this.prepare.bind(this));
		cursor.on('close', () => logger.success(`Businesses loaded: ${this.count}`));
	}

	async create(player: Player, name: string, type: string, price: number, income: number, ownerId?: string, profitPercent?: number, customId?: number) {
		const data: any = {
			name,
			type,
			price,
			income,
			customId,
			profitPercent: profitPercent || 0,
			position: { x: player.mp.position.x, y: player.mp.position.y, z: player.mp.position.z }
		};

		if (ownerId && ownerId.length > 0) {
			data.owner = ownerId;
		}

		const business = await BusinessModel.create(data);
		return this.prepare(business.toObject() as any);
	}

	async delete(id: number) {
		const index = this.items.findIndex(item => item && (item.customId === id || item.index === id));
		const entity = this.items[index];

		if (entity) {
			console.log(`Deleting business: ${entity.name} (Index: ${entity.index}, CustomID: ${entity.customId})`);
			await BusinessModel.findByIdAndDelete(entity.id);

			if (entity.blip) {
				entity.blip.destroy();
				entity.blip = null;
			}
			if (entity.marker) {
				entity.marker.destroy();
				entity.marker = null;
			}

			mp.players.forEach(p => {
				const player = mp.players.get(p);
				if (player) mp.blips.delete(player, `Afacerea nr. ${entity.index}`);
			});
			if (entity.pointBlips) {
				entity.pointBlips.forEach(blip => blip && blip.destroy());
				entity.pointBlips = [];
			}
			if (entity.colshapes) {
				entity.colshapes.forEach(shape => shape && shape.destroy());
				entity.colshapes = [];
			}
			this.items[index] = null;
			return true;
		} else {
			console.warn(`Attempted to delete non-existent business with ID: ${id}`);
		}
		return false;
	}

	async update(entity: Entity, data: Partial<Entity>) {
		await BusinessModel.findByIdAndUpdate(entity.id, { $set: data });
		Object.assign(entity, data);
	}

	async reset(house: Entity) {
		const state = {
			owner: null,
			paid: 1,
			paymentTime: null
		};
		await this.update(house, state);
	}

	private prepare({ _id, owner, ...data }: BusinessModel) {
		const entity: Entity = {
			...data,
			id: _id.toString(),
			owner: owner?.toString(),
			index: this.count
		};
		Object.assign(entity, building.create(entity));
		this.items.push(entity);

		return entity;
	}
}

export default new BusinessEntities();
