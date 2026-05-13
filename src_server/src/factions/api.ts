import CharModel from 'models/Character';
import FactionModel from 'models/Faction';
import factions from 'factions';

class FactionsAPI {
	constructor() {
		mp.events.subscribe({
			'Faction-GetMoney': this.getMoney,
			'Faction-GetMaterials': this.getMaterialsAmount,
			'Faction-GetMembers': this.getMembers,
			'Faction-GetRanks': this.getRanks,
			'Faction-GetPlayerRank': this.getPlayerRank,
			'Faction-IsLeader': this.isLeader,
			'Faction-GetFactionName': this.getFactionName,
			'Faction-GetRankData': this.getRankData,
			'Faction-ManageRank': this.manageRank,
			'Faction-ManageMember': this.manageMember,
			'Faction-GetVehicles': this.getVehicles
		});
	}

	getPlayerRank(player: Player) {
		const faction = factions.getFaction(player.faction);

		if (faction) {
			const member = faction.members.getMember(player);
			const rank = faction.ranks.getRank(member?.rank);

			return rank?.name;
		}
	}

	isLeader(player: Player) {
		const faction = factions.getFaction(player.faction);

		return faction && faction.isLeader(player);
	}

	getFactionName(player: Player) {
		const faction = factions.getFaction(player.faction);
		return faction ? faction.name : 'Nicio Organizație';
	}

	
	private getMoney(player: Player) {
		const faction = factions.getFaction(player.faction);

		return faction ? faction.money.current : 0;
	}

	private getMaterialsAmount() {
		const list: { [name: string]: number } = {};

		Object.values(factions.items).forEach((faction) => {
			const { warehouse } = faction;

			if (faction.government && warehouse) list[faction.name] = warehouse.current;
		});

		return list;
	}

	private getRanks(player: Player) {
		const faction = factions.getFaction(player.faction);

		return faction
			? Array.from(faction.ranks.items.entries(), ([id, rank]) => ({
					id,
					name: rank.name,
					vaultAccess: !!(rank.permissions && (rank.permissions.inventory || rank.permissions.warehouse))
			  }))
			: [];
	}

	private getRankData(player: Player, rank: string) {
		const faction = factions.getFaction(player.faction);

		return faction && faction.ranks.getRank(rank);
	}

	private async getMembers(player: Player, amount: number) {
		const faction = factions.getFaction(player.faction);

		if (!faction) return [];

		const idList = Array.from(faction.members.getAll().keys()).slice(amount, amount + 50);
		const users = await CharModel.find({ _id: { $in: idList } })
			.select({ firstName: 1, lastName: 1, uid: 1 })
			.lean();

		return users.map(({ _id, firstName, lastName, uid }) => {
			const member = faction.members.getMemberById(_id.toString());
			const rank = faction.ranks.getRank(member.rank)?.name;

			return {
				userId: _id.toString(),
				uid,
				name: `${firstName} ${lastName}`,
				online: !!mp.players.getByDbId(_id),
				rank,
				vaultAccess: !!member.vaultAccess
			};
		});
	}

	private async manageRank(player: Player, action: 'add' | 'edit' | 'delete', data: any) {
		const faction = factions.getFaction(player.faction);
		if (!faction || !faction.isLeader(player)) throw new Error('Not a leader');
		if (!action || !data) throw new Error('Invalid arguments');

		if (action === 'add') {
			await faction.ranks.add(data.name, 0, !!data.vaultAccess);
		} else if (action === 'edit') {
			const rank = faction.ranks.getRank(data.id);
			if (!rank) throw new Error('Rank not found');
			
			// We only update name and permissions based on requested fields
			const permissions = { ...rank.permissions, inventory: !!data.vaultAccess, warehouse: !!data.vaultAccess };
			await FactionModel.findOneAndUpdate(
				{ name: faction.name, 'ranks._id': data.id },
				{ $set: { 'ranks.$.name': data.name, 'ranks.$.permissions': permissions } }
			);
			rank.name = data.name;
			rank.permissions = permissions;
		} else if (action === 'delete') {
            const rank = faction.ranks.getRank(data.id);
            if (rank?.permissions?.leader) throw new Error("Can't delete leader rank");
			await faction.ranks.delete(data.id);
		}
		return this.getRanks(player);
	}

	private async manageMember(player: Player, action: 'add' | 'edit' | 'delete', data: any) {
		const faction = factions.getFaction(player.faction);
		if (!faction || !faction.isLeader(player)) throw new Error('Not a leader');
		if (!action || !data) throw new Error('Invalid arguments');

		if (action === 'add') {
			const targetId = Number(data.targetId);
			if (isNaN(targetId)) throw new Error('ID-ul introdus nu este valid');

			const target = mp.players.getByFixId(targetId);

			if (target) {
				if (target.faction) throw new Error('Player is already in a faction');

				await faction.members.add(target, data.rankId);
				factions.loadForPlayer(target, faction);
			} else {
				const char = await CharModel.findOne({ uid: targetId }).lean() as any;
				if (!char) throw new Error(`Jucatorul offline cu UID ${targetId} nu a fost gasit.`);

				const dbId = char._id.toString();
				const existingFaction = Object.values(factions.items).find((f) => f.members.getMemberById(dbId));
				if (existingFaction) throw new Error('Player is already in a faction');

				await faction.members.add(dbId, data.rankId);
			}
		} else if (action === 'edit') {
			await faction.members.updateRank(data.id, data.rankId);
		} else if (action === 'delete') {
			await faction.members.delete(data.id);
		}
		return this.getMembers(player, 0);
	}

	private async getVehicles(player: Player) {
		const faction = factions.getFaction(player.faction);
		if (!faction?.garage) return [];

		const { garage } = faction;

		return Array.from(garage.vehicles.entries()).flatMap(([id, vehicle]) =>
			vehicle.despawnAt
				? []
				: {
						id,
						model: vehicle.name,
						govNumber: vehicle.numberPlate
				  }
		);
	}
}

export default new FactionsAPI();
