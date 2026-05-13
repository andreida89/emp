import houses from 'data/houses.json';
import inventory from './inventory';
import houseCtrl from './index';
import owning from './owning';
import entities, { Entity as House } from './entities';

class HouseBuilding {
	isEntrance(player: PlayerMp, coords: PositionEx) {
		const position = new mp.Vector3(coords.x, coords.y, coords.z);

		return player.dist(position) <= 3;
	}

	getExitPosition(data: House) {
		const { coords } = houses[data.type];

		return coords.location;
	}

	create(data: House) {
		const { coords } = houses[data.type];
		const dimension = 100 + data.index;

		const colshapes: ColshapeMp[] = [];

		const passage1 = this.createPassage(data.position);
		colshapes.push(passage1.colshape);

		const passage2 = this.createPassage(this.getExitPosition(data), dimension);
		colshapes.push(passage2.colshape);

		if (coords.inventory) {
			const inv = this.createInventory(coords.inventory, dimension);
			colshapes.push(inv.colshape);
		}

		return {
			dimension,
			blip: !data.owner ? this.createBlip(data) : null,
			colshapes
		};
	}

	enter(player: Player, house: House) {
		if (!house || house.locked) throw new SilentError('the door is locked');

		const isEntrance = this.isEntrance(player.mp, house.position);

		player.tp(
			isEntrance ? this.getExitPosition(house) : house.position,
			90,
			isEntrance ? house.dimension : 0
		);
	}

	toggleBlip(house: House, player?: Player) {
		if (house.owner && house.blip) {
			house.blip.destroy();
			house.blip = null;
		} else if (!house.owner) {
			const blip = this.createBlip(house);

			house.blip = blip;
		}

		if (owning.isOwner(player, house.owner))
			mp.blips.createForPlayer(
				player,
				house.position,
				{
					model: 40,
					name: 'Casa ta',
					color: 3,
					scale: 0.85
				},
				`Casa nr. ${house.index}`
			);
		else if (player) mp.blips.delete(player, `Casa nr. ${house.index}`);
	}

	private createInventory(position: PositionEx & { rotation: number }, dimension = 0) {
		const colshape = mp.colshapes.create(
			position,
			1,
			{
				onKeyPress: inventory.showMenu
			},
			{ dimension, data: entities.count }
		);

		return { colshape };
	}

	private createPassage(position: PositionEx, dimension = 0) {
		const colshape = mp.colshapes.create(
			position,
			1,
			{
				onKeyPress: houseCtrl.showMenu
			},
			{ dimension, data: entities.count }
		);

		return { colshape };
	}

	private createBlip(house: House) {
		return mp.blips.create(house.position, {
			name: 'Casa',
			model: 40,
			color: 2,
			scale: 0.7
		});
	}
}

export default new HouseBuilding();
