import GarageModel, { IGarage } from 'models/Garage';
import hud from 'helpers/hud';
import building, { blipColors, blipModels } from './building';
import { SilentError } from 'utils/errors';

export type GarageEntity = IGarage & {
	colshape?: ColshapeMp;
	marker?: MarkerMp;
	blip?: BlipMp;
};

class GarageEntities {
	items: GarageEntity[] = [];
	private blips: Map<string, BlipMp> = new Map();

	async load() {
		const items = await GarageModel.find();

		items.forEach((item) => {
			const entity = item.toObject() as GarageEntity;
			
			const built = building.create(entity);
			entity.colshape = built.colshape;

			this.items[item.index] = entity;
		});

		this.syncBlips();
		console.log(`[GARAJE] S-au incarcat ${items.length} garaje`);
	}

	private syncBlips() {
		// Destroy existing grouped blips
		this.blips.forEach(b => { if (mp.blips.exists(b)) b.destroy(); });
		this.blips.clear();

		const groups = new Map<string, GarageEntity[]>();

		this.items.forEach(item => {
			if (!item || item.noBlip) return;
			const key = `${item.position.x.toFixed(1)}_${item.position.y.toFixed(1)}_${item.position.z.toFixed(1)}_${item.type}`;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)!.push(item);
		});

		groups.forEach((entities, key) => {
			const first = entities[0];
			// Skip blips for faction garages as they will be handled client-side or per-player
			if (['politie', 'heli_politie', 'boat_politie', 'umu', 'heli_umu'].includes(first.type)) return;
			
			const pos = new mp.Vector3(first.position.x, first.position.y, first.position.z);
			
			// Format name: Garaj type (match house style for grouping)
			const labels: { [key: string]: string } = {
				'civil': 'Civil',
				'politie': 'Politie',
				'umu': 'UMU',
				'boat': 'Barci',
				'boat_politie': 'Barci Politie',
				'truck': 'Camioane',
				'plane': 'Avioane',
				'heli': 'Elicopter',
				'kart': 'Kart',
				'formula1': 'Formula1'
			};
			const typeLabel = labels[first.type] || first.type.toUpperCase();
			const name = `Garaj ${typeLabel}`;

			const blip = mp.blips.new(
				blipModels[first.type] || 50,
				pos,
				{
					name: name,
					color: blipColors[first.type] || 3,
					shortRange: true,
					scale: 0.8
				}
			);

			this.blips.set(key, blip);
			entities.forEach(e => { e.blip = blip; });
		});
	}

    getItem(player: Player) {
        if (typeof player.mp.colshape === 'undefined' || player.mp.colshape === null) return null;
        const id = mp.colshapes.getData(player.mp);
        return typeof id === 'number' ? this.items[id] : null;
    }

    getGaragesAt(position: { x: number, y: number, z: number }, range: number = 2.0) {
        return this.items.filter(item => {
            if (!item) return false;
            const dist = Math.sqrt(
                Math.pow(item.position.x - position.x, 2) +
                Math.pow(item.position.y - position.y, 2) +
                Math.pow(item.position.z - position.z, 2)
            );
            return dist <= range;
        });
    }

	getItemById(id: number) {
		return this.items[id];
	}

	async create(player: Player, type: string, data: { customId: number, name: string, noBlip?: boolean }) {
		if (this.items[data.customId]) {
			throw new SilentError('A garage with this ID already exists');
		}

		const garageData = {
			index: data.customId,
			name: data.name,
			type,
			noBlip: !!data.noBlip,
			position: {
				x: player.mp.position.x,
				y: player.mp.position.y,
				z: player.mp.position.z
			}
		};

		const document = await GarageModel.create(garageData);
		const entity = document.toObject() as GarageEntity;

		const built = building.create(entity);
		entity.colshape = built.colshape;

		this.items[data.customId] = entity;

		this.syncBlips();
		mp.players.call('garage:addMarker', [entity.index, entity.position, entity.type, entity.noBlip]);

		return entity;
	}

	async delete(id: number) {
		const garage = this.items[id];
		if (!garage) throw new SilentError('Garage not found');

		await GarageModel.findOneAndDelete({ index: id });

		if (garage.colshape) garage.colshape.destroy();

		mp.players.call('garage:removeMarker', [id]);

		delete this.items[id];
		this.syncBlips();
	}

    async update(id: number, data: Partial<IGarage>) {
        const garage = this.items[id];
		if (!garage) throw new SilentError('Garage not found');

		await GarageModel.findOneAndUpdate({ index: id }, { $set: data });

		if (data.name) garage.name = data.name;
        if (data.type) garage.type = data.type as any;
        if (data.position) {
            garage.position = data.position as any;
            if (garage.colshape) garage.colshape.position = new mp.Vector3(data.position.x, data.position.y, data.position.z);
        }
        
		this.syncBlips();
		return garage;
    }
}

export default new GarageEntities();
