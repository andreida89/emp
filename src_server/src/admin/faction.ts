import factions from 'factions';
import gangZones from 'factions/gangs/zones';
import fortWar from 'factions/wars/fort';
import permissions from './permissions';
import Character from 'models/Character';
import FactionModel from 'models/Faction';
import { Types } from 'mongoose';
import FactionBuilder from 'factions/builder';

class AdminFaction {
	constructor() {
		mp.events.add({
			'Admin-SetFactionLeader': this.setLeader.bind(this),
			'Admin-StartFortWar': this.startFortWar.bind(this),
			'Admin-SetZoneOwner': this.setZoneOwner.bind(this),
			'server:adminAction:faction': this.handleAdminAction.bind(this),
			'server:adminOrgMarkers': this.handleOrgMarkers.bind(this)
		});
	}

	public async sendMafieList(playerMp: PlayerMp) {
		const factionsData = await FactionModel.find({ type: 'mafia' }).lean();
		const list: any[] = [];
		for (const f of factionsData) {
			let leaderInfo = "N/A";
			let leaderUid = 0;

			const leaderRank = f.ranks.find((r: any) => r.permissions && r.permissions.leader);
			if (leaderRank) {
				const leaderMember = f.members.find((m: any) => m.rank.toString() === leaderRank._id.toString());
				if (leaderMember) {
					const leaderChar = await Character.findById(leaderMember.userId, 'uid firstName lastName').lean();
					if (leaderChar) {
						leaderInfo = `${leaderChar.firstName} ${leaderChar.lastName}`;
						leaderUid = leaderChar.uid;
					}
				}
			}
			list.push({ id: f.name, numid: f.numid || 0, name: f.name, visualname: f.visualname || 'N/A', leader: leaderInfo, leaderUid: leaderUid, type: 'mafie' });
		}
		playerMp.call('client:setAdminList', ['LISTA MAFII', JSON.stringify(list)]);
	}

	public async sendGangList(playerMp: PlayerMp) {
		const factionsData = await FactionModel.find({ type: 'gang' }).lean();
		const list: any[] = [];
		for (const f of factionsData) {
			let leaderInfo = "N/A";
			let leaderUid = 0;

			const leaderRank = f.ranks.find((r: any) => r.permissions && r.permissions.leader);
			if (leaderRank) {
				const leaderMember = f.members.find((m: any) => m.rank.toString() === leaderRank._id.toString());
				if (leaderMember) {
					const leaderChar = await Character.findById(leaderMember.userId, 'uid firstName lastName').lean();
					if (leaderChar) {
						leaderInfo = `${leaderChar.firstName} ${leaderChar.lastName}`;
						leaderUid = leaderChar.uid;
					}
				}
			}
			list.push({ id: f.name, numid: f.numid || 0, name: f.name, visualname: f.visualname || 'N/A', leader: leaderInfo, leaderUid: leaderUid, type: 'gang' });
		}
		playerMp.call('client:setAdminList', ['LISTA GANGURI', JSON.stringify(list)]);
	}

	public async sendClanList(playerMp: PlayerMp) {
		const factionsData = await FactionModel.find({ type: 'clan' }).lean();
		const list: any[] = [];

		for (const f of factionsData) {
			let leaderInfo = "N/A";
			let leaderUid = 0;

			// Find leader rank ID
			const leaderRank = f.ranks.find((r: any) => r.permissions && r.permissions.leader);
			if (leaderRank) {
				const leaderMember = f.members.find((m: any) => m.rank.toString() === leaderRank._id.toString());
				if (leaderMember) {
					const char = await Character.findById(leaderMember.userId, 'uid firstName lastName').lean();
					if (char) {
						leaderInfo = `${char.firstName} ${char.lastName}`;
						leaderUid = char.uid;
					}
				}
			}

			list.push({
				id: f.name,
				numid: f.numid || 0,
				name: f.name,
				visualname: f.visualname || 'N/A',
				leader: leaderInfo,
				leaderUid: leaderUid,
				type: 'clanuri'
			});
		}

		playerMp.call('client:setAdminList', ['LISTA CLANURI', JSON.stringify(list)]);
	}

