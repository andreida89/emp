import FactionModel from 'models/Faction';

export type Permission =
	| 'warehouse'
	| 'inventory'
	| 'garage'
	| 'workshop'
	| 'leader'
	| 'members'
	| 'wanted';

export type Rank = {
	name: string;
	salary: number;
	permissions: {
		[key in Permission]?: boolean;
	};
};

class FactionRanks {
	public items: Map<string, Rank>;

	public faction: string;

	constructor(faction: string) {
		this.faction = faction;
		this.items = new Map();
	}

	getRank(id: string) {
		return id && this.items.get(id.toString());
	}

	load(ranks: any[]) {
		ranks.forEach((r) => {
			const item = r && typeof r.toObject === 'function' ? r.toObject() : r;
			if (!item) return;
			const id = (item._id || item.id)?.toString();
			if (!id) return;
			const { _id, id: _, ...rest } = item;
			this.items.set(id, rest as Rank);
		});
	}

	hasPermission(rank: string, type: Permission) {
		const data = this.getRank(rank);

		return data && !!data.permissions[type];
	}

	async upatePermissions(rank: string, permissions: Rank['permissions']) {
		const data = this.getRank(rank);

		if (!data) throw new Error("rank doesn't exists");
		if (data.permissions.leader !== permissions?.leader) {
			throw new Error('this permission is read only');
		}

		await FactionModel.findOneAndUpdate(
			{ name: this.faction, 'ranks._id': rank },
			{ $set: { 'ranks.$.permissions': permissions } }
		);

		data.permissions = permissions;
	}

	async add(name: string, salary: number, vaultAccess: boolean) {
		const permissions = vaultAccess ? { inventory: true, warehouse: true } : {};
		const result = await FactionModel.findOneAndUpdate(
			{ name: this.faction },
			{ $push: { ranks: { name, salary, permissions } } },
			{ new: true }
		);
		const newRank = result.ranks[result.ranks.length - 1];
		this.items.set(newRank._id.toString(), { name, salary, permissions });
		return newRank;
	}

	async delete(rankId: string) {
		if (!this.items.has(rankId)) throw new Error("rank doesn't exists");
		await FactionModel.findOneAndUpdate(
			{ name: this.faction },
			{ $pull: { ranks: { _id: rankId } } }
		);
		this.items.delete(rankId);
	}

	async updateOrder(rankIds: string[]) {
		// In a real implementation this would reorder the array in DB
		// For now we just update the items Map to reflect local order if needed
		// Faction models in memory usually don't care about order unless specifically implemented
	}
}

export default FactionRanks;
