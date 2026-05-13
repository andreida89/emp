import FactionModel from 'models/Faction';
import { SilentError } from 'utils/errors';

type Member = {
	rank: string;
	vaultAccess: boolean;
};

class FactionMembers {
	private items: Map<string, Member>;

	public faction: string;

	constructor(faction: string) {
		this.faction = faction;
		this.items = new Map();
	}

	load(items: any[]) {
		items.forEach((item) => this.items.set(item.userId.toString(), { rank: item.rank, vaultAccess: !!item.vaultAccess }));
	}

	getAll() {
		return this.items;
	}

	getMember(player: Player) {
		return player?.dbId && this.items.get(player.dbId.toString());
	}

	getMemberById(id: string) {
		return id && this.items.get(id.toString());
	}

	async add(playerOrId: Player | string, rank: string, vaultAccess = false) {
		const dbId = typeof playerOrId === 'string' ? playerOrId : playerOrId.dbId.toString();

		if (this.getMemberById(dbId)) throw new SilentError('player is already a member');
		if (this.getAll().size > 300) throw new SilentError('limit of members reached');

		await FactionModel.findOneAndUpdate(
			{ name: this.faction },
			{ $push: { members: { userId: dbId, rank, vaultAccess } } }
		);
		this.items.set(dbId, { rank, vaultAccess });
	}

	async updateRank(playerId: string, rank: string, vaultAccess?: boolean) {
		const dbId = playerId.toString();
		const member = this.items.get(dbId);
		if (!member) throw new Error("member doesn't exists");

		const update: any = { 'members.$.rank': rank };
		if (vaultAccess !== undefined) update['members.$.vaultAccess'] = vaultAccess;

		await FactionModel.findOneAndUpdate(
			{ name: this.faction, 'members.userId': dbId },
			{ $set: update }
		);
		member.rank = rank;
		if (vaultAccess !== undefined) member.vaultAccess = vaultAccess;
	}

	async update(playerId: string, data: Partial<Member>) {
		const dbId = playerId.toString();
		const member = this.items.get(dbId);
		if (!member) throw new SilentError("member doesn't exists");

		const updatedMember = { ...member, ...data, userId: dbId };

		await FactionModel.findOneAndUpdate(
			{ name: this.faction, 'members.userId': dbId },
			{ $set: { 'members.$': updatedMember } }
		);
		this.items.set(dbId, updatedMember);
	}

	async delete(playerId: string) {
		const dbId = playerId.toString();
		if (!this.items.has(dbId)) throw new SilentError("member doesn't exists");

		await FactionModel.findOneAndUpdate(
			{ name: this.faction },
			{ $pull: { members: { userId: dbId } } }
		);
		this.items.delete(dbId);
	}
}

export default FactionMembers;