	private async setLeader(admin: Player, target: string, factionName: string) {
		if (!permissions.hasPermission(admin, 'manager')) return;

		const player = mp.players.getByFixId(target);

		if (!player || player.faction) {
			return mp.events.reject(`Acest jucator este deja liderul organizatiei ${player?.faction || ''}`);
		}

		const faction = factions.getFaction(factionName);

		if (faction) {
			const rank = Array.from(faction.ranks.items.keys()).find((item) =>
				faction.ranks.hasPermission(item, 'leader')
			);

			await faction.members.add(player, rank);
			factions.loadForPlayer(player, faction);
		}
	}

	private startFortWar(admin: Player) {
		if (!permissions.hasPermission(admin, 'manager')) return;

		fortWar.start();
	}

	private setZoneOwner(admin: Player, owner: string) {
		if (!permissions.hasPermission(admin, 'manager')) return;

		const zone = gangZones.getNearestZone(admin.waypoint);
		if (zone) gangZones.setOwner(zone, owner);
	}

	private async isMemberOfAnyFaction(dbId: string): Promise<string | null> {
		const faction = await FactionModel.findOne({ 'members.userId': new Types.ObjectId(dbId) }, 'name').lean();
		return faction ? faction.name : null;
	}

	public async handleAdminAction(playerMp: PlayerMp, action: string, dataStr: string) {
		const admin = mp.players.get(playerMp);
		console.log(`[AdminAction] action=${action}, data=${dataStr}, admin=${admin?.mp?.name}, lvl=${admin?.adminLvl}`);
		if (!admin || !admin.adminLvl || !permissions.hasPermission(admin, 'helperinteste')) return;

		let data: any = {};
		try { data = JSON.parse(dataStr); } catch (e) {}

		if (action === 'get_org_ranks') {
			const faction = factions.getFaction(data.clanId || data.org);
			if (!faction) return;

			const ranks = Array.from(faction.ranks.items.entries()).map(([id, r]) => ({
				id,
				name: r.name,
				salary: r.salary || 0,
				vaultAccess: !!(r.permissions && (r.permissions.inventory || r.permissions.warehouse))
			}));

			playerMp.call('client:setOrgRanks', [JSON.stringify(ranks)]);
		} else if (action === 'get_org_members') {
			const faction = factions.getFaction(data.clanId || data.org);
			if (!faction) return;

			const rankId = data.rankId;
			const membersAll = faction.members.getAll();
			const resultMembers: any[] = [];

			try {
				const memberEntries = Array.from(membersAll.entries());
				for (const [userId, m] of memberEntries) {
					if (!rankId || (m.rank && m.rank.toString() === rankId.toString())) {
						try {
							const char = await Character.findById(userId, 'firstName lastName uid').lean();
							if (char) {
								resultMembers.push({
									id: char.uid,
									dbId: userId,
									name: `${char.firstName} ${char.lastName}`,
									rankId: m.rank,
									rankName: faction.ranks.getRank(m.rank)?.name || 'N/A',
									vaultAccess: !!m.vaultAccess
								});
							}
						} catch (err) {
							console.error(`[AdminAction] findById failed for userId ${userId}:`, err);
						}
					}
				}
				playerMp.call('client:setOrgMembers', [JSON.stringify(resultMembers)]);
			} catch (e: any) {
				console.error(`[AdminAction] Error get_org_members loop: ${e.message}`);
				playerMp.notify(`~r~Eroare la incarcarea membrilor: ${e.message}`);
			}
		} else if (action === 'del_org_rank') {
			const faction = factions.getFaction(data.clanId || data.org);
			if (!faction) return playerMp.notify('~r~Organizatia nu a fost gasita.');

			try {
				await faction.ranks.delete(data.rankId);
				playerMp.notify('~g~Rankul a fost sters.');
				
				// Refresh ranks list
				this.handleAdminAction(playerMp, 'get_org_ranks', JSON.stringify({clanId: faction.name}));
			} catch (e: any) {
				playerMp.notify(`~r~Eroare: ${e.message}`);
			}
		} else if (action === 'save_org_ranks_order') {
			const faction = factions.getFaction(data.clanId || data.org);
			if (!faction) return;

			try {
				await faction.ranks.updateOrder(data.rankIds);
				playerMp.notify('~g~Ordinea rankurilor a fost salvata.');
			} catch (e: any) {
				playerMp.notify(`~r~Eroare: ${e.message}`);
			}
		} else if (action === 'add_org_member') {
			const faction = factions.getFaction(data.clanId || data.org);
			if (!faction) return playerMp.notify('~r~Organizatia nu a fost gasita.');

			const targetChar = await Character.findOne({ uid: parseInt(data.memberId) });
			if (!targetChar) return playerMp.notify('~r~Jucatorul nu a fost gasit in baza de date.');

			// Check if already in another organization
			const existingFaction = await this.isMemberOfAnyFaction(targetChar._id.toString());
			if (existingFaction) {
				return playerMp.notify(`~r~Jucatorul face deja parte din organizatia ${existingFaction}.`);
			}

			const targetPlayer = mp.players.getByDbId(targetChar._id.toString());
			
			try {
				const vaultAccess = data.vaultAccess === true || data.vaultAccess === 'true' || data.vaultAccess === 'DA';
				await faction.members.add({ dbId: targetChar._id } as any, data.rankId, vaultAccess);
				
				if (targetPlayer) {
					factions.loadForPlayer(targetPlayer, faction);
					targetPlayer.notify(`~g~Ai fost adaugat in organizatia ${faction.name}!`);
				}
				
				playerMp.notify(`~g~L-ai adaugat pe ${targetChar.firstName} ${targetChar.lastName} in organizatie.`);
				
				// Refresh members list
				this.handleAdminAction(playerMp, 'get_org_members', JSON.stringify({org: data.org, clanId: faction.name}));
			} catch (e: any) {
				playerMp.notify(`~r~Eroare: ${e.message}`);
			}
		} else if (action === 'del_org_member') {
			const faction = factions.getFaction(data.clanId || data.org);
			if (!faction) return playerMp.notify('~r~Organizatia nu a fost gasita.');

			// find dbId by UID
			const char = await Character.findOne({ uid: parseInt(data.memberId) }, '_id').lean();
			if (!char) return playerMp.notify('~r~Membrul nu a fost gasit.');

			try {
				await faction.members.delete(char._id.toString());
				const target = mp.players.getByDbId(char._id.toString());
				if (target) {
					target.faction = '';
					target.mp.setVariable('faction', '');
					target.notify('~r~Ai fost scos din organizatie.');
				}
				playerMp.notify('~g~Membrul a fost scos din organizatie.');
				
				// Refresh all members list
				this.handleAdminAction(playerMp, 'get_org_members', JSON.stringify({org: data.org, clanId: faction.name}));
			} catch (e: any) {
				playerMp.notify(`~r~Eroare: ${e.message}`);
			}
		} else if (action === 'create_clan') {
			console.log(`[AdminAction] Entered create_clan block. Checking permissions...`);
			if (!permissions.hasPermission(admin, 'manager')) {
				console.log(`[AdminAction] Permission DENIED for ${admin.mp.name}. Needs 'manager' permission.`);
				return playerMp.notify('~r~Nu ai permisiunea [manager] pentru a crea clanuri.');
			}
			
			const name = data.name;
			const visualname = data.visualname;
			const leaderUid = parseInt(data.id);
			
			console.log(`[AdminAction] Data check: name=${name}, visualname=${visualname}, leaderUid=${leaderUid}`);

			if (!name || isNaN(leaderUid)) {
				console.log(`[AdminAction] Invalid data provided.`);
				return playerMp.notify('~r~Date introduse incorect (Nume sau ID Lider invalid).');
			}
			
			try {
				console.log(`[AdminAction] Finding leader character with UID: ${leaderUid}`);
				const leaderChar = await Character.findOne({ uid: leaderUid });
				if (!leaderChar) {
					console.log(`[AdminAction] Leader character NOT FOUND.`);
					return playerMp.notify('~r~Liderul nu a fost gasit.');
				}

				const existingFactionName = await this.isMemberOfAnyFaction(leaderChar._id.toString());
				if (existingFactionName) {
					return playerMp.notify(`~r~Acest jucator este deja liderul organizatiei ${existingFactionName}`);
				}

				console.log(`[AdminAction] Checking if clan "${name}" exists...`);
				const exists = await FactionModel.findOne({ name });
				if (exists) {
					console.log(`[AdminAction] Clan already exists.`);
					return playerMp.notify('~r~Un clan cu acest nume exista deja.');
				}

				// Get max numid
				const lastClan = await FactionModel.findOne({ type: 'clan' }).sort({ numid: -1 }).limit(1).lean();
				const nextNumId = (lastClan?.numid || 0) + 1;

				console.log(`[AdminAction] Creating FactionModel entry with numid: ${nextNumId}`);
				const newFactionData = await FactionModel.create({
					name,
					visualname: visualname || name,
					numid: nextNumId,
					type: 'clan',
					ranks: [{ name: 'Lider', salary: 0, permissions: { leader: true, members: true, inventory: true, warehouse: true, garage: true } }],
					members: []
				});

				console.log(`[AdminAction] FactionModel created. ID: ${newFactionData._id}. Building faction...`);
				const builder = new FactionBuilder(name, false);
				const newFaction = builder.build();
				await newFaction.load(newFactionData);

				console.log(`[AdminAction] Adding leader to faction...`);
				const rank = Array.from(newFaction.ranks.items.keys())[0];
				
				// Added the leader properly (handles both online and offline internally via dbId)
				await newFaction.members.add({ dbId: leaderChar._id } as any, rank);

				const leaderPlayer = mp.players.getByDbId(leaderChar._id.toString());
				if (leaderPlayer) {
					console.log(`[AdminAction] Leader player IS ONLINE (${leaderPlayer.name}). Synchronizing...`);
					factions.loadForPlayer(leaderPlayer, newFaction);
				} else {
					console.log(`[AdminAction] Leader player is OFFLINE. Clan created and leader assigned in DB/Memory.`);
				}

				playerMp.call('AnuntNotification2', [`Clanul ${name} a fost creat cu succes!`, 'success']);
				console.log(`[AdminAction] Clan ${name} created successfully.`);
			} catch (err: any) {
				console.log(`[AdminAction] ERROR during creation: ${err.stack || err.message}`);
				playerMp.call('AnuntNotification2', [`Eroare la crearea clanului: ${err.message}`, 'danger']);
			}
		} else if (action === 'create_mafia' || action === 'create_gang') {
			if (!permissions.hasPermission(admin, 'manager')) return;
			
			const name = data.name; 
			const visualname = data.visualname;
			const leaderUid = parseInt(data.id);
			
			const leaderChar = await Character.findOne({ uid: leaderUid });
			if (!leaderChar) return playerMp.call('AnuntNotification2', ['Liderul nu a fost gasit.', 'danger']);

			const existingFactionName = await this.isMemberOfAnyFaction(leaderChar._id.toString());
			if (existingFactionName) {
				return playerMp.call('AnuntNotification2', [`Acest jucator este deja liderul organizatiei ${existingFactionName}`, 'danger']);
			}

			const exists = await FactionModel.findOne({ name });
			if (exists) return playerMp.call('AnuntNotification2', ['O organizatie cu acest nume exista deja.', 'danger']);

			const newFactionData = await FactionModel.create({
				name,
				visualname: visualname || name,
				type: action === 'create_gang' ? 'gang' : 'mafia',
				ranks: [{ name: 'Lider', salary: 0, permissions: { leader: true, members: true, inventory: true, warehouse: true, garage: true } }],
				members: []
			});

			const builder = new FactionBuilder(name, action === 'create_gang'); // true for gang, false for mafia
			const newFaction = builder.build();
			await newFaction.load(newFactionData);

			const rank = Array.from(newFaction.ranks.items.keys())[0];
			await newFaction.members.add({ dbId: leaderChar._id } as any, rank);

			const leaderPlayer = mp.players.getByDbId(leaderChar._id.toString());
			if (leaderPlayer) {
				factions.loadForPlayer(leaderPlayer, newFaction);
			}

			playerMp.call('AnuntNotification2', [`${action === 'create_gang' ? 'Gang-ul' : 'Mafia'} ${name} a fost creata cu succes!`, 'success']);
		} else if (action === 'confirm_delete') {
			if (!permissions.hasPermission(admin, 'manager')) return;
			const target = data.targetItem;
			if (!target) return;

			console.log(`[AdminAction] confirm_delete received for target.id=${target.id}, type=${target.type}`);

			if (target.type === 'clanuri' || target.type === 'mafie' || target.type === 'gang') {
				// Re-route to the specific delete action
				const realAction = target.type === 'clanuri' ? 'delete_clan' : (target.type === 'mafie' ? 'delete_mafie' : 'delete_gang');
				await this.handleAdminAction(playerMp, realAction, JSON.stringify({ id: target.id }));
			} else if (target.type === 'delete_mafie' || target.type === 'delete_gang' || target.type === 'delete_clan') {
				await this.handleAdminAction(playerMp, target.type, JSON.stringify({ id: target.id }));
			} else {
				// Generic delete for houses/biz if needed
				playerMp.notify(`~r~Tip de obiect invalid pentru stergere directa: ${target.type}`);
			}
		} else if (action === 'edit_clan_info') {
			if (!permissions.hasPermission(admin, 'manager')) return;
			const faction = factions.getFaction(data.targetItem.id);
			if (!faction) return playerMp.notify('~r~Clanul nu a fost gasit in memorie.');

			const oldName = data.targetItem.id;
			const newName = data.name;
			const newVisualName = data.visualname;

			try {
				if (oldName !== newName) {
					const exists = await FactionModel.findOne({ name: newName });
					if (exists) return playerMp.notify('~r~Un clan cu acest nume exista deja.');
					
					await FactionModel.findOneAndUpdate({ name: oldName }, { name: newName, visualname: newVisualName });
					
					// Update in memory
					faction.name = newName;
					faction.ranks.faction = newName;
					faction.members.faction = newName;
					faction.money.faction = newName;
					
					factions.items[newName] = faction;
					delete factions.items[oldName];
				} else {
					await FactionModel.findOneAndUpdate({ name: oldName }, { visualname: newVisualName });
				}
				
				faction.visualname = newVisualName;

				playerMp.notify(`~g~Clanul a fost actualizat.`);
				this.sendClanList(playerMp);
			} catch (e: any) {
				console.error(`[AdminAction] Error edit_clan_info: ${e.message}`);
				playerMp.notify(`~r~Eroare: ${e.message}`);
			}
		} else if (action === 'add_org_rank') {
			const faction = factions.getFaction(data.clanId || data.org);
			if (!faction) return playerMp.notify('~r~Organizatia nu a fost gasita.');

			try {
				const vaultAccess = data.vaultAccess === true || data.vaultAccess === 'true' || data.vaultAccess === 'DA';
				await faction.ranks.add(data.name, parseInt(data.salary) || 0, vaultAccess);
				playerMp.notify(`~g~Rankul ${data.name} a fost adaugat.`);
				
				// Refresh ranks list
				this.handleAdminAction(playerMp, 'get_org_ranks', JSON.stringify({clanId: faction.name}));
			} catch (e: any) {
				playerMp.notify(`~r~Eroare: ${e.message}`);
			}
		} else if (action === 'update_org_rank') {
			const faction = factions.getFaction(data.clanId || data.org);
			if (!faction) return playerMp.notify('~r~Organizatia nu a fost gasita.');

			try {
				const rank = faction.ranks.getRank(data.rankId);
				if (!rank) return playerMp.notify('~r~Rankul nu a fost gasit.');

				const vaultAccess = data.vaultAccess === true || data.vaultAccess === 'true' || data.vaultAccess === 'DA';

				rank.name = data.name;
				rank.salary = parseInt(data.salary) || 0;
				if (!rank.permissions) rank.permissions = {};
				rank.permissions.inventory = vaultAccess;
				rank.permissions.warehouse = vaultAccess;
				
				await FactionModel.findOneAndUpdate(
					{ name: faction.name, 'ranks._id': data.rankId },
					{ $set: { 'ranks.$.name': data.name, 'ranks.$.salary': rank.salary, 'ranks.$.permissions': rank.permissions } }
				);

				playerMp.notify('~g~Rankul a fost actualizat.');
				this.handleAdminAction(playerMp, 'get_org_ranks', JSON.stringify({clanId: faction.name}));
			} catch (e: any) {
				console.error(`[AdminAction] Error update_org_rank: ${e.message}`);
				playerMp.notify(`~r~Eroare: ${e.message}`);
			}
		} else if (action === 'update_org_member') {
			const faction = factions.getFaction(data.clanId || data.org);
			if (!faction) return;

			try {
				const char = await Character.findOne({ uid: parseInt(data.memberId) });
				if (!char) return;

				const vaultAccess = data.vaultAccess === true || data.vaultAccess === 'true' || data.vaultAccess === 'DA';
				await faction.members.updateRank(char._id.toString(), data.rankId, vaultAccess);
				
				playerMp.notify('~g~Membrul a fost actualizat.');
				// Refresh all members list
				this.handleAdminAction(playerMp, 'get_org_members', JSON.stringify({org: data.org, clanId: faction.name}));
			} catch (e: any) {
				playerMp.notify(`~r~Eroare: ${e.message}`);
			}
		} else if (action === 'delete_clan' || action === 'delete_mafie' || action === 'delete_gang') {
			if (!permissions.hasPermission(admin, 'manager')) return;
			
			const name = data.id;
			console.log(`[AdminAction] Deleting Org: action=${action}, name=${name}`);
			const faction = factions.getFaction(name);
			if (!faction) {
                console.log(`[AdminAction] Faction NOT found in memory for name: ${name}. Only attempting DB deletion.`);
            } else {
                console.log(`[AdminAction] Faction found in memory, destroying...`);
                await faction.destroy();
            }

            console.log(`[AdminAction] Deleting from DB: ${name}...`);
			await FactionModel.deleteOne({ name });
			console.log(`[AdminAction] Deleted from DB.`);
			
			// Remove from memory
			delete factions.items[name];
			
			playerMp.notify(`~g~Organizatia ${name} a fost stearsa.`);
			if (action === 'delete_clan') this.sendClanList(playerMp);
            else if (action === 'delete_mafie') this.sendMafieList(playerMp);
            else if (action === 'delete_gang') this.sendGangList(playerMp);
		}
	}

