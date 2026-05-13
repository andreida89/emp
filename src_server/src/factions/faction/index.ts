import FactionModel from 'models/Faction';
import playerClothes from 'player/clothes';
import Ranks, { Permission } from './ranks';
import Members from './members';
import Money from './money';
import Points from './points';
import Warehouse from '../warehouse/warehouse';
import { Workshop } from '../workshop';
import { Wardrobe } from '../wardrobe';

class Faction {
	public name: string;

	public readonly government: boolean;

	public readonly ranks: Ranks;

	public readonly members: Members;

	public readonly money: Money;

	public readonly points: Points;

	public garage?: any;

	public inventory?: any;

	public warehouse?: Warehouse;

	public workshop?: Workshop;

	public wardrobe?: Wardrobe;

	public vaultCoords?: PositionEx;
	public garageCoords?: PositionEx;

	constructor(name: string, government: boolean) {
		this.name = name;
		this.government = government;

		this.points = new Points();
		this.ranks = new Ranks(name);
		this.members = new Members(name);
		this.money = new Money(name);
	}

	async load(data: FactionModel) {
		this.name = data.name;
		if (this.money) this.money.faction = data.name;
		if (this.ranks) this.ranks.faction = data.name;
		if (this.members) this.members.faction = data.name;

		this.money.current = data.money;
		this.ranks.load(data.ranks);
		this.members.load(data.members);

		if (this.warehouse) this.warehouse.current = data.materials;

		if (data.vaultCoords && data.vaultCoords.x) {
			await this.createInventory(data.vaultCoords, { cells: 100, slots: 5000 });
		}

		if (data.garageCoords && data.garageCoords.x) {
			await this.createGarage(data.garageCoords);
		}

		if (this.inventory && data.inventory) this.inventory.init(data.inventory);
	}

	async createInventory(position: PositionEx, capacity: InventoryCapacity) {
		const inventoryFactory = (await import('../inventory')).default;
		this.inventory = inventoryFactory.create(position, capacity, this);
		this.vaultCoords = position;
	}

	async createGarage(position: PositionEx) {
		this.garageCoords = position;
		
		// To make it behave like a public garage "ca alea publice", we register it 
		// in the global garage system in-memory (it persists via FactionModel.garageCoords)
		const garageEntities = (await import('../../garage/entities')).default;
		const building = (await import('../../garage/building')).default;

		// Generate a consistent pseudo-random ID for this faction's garage markers
		const hash = this.name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
		const baseIndex = 11000 + Math.abs(hash) % 5000;
		const index = baseIndex;

		if (!garageEntities.items[index]) {
			const entity = {
				index,
				name: `Garaj ${this.name}`,
				type: 'civil' as any,
				position: { x: position.x, y: position.y, z: position.z },
				noBlip: true
			};
			
			const built = building.create(entity as any);
			(entity as any).colshape = built.colshape;
			
			garageEntities.items[index] = entity as any;
			
			// Add marker for everyone (visible: true) - civil garage style
			mp.players.call('garage:addMarker', [index, position, 'civil', true]);
		}
	}

	getPlayers(atWork = false) {
		const members = this.members.getAll();

		return Array.from(members.keys()).flatMap((id) => {
			const player = mp.players.getByDbId(id.toString());
			if (!player) return [];

			return (!atWork || this.isAlreadyAtWork(player) ? player : []) as Player;
		});
	}

	isAlreadyAtWork(player: Player) {
		return (
			this.inFaction(player) &&
			((!this.government || player.mp.getOwnVariable('factionWork')) as boolean)
		);
	}

	inFaction(player: Player) {
		return player && player.dbId && this.members.getAll().has(player.dbId.toString());
	}

	isLeader(player: Player, deputy = false) {
		return deputy ? this.hasAccess(player, 'members') : this.hasAccess(player, 'leader');
	}

	hasAccess(player: Player, component: Permission) {
		const member = this.members.getMember(player);

		return member && this.ranks.hasPermission(member.rank, component);
	}

	startWork(player: Player) {
		if (player.job) return;

		player.mp.setOwnVariable('factionWork', true);
	}

	finishWork(player: Player) {
		if (!this.isAlreadyAtWork(player)) return;

		player.mp.setOwnVariable('factionWork', false);
		if (this.wardrobe) playerClothes.load(player);
	}

	setPointsVisible(player: Player, visible: boolean) {
		if (visible) this.points.showFor(player.mp);
		else this.points.hideFor(player.mp);
	}

	async destroy() {
		// 1. Remove markers and points
		this.points.clear();

		// 2. Remove garage if exists
		if (this.garageCoords) {
			const garageEntities = (await import('../../garage/entities')).default;
			const hash = this.name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
			const index = 11000 + Math.abs(hash) % 5000;
			
			if (garageEntities.items[index]) {
				const entity = garageEntities.items[index];
				if (entity.colshape) entity.colshape.destroy();
				delete garageEntities.items[index];
				mp.players.call('garage:removeMarker', [index]);
			}
		}

		// 3. Update database: remove faction reference from members
		const Character = (await import('../../models/Character')).default;
		await Character.updateMany({ faction: this.name }, { $set: { faction: '' } });

		// 4. Update online players and notify them
		const onlinePlayers = this.getPlayers();
		onlinePlayers.forEach(p => {
			p.faction = '';
			p.mp.setVariable('faction', '');
			p.mp.setOwnVariable('factionWork', false);
			p.mp.call('AnuntNotification2', [`Organizatia ${this.name} a fost stearsa.`, 'succes']);
			// Reset clothes if they were at work or had faction clothes, but only if they are not on admin duty
			if (!p.admin_duty) {
				playerClothes.load(p);
			}
		});
	}
}

export default Faction;