	private async handleOrgMarkers(playerMp: PlayerMp, action: string, dataStr: string) {
		const admin = mp.players.get(playerMp);
		console.log(`[AdminOrgMarkers] Received action=${action}, data=${dataStr}, admin=${admin?.mp?.name}`);
		
		if (!admin || !admin.adminLvl || !permissions.hasPermission(admin, 'manager')) {
			console.log(`[AdminOrgMarkers] Permission denied or admin not found.`);
			return playerMp.notify('~r~Nu ai permisiunea [manager] pentru aceasta actiune.');
		}

		let data: any = {};
		try { data = JSON.parse(dataStr); } catch (e) {
			console.log(`[AdminOrgMarkers] Failed to parse dataStr: ${e.message}`);
		}

		const orgId = data.id || data.orgId; // Organization name
		console.log(`[AdminOrgMarkers] target orgId=${orgId}`);
		
		const faction = factions.getFaction(orgId);
		if (!faction) {
			console.log(`[AdminOrgMarkers] Faction not found in memory: ${orgId}`);
			return playerMp.notify('~r~Organizatia nu a fost gasita in memorie.');
		}

		const position = playerMp.position;
		console.log(`[AdminOrgMarkers] Executing ${action} at ${JSON.stringify(position)}`);

		try {
			if (action === 'add_safe') {
				await faction.createInventory(position, { cells: 100, slots: 5000 });
				const res = await FactionModel.updateOne({ name: orgId }, { $set: { vaultCoords: { x: position.x, y: position.y, z: position.z } } });
				console.log(`[AdminOrgMarkers] DB Update save_safe result:`, JSON.stringify(res));
				playerMp.notify(`~g~Seif adaugat pentru ${orgId} la locatia curenta.`);
			} else if (action === 'add_garage') {
				await faction.createGarage(position);
				const res = await FactionModel.updateOne({ name: orgId }, { $set: { garageCoords: { x: position.x, y: position.y, z: position.z } } });
				console.log(`[AdminOrgMarkers] DB Update add_garage result:`, JSON.stringify(res));
				playerMp.notify(`~g~Garaj adaugat pentru ${orgId} la locatia curenta.`);
			} else if (action === 'del_safe') {
				faction.inventory = undefined;
				const res = await FactionModel.updateOne({ name: orgId }, { $unset: { vaultCoords: "" } });
				console.log(`[AdminOrgMarkers] DB Update del_safe result:`, JSON.stringify(res));
				playerMp.notify(`~g~Seif sters pentru ${orgId}.`);
			} else if (action === 'del_garage') {
				faction.garage = undefined;
				const res = await FactionModel.updateOne({ name: orgId }, { $unset: { garageCoords: "" } });
				console.log(`[AdminOrgMarkers] DB Update del_garage result:`, JSON.stringify(res));
				playerMp.notify(`~g~Garaj sters pentru ${orgId}.`);
			}
		} catch (err: any) {
			console.error(`[AdminOrgMarkers] ERROR: ${err.message}`);
			playerMp.notify(`~r~Eroare server: ${err.message}`);
		}
	}
}

export const admFaction = new AdminFaction();
