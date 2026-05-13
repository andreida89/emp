import money from 'helpers/money';
import hud from 'helpers/hud';
import chat from 'basic/chat';
import jucator from 'helpers/players';
import permissions from './permissions';
import teleport from './teleport';
import banSystem from './ban';
import playerInventory from 'player/inventory';
import houseCtrl from 'house/entities';
import businessCtrl from 'business/entities';
import vehicleCreator, { Builder } from 'vehicle/creator';
import './report';
import './vehicle';
import './house';
import './business';
import './demorgan';
import { admFaction } from './faction';
import './noclip';
import CharacterModel from 'models/Character';
import playerDeath from 'player/death';
import factions from 'factions';
import FactionModel from 'models/Faction';

class Admin {
	private delAllTimeouts: NodeJS.Timeout[] = [];
	constructor() {
		this.addCommands({
			esp: this.toggleESP,
			inv: this.toggleInvisible,
			adm: this.toggleLabel.bind(this),
			gm: this.toggleGM.bind(this),
			cords: this.printCords.bind(this)
		});

		this.subscribeToEvents();
	}

	private findCharacterById(id: string | number): Player | undefined {
		const numId = parseInt(id.toString(), 10);
		if (isNaN(numId)) return undefined;
		return mp.players.toCustomArray().find(p => p.fixId === numId);
	}

	private async findDbIdByUid(id: string | number): Promise<string | null> {
		const numId = parseInt(id.toString(), 10);
		if (isNaN(numId)) return null;

		// Try online first - check if any online player has this UID
		const online = mp.players.toCustomArray().find(p => p.fixId === numId);
		if (online) return online.dbId;

		// Try database as fallback (works for offline and online players)
		const char = await CharacterModel.findOne({ uid: numId }, '_id').lean();
		return char ? char._id.toString() : null;
	}

	private async sendHouseList(playerMp: PlayerMp) {
		const ownersIds = houseCtrl.items.filter(h => h && h.owner).map(h => h.owner);
		const ownersData = await CharacterModel.find({ _id: { $in: ownersIds } }, 'firstName lastName uid').lean();
		const ownersMap = new Map();
		ownersData.forEach(owner => {
			ownersMap.set(owner._id.toString(), owner);
		});

		// Grouping logic: group by position
		const groups = new Map<string, any[]>();
		houseCtrl.items.forEach((h: any) => {
			if (!h) return;
			const key = `${h.position.x.toFixed(1)}_${h.position.y.toFixed(1)}_${h.position.z.toFixed(1)}`;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)!.push(h);
		});

		const data: any[] = [];
		groups.forEach((entities, key) => {
			const first = entities[0];
			const indices = entities.map(e => e.customId || e.index).sort((a: number, b: number) => a - b).join('/');
			const ownerInfo = first.owner ? ownersMap.get(first.owner.toString()) : null;
			const isMultiple = entities.length > 1;
			
			data.push({
				id: first.customId || first.index,
				index: first.index,
				info: `Casa ${first.type || 'Simpla'} #${indices}${first.name ? ` (${first.name})` : ''}`,
				owner: isMultiple ? "Multiple" : (first.owner ? (ownerInfo ? `${ownerInfo.firstName} ${ownerInfo.lastName} (ID: ${ownerInfo.uid})` : `Proprietar ID: ${first.owner}`) : "Server (La Vanzare)"),
				ownerId: first.owner,
				ownerUid: ownerInfo?.uid,
				price: first.price || 0,
				type: 'house',
				coords: `${first.position.x.toFixed(2)}, ${first.position.y.toFixed(2)}, ${first.position.z.toFixed(2)}`
			});
		});

		playerMp.call('client:setAdminList', ['LISTA CASE', JSON.stringify(data)]);
	}

	private async sendBusinessList(playerMp: PlayerMp) {
		const ownersIds = businessCtrl.items.filter(b => b && b.owner).map(b => b.owner);
		const ownersData = await CharacterModel.find({ _id: { $in: ownersIds } }, 'firstName lastName uid').lean();
		const ownersMap = new Map();
		ownersData.forEach(owner => {
			ownersMap.set(owner._id.toString(), owner);
		});

		const data = businessCtrl.items.filter(b => b).map(b => {
			const ownerInfo = b.owner ? ownersMap.get(b.owner.toString()) : null;
			return {
				id: b.customId || b.index,
				index: b.index,
				info: `${b.type} #${b.customId || b.index}${b.name ? ` (${b.name})` : ''}`,
				owner: b.owner ? (ownerInfo ? `${ownerInfo.firstName} ${ownerInfo.lastName} (ID: ${ownerInfo.uid})` : `Proprietar ID: ${b.owner}`) : "Server (La Vanzare)",
				ownerId: ownerInfo ? ownerInfo.uid : (b.owner || "LA VANZARE"),
				ownerUid: ownerInfo?.uid,
				price: b.price || 0,
				type: 'business',
				coords: `${b.position.x.toFixed(2)}, ${b.position.y.toFixed(2)}, ${b.position.z.toFixed(2)}`
			};
		});
		playerMp.call('client:setAdminList', ['LISTA AFACERI', JSON.stringify(data)]);
	}

	private async sendGarageList(playerMp: PlayerMp, typeFilter?: string) {
		const garageEntities = require('../garage/entities').default;
		
		let items = garageEntities.items.filter((g: any) => g);
		if (typeFilter && typeFilter !== 'toate') {
			items = items.filter((g: any) => g.type === typeFilter);
		}

		// Grouping logic: group by position and type
		const groups = new Map<string, any[]>();
		items.forEach((g: any) => {
			const key = `${g.position.x.toFixed(1)}_${g.position.y.toFixed(1)}_${g.position.z.toFixed(1)}_${g.type}`;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)!.push(g);
		});

		const data: any[] = [];
		groups.forEach((entities, key) => {
			const first = entities[0];
			const indices = entities.map(e => e.index).sort((a, b) => a - b).join('/');
			const names = entities.filter(e => e.name).map(e => e.name).filter((v, i, a) => a.indexOf(v) === i).join(', ');
			
			data.push({
				id: first.index,
				index: first.index,
				info: `Garaj ${typeof first.type === 'string' ? first.type.toUpperCase() : first.type} ${indices}${names ? ` (${names})` : ''}`,
				owner: "Admin/Server",
				ownerId: "SERVER",
				price: 0,
				type: 'garage',
				coords: `${first.position.x.toFixed(2)}, ${first.position.y.toFixed(2)}, ${first.position.z.toFixed(2)}`
			});
		});

		playerMp.call('client:setAdminList', [`LISTA GARAJE${typeFilter && typeFilter !== 'toate' ? ` (${typeFilter.toUpperCase()})` : ''}`, JSON.stringify(data)]);
	}

	private getSelfCoords(admin: Player) {
		if (!admin || !admin.mp || !admin.mp.position) {
			return null;
		}
		if (!permissions.hasPermission(admin, 'helperinteste')) return null;
		const { x, y, z } = admin.mp.position;
		return { x, y, z };
	}

	private kickPlayer(admin: Player, target: string, reason: string) {
		if (!permissions.hasPermission(admin, 'helperinteste')) return;

		const player = this.findCharacterById(target);

		if (player) {
			player.mp.kick(reason);

			//journal.recordAction(admin, 'kick', `${player.getName()} | ${reason}`, player.dbId);
			chat.sendSystem(`${admin.getName()} a dat kick lui ${player.getName()} (${reason})`);
		}
	}

	private changePlayerModel(admin: Player, target: string, model: string) {
		if (!permissions.hasPermission(admin, 'manager')) return;

		const player = this.findCharacterById(target);

		if (player) {
			player.mp.model = mp.joaat(model);
			//journal.recordAction(admin, 'skin', `${player.getName()} | ${model}`, player.dbId);
		}
	}

	private async changeMoney(admin: Player, dbId: string, sum: number) {
		if (!permissions.hasPermission(admin, 'manager')) return;

		const target = this.findCharacterById(dbId);
		if (!target) return;

		await money.change(target, 'bank', sum, `admin money | ${admin.dbId}`);
		//journal.recordAction(admin, 'money', `${target.getName()} | ${sum}$`, dbId);
	}

	private spectateForPlayer(admin: Player, target?: number) {
		if (!permissions.hasPermission(admin, 'helper')) return;

		admin.callEvent('Admin-Spectate', mp.players.get(target)?.mp);
	}

	private toggleESP(admin: Player, mode: any) {
		if (!permissions.hasPermission(admin, 'helper')) return;

		admin.callEvent('Admin-ToggleESP', parseInt(mode, 10));
	}

	private toggleGM(admin: Player) {
		if (!permissions.hasPermission(admin, 'helper')) return;

		const status = !admin.mp.getVariable('AGM');

		admin.mp.setVariable('AGM', status);
		admin.callEvent('Admin-SetGM', status);
	}

	private printCords(admin: Player) {
		if (!permissions.hasPermission(admin, 'helper')) return;

		chat.sendSystem(`Cords: ${admin.mp.position} - ${admin.mp.heading}`);
	}

	private toggleInvisible(admin: Player) {
		if (!permissions.hasPermission(admin, 'helper')) return;

		const { mp } = admin;

		if (!mp.alpha) mp.alpha = 255;
		else mp.alpha = 0;

		mp.setVariable('invisible', !mp.alpha);
	}

	private toggleLabel(admin: Player) {
		if (!permissions.hasPermission(admin, 'helper')) return;

		const status: boolean = admin.mp.getVariable('ALABEL');

		admin.mp.setVariable('ALABEL', !status);

		hud.showNotification(
			admin,
			'success',
			`Statusul adminului ${status ? 'dezactivat' : 'activat'}`
		);
	}

	private teleport(admin: Player, type: string, target: number, coords: PositionEx) {
		if (!permissions.hasPermission(admin, 'helperinteste')) return;
		if (type === 'coords' && !permissions.hasPermission(admin, 'helper')) return;

		switch (type) {
			case 'player':
				teleport.toPlayer(admin, target);
				break;
			case 'yourself':
				teleport.toYourself(admin, target);
				break;
			case 'waypoint':
				teleport.toWaypoint(admin);
				break;
			case 'coords':
				const x = parseFloat(coords.x as unknown as string);
				const y = parseFloat(coords.y as unknown as string);
				const z = parseFloat(coords.z as unknown as string);
				if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
					admin.tp({x, y, z} as any);
				}
				break;
			default:
				break;
		}
	}

	private sendChatMessage(admin: Player, text: string) {
		if (!permissions.hasPermission(admin, 'administrator')) return;

		chat.sendSystem(text);
		//journal.recordAction(admin, 'notify', `${text}`);
	}

	private getPlayers(player: Player) {
		if (!player.adminLvl) return [];

		return mp.players
			.toCustomArray()
			.map((item) => ({ id: item.mp.id, dbId: item.dbId, name: item.getName() }));
	}

	private addCommands(list: { [name: string]: (player: Player, data: any) => any }) {
		Object.entries(list).forEach(([name, callback]) => {
			mp.events.addCommand(name, (entity: PlayerMp, data: any) => {
				const player = mp.players.get(entity);

				if (player) {
					const onDuty = player.admin_duty || (player.mp && player.mp.getVariable('admin_duty'));
					if (player.adminLvl > 0 && !onDuty) {
						player.mp.call('AnuntNotification2', ['DUTY', 'Trebuie sa fii ON DUTY (/aduty)!', 'rosu']);
						return;
					}
					callback(player, data);
				}
			});
		});
	}

	private subscribeToEvents() {
		mp.events.subscribe({
			'Admin-GetPlayers': this.getPlayers,
			'Admin-Kick': this.kickPlayer.bind(this),
			'Admin-Teleport': this.teleport.bind(this),
			'Admin-ChangeSkin': this.changePlayerModel.bind(this),
			'Admin-ChangeMoney': this.changeMoney.bind(this),
			'Admin-Spectate': this.spectateForPlayer.bind(this),
			'Admin-SendToChat': this.sendChatMessage.bind(this),
			'Admin-GetSelfCoords': this.getSelfCoords.bind(this),
			'Admin-GetLastHouseId': (player: Player) => {
				const lastHouse = houseCtrl.items.filter(h => h && h.customId && typeof h.customId === 'number').sort((a,b) => (b.customId || 0) - (a.customId || 0))[0];
				const id = lastHouse ? lastHouse.customId : 0;
				player.call('client:setLastHouseId', [id]);
			},
			'Admin-Revive': async (player: Player, targetId: string) => {	
				const targetPlayer = this.findCharacterById(targetId);
				if (!targetPlayer) {
					return;
				}
				try {
					playerDeath.revive(targetPlayer);
				} catch (error) {
				}
			},
			'Admin-Rspwn': async (player: Player, targetId: string) => {

    			const targetPlayer = this.findCharacterById(targetId);
    			if (!targetPlayer) {
        			return;
    			}
    			try {
        			playerDeath.rspwn(targetPlayer);
    			} catch (error) {
    			}
			}
		});

		mp.events.add({
			'client:whitelistAction': async (playerMp: PlayerMp, action: string, dataStr: any) => {
				const player = mp.players.get(playerMp);
				if (!player || !player.adminLvl || !permissions.hasPermission(player, 'helperinteste')) return;
				
				const wl = require('../helpers/whitelist');
				if (action === 'toggle') {
					const status = dataStr === 'true' || dataStr === true || dataStr === '1' || dataStr === 1;
					await wl.setWhitelistEnabled(status);
					playerMp.notify(`Whitelist a fost ${status ? '~g~ACTIVAT' : '~r~DEZACTIVAT'}`);
				} else {
					let data: any = {};
					if (typeof dataStr === 'string' && dataStr.startsWith('{')) {
						try { data = JSON.parse(dataStr); } catch (e) {}
					} else if (typeof dataStr === 'object') {
						data = dataStr;
					}

					if (action === 'add' || action === 'edit') {
						if (!data.name || !data.serial) return playerMp.notify('~r~Date invalide (nume sau serial lipsa).');
						await wl.addToWhitelist(data.name, data.serial);
						playerMp.notify(`Jucatorul ~g~${data.name}~w~ a fost adaugat/editat in whitelist.`);
					} else if (action === 'delete') {
						if (!data.serial) return playerMp.notify('~r~Serial lipsa pentru stergere.');
						await wl.removeFromWhitelist(data.serial);
						playerMp.notify(`Serialul a fost ~r~sters~w~ din whitelist.`);
					}
					// Auto refresh list
					const rawList = await wl.getWhitelistData();
					const list = rawList.map((item: any) => ({
						id: item.serial,
						info: item.name,
						owner: 'Whitelist',
						type: 'whitelist'
					}));
					playerMp.call('client:setAdminList', ['WHITELIST MANAGE', JSON.stringify(list)]);
				}
			},
			'server:requestAdminMenu': async (playerMp: PlayerMp) => {
				const player = mp.players.get(playerMp);
				if (!player || !player.adminLvl) return;

				const wl = require('../helpers/whitelist');
				const adminDuty = player.adminDuty || (player.mp && player.mp.getVariable('admin_duty')) || false;
				
				playerMp.call('client:openAdminMenu', [player.adminLvl, adminDuty, wl.isWhitelistEnabled()]);
			}
		});

		mp.events.add('Admin-SelfRevive', (player: Player) => {
			if (player.admin_duty) {
				playerDeath.revive(player);
				player.call('client:updateHealth', [100]);
				player.notify('~g~Te-ai inviat (Self-Revive).');
			}
		});

		mp.events.add('server:adminVeh', async (playerMp: PlayerMp, action: string, dataStr: string) => {
			const player = mp.players.get(playerMp);
			if (!player || !player.adminLvl || !permissions.hasPermission(player, 'helperinteste')) return;

			let data: any = {};
			try { data = JSON.parse(dataStr); } catch (e) {
				// Fallback for simple actions without JSON
				if (typeof dataStr === 'string' && !dataStr.startsWith('{')) {
					data = { id: '', action: dataStr };
				}
			}

			if (action === 'fix') {
				let targetMp = playerMp;
				if (data.id) {
					const found = mp.players.toCustomArray().find(p => p.fixId === parseInt(data.id));
					if (found) targetMp = found.mp;
					else return playerMp.call('AnuntNotification2', ['ERROR', 'Jucatorul nu a fost gasit.', 'rosu']);
				}

				const vehicle = targetMp.vehicle;
				if (vehicle) {
					const repara = require('../vehicle/health').default;
					repara.repair(vehicle);
					if (targetMp === playerMp) playerMp.call('AnuntNotification2', ["Vehiculul a fost reparat.", 'verde', 'REPARATIE']);
					else {
						playerMp.call('AnuntNotification2', [`Vehiculul lui ${targetMp.name} a fost reparat.`, 'verde', 'REPARATIE']);
						targetMp.call('AnuntNotification2', ["Vehiculul tau a fost reparat de un admin.", 'verde', 'REPARATIE']);
					}

					// Fix log
					const FixLog = require('../models/FixLog').default;
					const UserModel = require('../models/User').default;
					const targetLogic = targetMp === playerMp ? player : mp.players.get(targetMp);
					
					if (player.dbId && targetLogic) {
						const adminUser = await UserModel.findOne({ character: player.dbId });
						const targetUser = targetLogic === player ? adminUser : await UserModel.findOne({ character: targetLogic.dbId });

						await FixLog.create({
							issuerId: player.fixId,
							issuerEmail: adminUser?.email || 'N/A',
							targetId: targetLogic.fixId,
							targetEmail: targetUser?.email || 'N/A',
							targetSerial: targetUser?.serial || 'N/A'
						});
					}
				} else {
					playerMp.call('AnuntNotification2', ["Nu esti intr-un vehicul sau jucatorul selectat nu se afla intr-un vehicul", 'rosu', 'EROARE']);
				}
			} else if (action === 'delete') {
				let vehicle = playerMp.vehicle;
				if (!vehicle || !mp.vehicles.exists(vehicle)) {
					let closestVehicle = null;
					let closestDistance = 1.5;
					mp.vehicles.forEach((veh) => {
						let distance = playerMp.position.dist(veh.position);
						if (distance < closestDistance) {
							closestDistance = distance;
							closestVehicle = veh;
						}
					});
					if (!closestVehicle || !mp.vehicles.exists(closestVehicle)) {
						return playerMp.call('AnuntNotification2', ["Nu este niciun vehicul in apropiere (1.5m)!", 'rosu', 'EROARE']);
					}
					vehicle = closestVehicle;
				}

				if (vehicle.dbId) {
					// Update DB like the "parcheaza" function
					const VehicleModel = require('../models/Vehicle').default;
					VehicleModel.updateOne(
						{ _id: vehicle.dbId },
						{ 'state.engine': false, 'state.locked': false }
					).exec();

					const ownerDbId = vehicle.owner && vehicle.owner.player ? vehicle.owner.player.toString() : null;
					if (ownerDbId) {
						const ownerPlayer = mp.players.getByDbId(ownerDbId);
						if (ownerPlayer) {
							// If owner is online, set the variable to false just in case
							ownerPlayer.mp.setOwnVariable('vehicleDespawn', false); 
						}
					}
				}
				
				// Use the custom delete method which cleans up the map
				mp.vehicles.delete(vehicle);

				try {
					const dbIdLog = playerMp.getVariable("dbId") || playerMp.id;
					const DeleteLogDel = require('../models/DeleteLog').default;
					DeleteLogDel.create({
						issuerId: dbIdLog,
						issuerName: playerMp.name,
						type: 'DELETE',
						details: `Vehicle ID: ${vehicle.id} ${vehicle.dbId ? `(DB ID: ${vehicle.dbId})` : ''}`
					});
				} catch (e) {}

				playerMp.call('AnuntNotification2', ["Vehiculul a fost sters cu succes.", 'verde', 'SUCCES']);
			} else if (action === 'delall') {
				let count = 0;
				const VehicleModel = require('../models/Vehicle').default;

				mp.vehicles.forEach((vehicle) => {
					// Only empty vehicles
					if (vehicle.getOccupants && vehicle.getOccupants().length > 0) return;
					if (vehicle.occupants && vehicle.occupants.length > 0) return;

					if (vehicle.dbId) {
						VehicleModel.updateOne(
							{ _id: vehicle.dbId },
							{ 'state.engine': false, 'state.locked': false }
						).exec();

						const ownerDbId = vehicle.owner && vehicle.owner.player ? vehicle.owner.player.toString() : null;
						if (ownerDbId) {
							const ownerPlayer = mp.players.getByDbId(ownerDbId);
							if (ownerPlayer) {
								ownerPlayer.mp.setOwnVariable('vehicleDespawn', false);
							}
						}
					}

					mp.vehicles.delete(vehicle);
					count++;
				});

				try {
					const dbIdLog = playerMp.getVariable("dbId") || playerMp.id;
					const DeleteLogAll = require('../models/DeleteLog').default;
					DeleteLogAll.create({
						issuerId: dbIdLog,
						issuerName: playerMp.name,
						type: 'DELETE ALL',
						details: `Count: ${count}`
					});
				} catch (e) {}

				mp.players.forEach((_player) => {
					_player.call('AnuntNotification2', [`Adminul ${playerMp.name} a sters toate vehiculele goale (${count})`]);
				});
				playerMp.call('AnuntNotification2', [`Toate vehiculele goale au fost sterse.`, 'success']);
			} else if (action === 'delradius') {
				const range = parseInt(data.id);
				if (isNaN(range) || range < 1) return playerMp.call('AnuntNotification2', ['ERROR', 'Raza invalida.', 'rosu']);

				let count = 0;
				const VehicleModel = require('../models/Vehicle').default;

				mp.vehicles.forEachInRange(playerMp.position, range, (vehicle) => {
					// Only empty vehicles
					if (vehicle.getOccupants && vehicle.getOccupants().length > 0) return;
					if (vehicle.occupants && vehicle.occupants.length > 0) return;

					if (vehicle.dbId) {
						VehicleModel.updateOne(
							{ _id: vehicle.dbId },
							{ 'state.engine': false, 'state.locked': false }
						).exec();

						const ownerDbId = vehicle.owner && vehicle.owner.player ? vehicle.owner.player.toString() : null;
						if (ownerDbId) {
							const ownerPlayer = mp.players.getByDbId(ownerDbId);
							if (ownerPlayer) {
								ownerPlayer.mp.setOwnVariable('vehicleDespawn', false);
							}
						}
					}

					mp.vehicles.delete(vehicle);
					count++;
				});

				try {
					const dbIdLog = playerMp.getVariable("dbId") || playerMp.id;
					const DeleteLogRadius = require('../models/DeleteLog').default;
					DeleteLogRadius.create({
						issuerId: dbIdLog,
						issuerName: playerMp.name,
						type: 'DELETE RADIUS',
						details: `Range: ${range}, Count: ${count}`
					});
				} catch (e) {}

				playerMp.call('AnuntNotification2', [`S-au sters ${count} vehicule goale in raza de ${range} metri.`, 'galben']);
			} else if (action === 'delall_timed') {
				const time = parseInt(data.id);
				if (isNaN(time) || time < 1) return playerMp.call('AnuntNotification2', ['ERROR', 'Timp invalid.', 'rosu']);

				this.delAllTimeouts.push(setTimeout(() => {
					mp.players.forEach((_player) => {
						_player.call('AnuntGlobal', [`Vehiculele goale vor fi sterse in ${time} minut(e)`]);
					});
				}, 1000));

				if (time > 1) {
					this.delAllTimeouts.push(setTimeout(() => {
						mp.players.forEach((_player) => {
							_player.call('AnuntGlobal', [`Vehiculele goale vor fi sterse in 1 minut`]);
						});
					}, (time - 1) * 60 * 1000));
				}

				this.delAllTimeouts.push(setTimeout(() => {
					let count = 0;
					const VehicleModel = require('../models/Vehicle').default;

					mp.vehicles.forEach((vehicle) => {
						if (vehicle.getOccupants && vehicle.getOccupants().length > 0) return;
						if (vehicle.occupants && vehicle.occupants.length > 0) return;

						if (vehicle.dbId) {
							VehicleModel.updateOne(
								{ _id: vehicle.dbId },
								{ 'state.engine': false, 'state.locked': false }
							).exec();

							const ownerDbId = vehicle.owner && vehicle.owner.player ? vehicle.owner.player.toString() : null;
							if (ownerDbId) {
								const ownerPlayer = mp.players.getByDbId(ownerDbId);
								if (ownerPlayer) {
									ownerPlayer.mp.setOwnVariable('vehicleDespawn', false);
								}
							}
						}

						mp.vehicles.delete(vehicle);
						count++;
					});

					mp.players.forEach((_player) => {
						_player.call('AnuntNotification2', [`Adminul ${playerMp.name} a sters toate vehiculele goale (${count})`]);
					});

					try {
						const dbIdLog = playerMp.getVariable("dbId") || playerMp.id;
						const DeleteLogTimed = require('../models/DeleteLog').default;
						DeleteLogTimed.create({
							issuerId: dbIdLog,
							issuerName: playerMp.name,
							type: 'DELETE ALL',
							details: `Timer: ${time}m, Count: ${count}`
						});
					} catch (e) {}
				}, time * 60 * 1000));

				playerMp.call('AnuntNotification2', [`S-a programat stergerea vehiculelor goale in ${time} minute.`, 'verde', 'DELETE']);
			} else if (action === 'cancel_delall_timed') {
				this.delAllTimeouts.forEach(t => clearTimeout(t));
				this.delAllTimeouts = [];
				mp.players.forEach((_player) => {
					_player.call('AnuntNotification2', [`Adminul ${playerMp.name} a anulat stergerea vehiculelor goale!`, 'galben', 'ANULARE']);
				});
			}
		});

		mp.events.add('server:adminAction', async (playerMp: PlayerMp, action: string, dataStr: string) => {
			console.log(`[AdminAction Index] RECEIVED: action=${action}, data=${dataStr}, player=${playerMp.name}`);
			const player = mp.players.get(playerMp);
			if (!player || !player.adminLvl || !permissions.hasPermission(player, 'helperinteste')) return;

			let data: any = {};
			try { data = JSON.parse(dataStr); } catch (e) {}

			if (action === 'kick') {
				const target = this.findCharacterById(data.id);
				if (target) {
					target.mp.kick(`Ai primit Kick. Motiv: ${data.reason}`);
					chat.sendSystem(`${player.getName()} a dat kick lui ${target.getName()} (${data.reason})`);
					
					// Kick log
					const KickLog = require('../models/KickLog').default;
					const UserModel = require('../models/User').default;
					
					const targetFixId = target.fixId;
					const adminFixId = player.fixId;
					const targetCharId = target.dbId;
					const adminCharId = player.dbId;

					if (targetCharId) {
						UserModel.findOne({ character: targetCharId }).then(async (user) => {
							const adminUser = await UserModel.findOne({ character: adminCharId });
							if (user) {
								await KickLog.create({
									issuerId: adminFixId,
									issuerEmail: adminUser?.email || 'N/A',
									kickedId: targetFixId,
									kickedEmail: user.email || 'N/A',
									kickedSerial: user.serial || 'N/A',
									reason: data.reason
								});
							}
						}).catch(() => {});
					}
				} else {
					playerMp.call('AnuntNotification2', ['Jucatorul nu a fost gasit.', 'rosu']);
				}
			} else if (action === 'warn') {
				const target = this.findCharacterById(data.id);
				if (target) {
					chat.sendSystem(`${player.getName()} l-a avertizat pe ${target.getName()} (${data.reason})`);
					target.mp.call('AnuntNotification2', [`Ai primit un avertisment (Warn). Motiv: ${data.reason}`, 'rosu', 'AVERTISMENT']);
					
					// Warn log
					const WarnLog = require('../models/WarnLog').default;
					const UserModel = require('../models/User').default;
					
					if (target.dbId) {
						UserModel.findOne({ character: target.dbId }).then(async (user) => {
							const adminUser = await UserModel.findOne({ character: player.dbId });
							if (user) {
								await WarnLog.create({
									issuerId: player.fixId,
									issuerEmail: adminUser?.email || 'N/A',
									targetId: target.fixId,
									targetEmail: user.email || 'N/A',
									targetSerial: user.serial || 'N/A',
									reason: data.reason
								});
							}
						}).catch(() => {});
					}
				} else {
					playerMp.call('AnuntNotification2', ['Jucatorul nu a fost gasit.', 'rosu']);
				}
			} else if (action === 'freeze') {
				const target = this.findCharacterById(data.id);
				if (target) {
					target.mp.setVariable('frozen', true);
					target.mp.call('client:admin:freeze', [true]);
					playerMp.call('AnuntNotification2', ['FREEZE', `Jucatorul ${target.getName()} a fost inghetat.`, 'verde']);

					// Freeze log
					const FreezeLog = require('../models/FreezeLog').default;
					const UserModel = require('../models/User').default;
					
					if (target.dbId) {
						UserModel.findOne({ character: target.dbId }).then(async (user) => {
							const adminUser = await UserModel.findOne({ character: player.dbId });
							if (user) {
								await FreezeLog.create({
									issuerId: player.fixId,
									issuerEmail: adminUser?.email || 'N/A',
									targetId: target.fixId,
									targetEmail: user.email || 'N/A',
									targetSerial: user.serial || 'N/A'
								});
							}
						}).catch(() => {});
					}
				} else {
					playerMp.call('AnuntNotification2', ['Jucatorul nu a fost gasit.', 'rosu']);
				}
			} else if (action === 'unfreeze') {
				const target = this.findCharacterById(data.id);
				if (target) {
					target.mp.setVariable('frozen', false);
					target.mp.call('client:admin:freeze', [false]);
						playerMp.call('AnuntNotification2', ['UNFREEZE', `Jucatorul ${target.getName()} a fost dezghetat.`, 'verde']);

					// Unfreeze log
					const UnfreezeLog = require('../models/UnfreezeLog').default;
					const UserModel = require('../models/User').default;
					
					if (target.dbId) {
						UserModel.findOne({ character: target.dbId }).then(async (user) => {
							const adminUser = await UserModel.findOne({ character: player.dbId });
							if (user) {
								await UnfreezeLog.create({
									issuerId: player.fixId,
									issuerEmail: adminUser?.email || 'N/A',
									targetId: target.fixId,
									targetEmail: user.email || 'N/A',
									targetSerial: user.serial || 'N/A'
								});
							}
						}).catch(() => {});
					}
				} else {
					playerMp.call('AnuntNotification2', ['Jucatorul nu a fost gasit.', 'rosu']);
				}
			} else if (action === 'ban_input') {
				const targetId = data.id;
				const term = data.time ? data.time.toString() : ''; 
				const reason = data.reason || 'Niciun motiv dat';
				const isPermanent = data.isPermanent ? true : false;
				const withPayment = data.withPayment ? true : false;
				
				// Server-side enforcement for permanent ban
				if (isPermanent && player.adminLvl < 5) {
					return playerMp.call('AnuntNotification2', ['Eroare', 'Nu ai permisiunea de a da ban permanent!', 'rosu']);
				}
				
				banSystem.banPlayer(player, targetId, term, reason, isPermanent, withPayment);
			} else if (action === 'tp_to_player') {
				const target = this.findCharacterById(data.id);
				if (target) {
					playerMp.dimension = target.mp.dimension;
					playerMp.position = target.mp.position;
					playerMp.call('AnuntNotification2', [`Te-ai teleportat la ${target.getName()}.`, 'verde', 'TELEPORT']);

					try {
						const TpLog = require('../models/TpLog').default;
						TpLog.create({
							issuerId: playerMp.getVariable("dbId") || playerMp.id,
							issuerName: playerMp.name,
							type: 'TPTO',
							details: `To Player: ${target.getName()} (ID: ${data.id})`
						});
					} catch (e) {}
				} else {
					playerMp.call('AnuntNotification2', ['Jucatorul nu a fost gasit.', 'rosu']);
				}
			} else if (action === 'tp_here') {
				const target = this.findCharacterById(data.id);
				if (target) {
					target.mp.dimension = playerMp.dimension;
					target.mp.position = playerMp.position;
					playerMp.call('AnuntNotification2', [`L-ai teleportat pe ${target.getName()} la tine.`, 'success']);
					target.mp.call('AnuntNotification2', [`Ai fost teleportat la adminul ${playerMp.name}.`, 'warning']);

					try {
						const TpLog = require('../models/TpLog').default;
						TpLog.create({
							issuerId: playerMp.getVariable("dbId") || playerMp.id,
							issuerName: playerMp.name,
							type: 'TPTOME',
							details: `Target Player: ${target.getName()} (ID: ${data.id})`
						});
					} catch (e) {}
				} else {
					playerMp.call('AnuntNotification2', ['Jucatorul nu a fost gasit.', 'rosu']);
				}
			} else if (action === 'tp_to_waypoint') {
                const adminLogic = mp.players.get(playerMp);
				if (!adminLogic || !adminLogic.waypoint) {
					return playerMp.call('AnuntNotification2', ['Nu ai un waypoint marcat pe harta.', 'rosu']);
				}
				
				const wp = adminLogic.waypoint;
				if (playerMp.vehicle) playerMp.vehicle.position = wp;
				else playerMp.position = wp;
				
				playerMp.dimension = 0;
				playerMp.call('AnuntNotification2', ['Te-ai teleportat la waypoint!', 'verde']);

				try {
					const TpLog = require('../models/TpLog').default;
					TpLog.create({
						issuerId: playerMp.getVariable("dbId") || playerMp.id,
						issuerName: playerMp.name,
						type: 'TPW',
						details: `To Waypoint`
					});
				} catch (e) {}
			} else if (action === 'tp_to_coords') {
				// data.id might be the coords string
				const coordsArr = data.id.split(/[ ,]+/);
				if (coordsArr.length >= 3) {
					const x = parseFloat(coordsArr[0]);
					const y = parseFloat(coordsArr[1]);
					const z = parseFloat(coordsArr[2]);
					
					if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
						playerMp.position = new mp.Vector3(x, y, z);
						playerMp.call('AnuntNotification2', [`Te-ai teleportat la: ${x}, ${y}, ${z}`, 'verde']);

						try {
							const TpLog = require('../models/TpLog').default;
							TpLog.create({
								issuerId: playerMp.getVariable("dbId") || playerMp.id,
								issuerName: playerMp.name,
								type: 'TPC',
								details: `To Coords: ${x}, ${y}, ${z}`
							});
						} catch (e) {}
					} else {
						playerMp.call('AnuntNotification2', ['Coordonate invalide.', 'rosu']);
					}
				} else {
					playerMp.call('AnuntNotification2', ['Format invalid (X Y Z).', 'rosu']);
				}
			} else if (action === 'notify_player') {
				const target = this.findCharacterById(data.id);
				if (target) {
					target.mp.call('AnuntNotification2', [data.reason, 'galben']);
					playerMp.call('AnuntNotification2', [`I-ai trimis notificarea lui ${target.getName()}.`, 'verde']);
					try {
						const NotifLog = require('../models/NotifLog').default;
						NotifLog.create({
							issuerId: playerMp.getVariable("dbId") || playerMp.id,
							issuerName: playerMp.name,
							targetId: target.dbId,
							targetName: target.getName(),
							details: data.reason
						});
					} catch (e) {}
				} else {
					playerMp.call('AnuntNotification2', ['Jucatorul nu a fost gasit!', 'rosu']);
				}
			} else if (action === 'global_announcement') {
				mp.players.forEach((_player) => {
					_player.call('AnuntGlobal', [data.reason]);
				});
				playerMp.call('AnuntNotification2', ['Ai trimis anuntul global!', 'verde']);

				try {
					const AnuntLog = require('../models/AnuntLog').default;
					AnuntLog.create({
						issuerId: playerMp.getVariable("dbId") || playerMp.id,
						issuerName: playerMp.name,
						details: data.reason
					});
				} catch (e) {}
			} else if (action === 'giveitem_input') {
				const target = this.findCharacterById(data.id);
				if (target) {
					const item = { name: data.name, amount: parseInt(data.price) };
					if (isNaN(item.amount) || item.amount < 1) return playerMp.call('AnuntNotification2', ['ERROR', 'Cantitate invalida.', 'rosu']);
					
					try {
						playerInventory.checkEnoughSlots(target, [item]);
						playerInventory.addItem(target, item).then(() => {
							playerMp.call('AnuntNotification2', [`I-ai dat ${item.amount}x ${item.name} lui ${target.getName()}.`, 'verde', 'ITEM']);

							try {
								const GiveItemLog = require('../models/GiveItemLog').default;
								GiveItemLog.create({
									issuerId: playerMp.getVariable("dbId") || playerMp.id,
									issuerName: playerMp.name,
									targetId: target.dbId,
									targetName: target.getName(),
									item: item.name,
									amount: item.amount
								});
							} catch (e) {}
						});
					} catch (err) {
						playerMp.call('AnuntNotification2', ['Eroare', 'Inventarul jucatorului este plin.', 'rosu']);
					}
				} else {
					playerMp.call('AnuntNotification2', ['Eroare', 'Jucatorul nu a fost gasit.', 'rosu']);
				}
			} else if (action === 'givemoney_input') {
				const target = this.findCharacterById(data.id);
				if (target) {
					const amount = parseInt(data.price);
					if (isNaN(amount) || amount < 1) return playerMp.call('AnuntNotification2', ['ERROR', 'Suma invalida.', 'rosu']);

					if (data.moneyType === 'CASH') {
						const item = { name: 'ron', amount: amount };
						try {
							playerInventory.checkEnoughSlots(target, [item]);
							playerInventory.addItem(target, item).then(() => {
								playerMp.call('AnuntNotification2', [`I-ai dat ${amount} RON cash lui ${target.getName()}.`, 'verde', 'BANI']);

								try {
									const GiveCashLog = require('../models/GiveCashLog').default;
									GiveCashLog.create({
										issuerId: playerMp.getVariable("dbId") || playerMp.id,
										issuerName: playerMp.name,
										targetId: target.dbId,
										targetName: target.getName(),
										type: 'CASH',
										amount: amount
									});
								} catch (e) {}
							});
						} catch (err) {
							playerMp.call('AnuntNotification2', ['Eroare', 'Inventarul jucatorului este plin.', 'rosu']);
						}
					} else if (data.moneyType === 'BANK') {
						money.change(target, 'bank', amount, `admin money | ${playerMp.name}`).then(() => {
							playerMp.call('AnuntNotification2', [`I-ai dat ${amount} RON in banca lui ${target.getName()}.`, 'verde', 'BANI']);

							try {
								const GiveCashLog = require('../models/GiveCashLog').default;
								GiveCashLog.create({
									issuerId: playerMp.getVariable("dbId") || playerMp.id,
									issuerName: playerMp.name,
									targetId: target.dbId,
									targetName: target.getName(),
									type: 'BANK',
									amount: amount
								});
							} catch (e) {}
						});
					}
				} else {
					playerMp.notify('~r~Jucatorul nu a fost gasit.');
				}
			} else if (action === 'givecar_input') {
				const target = this.findCharacterById(data.id);
				if (target) {
					const model = data.name;
					const temporary = data.carType === 'TEMPORARY';
					const { position } = target.mp;
					const owner = { player: target.dbId };

					if (temporary) {
						vehicleCreator.buildTemporary(model, position, 90, owner);
						playerMp.call('AnuntNotification2', [`I-ai dat un vehicul temporar (${model}) lui ${target.getName()}.`, 'verde', 'VEHICUL']);
					} else {
						vehicleCreator.buildForPlayer(target, new Builder(model, position, 90)).then(() => {
							playerMp.call('AnuntNotification2', [`I-ai dat un vehicul permanent (${model}) lui ${target.getName()}.`, 'verde', 'VEHICUL']);
						});
					}

					try {
						const GiveCarLog = require('../models/GiveCarLog').default;
						GiveCarLog.create({
							issuerId: playerMp.getVariable("dbId") || playerMp.id,
							issuerName: playerMp.name,
							targetId: target.dbId,
							targetName: target.getName(),
							type: temporary ? 'TEMPORARY' : 'PERMANENT',
							model: model
						});
					} catch (e) {}
				} else {
					playerMp.call('AnuntNotification2', ['Eroare', 'Jucatorul nu a fost gasit.', 'rosu']);
				}
			} else if (action === 'giveskin_input') {
				const target = this.findCharacterById(data.id);
				if (target) {
					const model = data.name;
					target.mp.model = mp.joaat(model);
					playerMp.call('AnuntNotification2', [`I-ai schimbat skin-ul lui ${target.getName()} in ${model}.`, 'verde', 'SKIN']);

					try {
						const SkinLog = require('../models/SkinLog').default;
						SkinLog.create({
							issuerId: playerMp.getVariable("dbId") || playerMp.id,
							issuerName: playerMp.name,
							targetId: target.dbId,
							targetName: target.getName(),
							model: model
						});
					} catch (e) {}
				} else {
					playerMp.notify('~r~Jucatorul nu a fost gasit.');
				}
			} else if (action === 'create_biz') {
				if (!permissions.hasPermission(player, 'cofondator')) {
					return playerMp.notify('~r~Nu ai permisiunea de cofondator!');
				}

				const customId = parseInt(data.extraId);
				const name = data.name;
				const price = parseInt(data.price);
				const profitPercent = parseInt(data.profitPercent) || 0;
				const type = data.bizType;
				
				let owner = null;
				let targetPlayer: Player | undefined = undefined;
				if (data.id && data.id.trim().length > 0) {
					owner = await this.findDbIdByUid(data.id);
					if (owner) {
						targetPlayer = mp.players.getByDbId(owner);
					}
					if (!owner) return playerMp.notify('~r~Proprietarul nu a fost gasit.');
				}

				if (isNaN(customId)) return playerMp.notify('~r~ID Afacere invalid.');
					playerMp.call('AnuntNotification2', ['ERROR', 'Pret afacere invalid.', 'rosu']);

				businessCtrl.create(player, name, type, price, 1000, owner, profitPercent, customId).then(async (biz) => {
					if (biz) {
						playerMp.notify(`~g~Afacerea ~y~${name} (${type}) ~g~a fost creata cu succes!`);
						
						try {
							const BusinessModel = require('../models/Business').default; // Already used by ctrl but for log logic
							const UserModel = require('../models/User').default;
							const adminUser = await UserModel.findOne({ character: player.dbId });

							// We don't have a specific BusinessCreateLog but we can use recordAction or similar if needed
							// For now, let's just make sure it works.
						} catch (e) {}

						if (targetPlayer && biz) {
							// Update player data if owner was assigned
							const bizAction = require('../business/index').default;
							bizAction.changePlayerData(targetPlayer, biz);
							const building = require('../business/building').default;
							building.toggleBlip(biz, targetPlayer);
						}
					}
				}).catch(err => {
					playerMp.call('AnuntNotification2', ['Eroare', 'Eroare la crearea afacerii.', 'rosu']);
					console.error(err);
				});
			} else if (action === 'create_biz_point' || action === 'create_biz_point_confirm') {
				if (!permissions.hasPermission(player, 'cofondator')) {
					return playerMp.notify('~r~Nu ai permisiunea de cofondator!');
				}

				let nearestBiz = null;
				let minDist = 50.0;
				businessCtrl.items.forEach(biz => {
					if (!biz) return;
					const bizPos = new mp.Vector3(biz.position.x, biz.position.y, biz.position.z);
					const dist = playerMp.dist(bizPos);
					
					if (biz.type === 'Benzinarie' || biz.type === 'gas' || biz.type === 'Service auto' || biz.type === 'Service' || biz.type === 'lscustoms') {
						if (dist < minDist) {
							minDist = dist;
							nearestBiz = biz;
						}
					} else {
						if (dist < 10.0 && dist < minDist) {
							minDist = dist;
							nearestBiz = biz;
						}
					}
				});

				if (!nearestBiz) {
					return playerMp.notify('~r~Nu esti langa nicio afacere (10m / 50m pt benzinarie/service)!');
				}

				const points = nearestBiz.interactionPoints || [];
				const newPoint = {
					name: data.bizType,
					position: { x: playerMp.position.x, y: playerMp.position.y, z: playerMp.position.z }
				};
				points.push(newPoint);

				const building = require('../business/building').default;
				building.addInteractionPoint(nearestBiz, newPoint);

				await businessCtrl.update(nearestBiz, { interactionPoints: points });
				playerMp.notify(`~g~Punct de interactiune adaugat la ~y~${nearestBiz.name}~g~.`);
			} else if (action === 'create_garage_input') {
				const customId = parseInt(data.id);
				const name = data.name;
				
				const typeMap: { [key: string]: string } = {
					'CIVIL': 'civil',
					'POLITIE': 'politie',
					'UMU': 'umu',
					'BARCI': 'boat',
					'BARCI POLITIE': 'boat_politie',
					'CAMIOANE': 'truck',
					'AVIOANE': 'plane',
					'ELICOPTER': 'heli',
					'HELI POLITIE': 'heli_politie',
					'HELI UMU': 'heli_umu',
					'KART': 'kart',
					'FORMULA1': 'formula1'
				};
				const type = data.garageType ? (typeMap[data.garageType] || data.garageType.toLowerCase()) : '';
				
				if (!type) return playerMp.call('AnuntNotification2', ['ERROR', 'Tip garaj invalid.', 'rosu']);
				if (isNaN(customId)) return playerMp.notify('~r~ID Garaj invalid.');
				
				const garageEntities = require('../garage/entities').default;
				
				try {
					const garage = await garageEntities.create(player, type, { customId, name });
					playerMp.notify(`~g~Garajul ${garage.index} (${garage.name}) de tip ${garage.type} a fost creat!`);
					this.sendGarageList(playerMp);
					
					const GarageCreateLog = require('../models/GarageCreateLog').default;
					const UserModel = require('../models/User').default;
					const adminUser = await UserModel.findOne({ character: player.dbId });

					await GarageCreateLog.create({
						issuerId: player.fixId,
						issuerEmail: adminUser?.email || 'N/A',
						garageId: customId,
						garageType: type
					});
				} catch (err: any) {
					playerMp.notify(`~r~Eroare: ${err.message || 'Ceva nu a mers bine'}`);
				}
			} else if (action === 'create_house_input') {
				const isForSale = data.houseStatus === 'LA VANZARE';
				const customId = isForSale ? parseInt(data.id) : parseInt(data.extraId);
				const name = data.name;
				const price = parseInt(data.price);
				
				const typeMap: { [key: string]: string } = {
					'ECONOMIC': 'low',
					'MEDIU': 'average',
					'PREMIUM': 'premium'
				};
				const type = data.houseType ? (typeMap[data.houseType] || data.houseType.toLowerCase()) : '';
				
				if (!type) return playerMp.call('AnuntNotification2', ['ERROR', 'Tip casa invalid sau lipsa.', 'rosu']);

				let owner = null;
				let targetPlayer: Player | undefined = undefined;
				if (!isForSale) {
					// Treat numeric ID as UID
					owner = await this.findDbIdByUid(data.id);
					if (owner) {
						targetPlayer = mp.players.getByDbId(owner);
					}
					
					if (!owner) return playerMp.notify('~r~Proprietarul nu a fost gasit.');
				}

				if (isNaN(customId)) return playerMp.notify('~r~ID Casa invalid.');
				
				houseCtrl.create(player, type, { 
					customId, 
					name, 
					price: isNaN(price) ? undefined : price, 
					owner 
				}).then(async (house) => {
					playerMp.notify(`~g~Casa ${house.customId || house.index} (${house.name || house.type}) a fost creata!`);
					this.sendHouseList(playerMp);
					
					try {
						const HouseCreateLog = require('../models/HouseCreateLog').default;
						const UserModel = require('../models/User').default;
						const adminUser = await UserModel.findOne({ character: player.dbId });

						await HouseCreateLog.create({
							issuerId: player.fixId,
							issuerEmail: adminUser?.email || 'N/A',
							houseId: customId,
							houseType: type,
							price: isNaN(price) ? 0 : price,
							ownerId: owner ? owner.toString() : null
						});
					} catch (e) {
						console.error("Error creating house log:", e);
					}

					if (targetPlayer && house) {
						// Update player data if owner was assigned
						const houseAction = require('../house/index').default;
						houseAction.changePlayerData(targetPlayer, house);
						const building = require('../house/building').default;
						building.toggleBlip(house, targetPlayer);
					}
				}).catch(err => {
					playerMp.call('AnuntNotification2', ['ERROR', 'Eroare la crearea casei.', 'rosu']);
					console.error(err);
				});
			} else if (action === 'delete_afacere') {
				if (!permissions.hasPermission(player, 'cofondator')) {
					return playerMp.notify('~r~Nu ai permisiunea de cofondator!');
				}

				const index = parseInt(data.id);
				if (isNaN(index)) return playerMp.notify('~r~Index afacere invalid.');
				
				businessCtrl.delete(index).then(() => {
					playerMp.notify(`~g~Afacerea cu ID ~y~${index} ~g~a fost stearsa.`);
				}).catch(err => {
					playerMp.notify('~r~Eroare la stergerea afacerii.');
					console.error(err);
				});
			} else if (action === 'delete_garage') {
				const customId = parseInt(data.id);
				if (isNaN(customId)) return playerMp.notify('~r~ID Garaj invalid.');
				
				const garageEntities = require('../garage/entities').default;
				
				try {
					await garageEntities.delete(customId);
					playerMp.notify(`~g~Garajul ${customId} a fost sters.`);
					this.sendGarageList(playerMp);

					const GarageDeleteLog = require('../models/GarageDeleteLog').default;
					const UserModel = require('../models/User').default;
					const adminUser = await UserModel.findOne({ character: player.dbId });

					await GarageDeleteLog.create({
						issuerId: player.fixId,
						issuerEmail: adminUser?.email || 'N/A',
						garageId: customId
					});
				} catch (err: any) {
					playerMp.notify(`~r~Eroare la stergere: ${err.message || 'Ceva nu a mers bine'}`);
				}
			} else if (action === 'delete_house') {
				const customId = parseInt(data.id);
				if (isNaN(customId)) return playerMp.notify('~r~ID Casa invalid.');
				
				const house = houseCtrl.items.find(h => h && h.customId === customId);
				if (!house) return playerMp.notify('~r~Casa nu a fost gasita.');

				houseCtrl.delete(house.index).then(async () => {
					playerMp.notify(`~g~Casa ${customId} a fost stearsa.`);
					this.sendHouseList(playerMp);

					try {
						const HouseDeleteLog = require('../models/HouseDeleteLog').default;
						const UserModel = require('../models/User').default;
						const adminUser = await UserModel.findOne({ character: player.dbId });

						await HouseDeleteLog.create({
							issuerId: player.fixId,
							issuerEmail: adminUser?.email || 'N/A',
							houseId: customId
						});
					} catch (e) {
						console.error("Error creating house delete log:", e);
					}
				}).catch(err => {
					playerMp.notify('~r~Eroare la stergerea casei.');
				});
			} else if (action === 'edit_house') {
				const index = data.targetItem.index;
				const house = houseCtrl.items[index];
				if (!house) return playerMp.notify('~r~Casa nu a fost gasita.');

				const isForSale = data.id === 'LA VANZARE';
				const name = data.name;
				const price = parseInt(data.price);
				
				let owner = house.owner; // Default to current owner
				let targetPlayer: Player | undefined = undefined;
				
				if (isForSale) {
					owner = null;
				} else if (data.id !== 'PROPRIETAR') { // Only try to find if ID was changed
					// First check if it's a numeric ID (UID)
					owner = await this.findDbIdByUid(data.id);
					
					if (!owner) {
						// Fallback to checking if data.id is a dbId (length 24 hex)
						if (data.id && data.id.length === 24 && /^[0-9a-fA-F]+$/.test(data.id)) {
							owner = data.id;
						} else {
							return playerMp.notify('~r~Proprietarul nu a fost gasit.');
						}
					}
					
					if (owner) {
						targetPlayer = mp.players.getByDbId(owner);
					}
				}

				const updateData: any = { name, price: isNaN(price) ? house.price : price, owner };
				
				houseCtrl.update(house, updateData).then(() => {
					playerMp.notify(`~g~Casa ${index} a fost actualizata.`);
					this.sendHouseList(playerMp);
					
					if (targetPlayer) {
						const houseAction = require('../house/index').default;
						houseAction.changePlayerData(targetPlayer, house);
						const building = require('../house/building').default;
						building.toggleBlip(house, targetPlayer);
					}
				}).catch(err => {
					playerMp.notify('~r~Eroare la actualizarea casei.');
				});
			} else if (action === 'edit_item') {
				if (data.targetItem && data.targetItem.type === 'business') {
					const index = data.targetItem.index;
					const biz = businessCtrl.items[index];
					if (!biz) return playerMp.notify('~r~Afacerea nu a fost gasita.');

					const name = data.name;
					let owner = biz.owner;
					let targetPlayer: Player | undefined = undefined;

					if (!data.id || data.id === "LA VANZARE") {
						owner = null;
					} else if (data.id !== biz.ownerId?.toString()) {
						owner = await this.findDbIdByUid(data.id);
						if (!owner) {
							if (data.id && data.id.length === 24 && /^[0-9a-fA-F]+$/.test(data.id)) {
								owner = data.id;
							} else {
								return playerMp.notify('~r~Proprietarul nu a fost gasit.');
							}
						}
						
						if (owner) {
							targetPlayer = mp.players.getByDbId(owner);
						}
					}

					businessCtrl.update(biz, { name, owner }).then(() => {
						playerMp.notify(`~g~Afacerea ${index} a fost actualizata.`);
						this.sendBusinessList(playerMp);
						
						if (targetPlayer) {
							const businessAction = require('../business/index').default;
							businessAction.changePlayerData(targetPlayer, biz);
							const building = require('../business/building').default;
							building.toggleBlip(biz, targetPlayer);
						}
					}).catch(err => {
						playerMp.notify('~r~Eroare la actualizarea afacerii.');
					});
				} else if (data.targetItem && data.targetItem.type === 'garage') {
					const index = data.targetItem.index;
					const name = data.name;

					const garageEntities = require('../garage/entities').default;
					try {
						await garageEntities.update(index, { name });
						playerMp.notify(`~g~Garajul ${index} a fost actualizat.`);
						this.sendGarageList(playerMp);
					} catch (e: any) {
						playerMp.notify(`~r~Eroare la editare garaj: ${e.message}`);
					}
				}
			} else if (action === 'confirm_delete') {
				if (data.targetItem && data.targetItem.type === 'house') {
					const house = houseCtrl.items.find(h => h && (h.customId === data.targetItem.id || h.index === data.targetItem.index));
					if (!house) return playerMp.notify('~r~Casa nu a fost gasita.');

					const houseIdForLog = house.customId || house.index;

					houseCtrl.delete(house.index).then(async () => {
						playerMp.notify(`~g~Casa ${houseIdForLog} a fost stearsa.`);
						this.sendHouseList(playerMp);

						try {
							const HouseDeleteLog = require('../models/HouseDeleteLog').default;
							const UserModel = require('../models/User').default;
							const adminUser = await UserModel.findOne({ character: player.dbId });

							await HouseDeleteLog.create({
								issuerId: player.fixId,
								issuerEmail: adminUser?.email || 'N/A',
								houseId: houseIdForLog
							});
						} catch (e) {
							console.error("Error creating house delete log:", e);
						}
					});
				} else if (data.targetItem && data.targetItem.type === 'business') {
					const biz = businessCtrl.items.find(b => b && (b.customId === data.targetItem.id || b.index === data.targetItem.index));
					if (!biz) return playerMp.notify('~r~Afacerea nu a fost gasita.');

					const bizId = biz.customId || biz.index;

				businessCtrl.delete(bizId).then(async () => {
					playerMp.notify(`~g~Afacerea ${bizId} a fost stearsa.`);
					this.sendBusinessList(playerMp);
				});
				} else if (data.targetItem && data.targetItem.type === 'garage') {
					const customId = data.targetItem.index;
					
					const garageEntities = require('../garage/entities').default;
					
					try {
						await garageEntities.delete(customId);
						playerMp.notify(`~g~Garajul ${customId} a fost sters.`);
						this.sendGarageList(playerMp);

						const GarageDeleteLog = require('../models/GarageDeleteLog').default;
						const UserModel = require('../models/User').default;
						const adminUser = await UserModel.findOne({ character: player.dbId });

						await GarageDeleteLog.create({
							issuerId: player.fixId,
							issuerEmail: adminUser?.email || 'N/A',
							garageId: customId
						});
					} catch (err: any) {
						playerMp.notify(`~r~Eroare la stergere: ${err.message || 'Ceva nu a mers bine'}`);
					}
				} else if (data.targetItem && data.targetItem.type === 'whitelist') {
					const wl = require('../helpers/whitelist');
					await wl.removeFromWhitelist(data.targetItem.id);
					playerMp.notify(`Serialul ${data.targetItem.id} a fost sters din whitelist.`);
					
					// Auto refresh
					const rawList = await wl.getWhitelistData();
					const list = rawList.map((item: any) => ({
						id: item.serial,
						info: item.name,
						owner: 'Whitelist',
						type: 'whitelist'
					}));
					playerMp.call('client:setAdminList', ['WHITELIST MANAGE', JSON.stringify(list)]);
				} else if (data.targetItem && ['clanuri', 'ganguri', 'mafii'].includes(data.targetItem.type)) {
					const name = data.targetItem.id;
					const faction = factions.getFaction(name);
					if (!faction) return playerMp.notify('~r~Organizatia nu a fost gasita.');

					// 0. Perform deep cleanup (members, garage, points)
					await faction.destroy();

					// 1. Delete from DB
					await FactionModel.deleteOne({ name });
					
					// 2. Remove from memory
					delete factions.items[faction.name];
					
					playerMp.notify(`~g~Organizatia ${faction.name} a fost stearsa.`);
					
					if (data.targetItem.type === 'clanuri') admFaction.sendClanList(playerMp);
					// else if (data.targetItem.type === 'ganguri') factionAdmin.sendGangList(playerMp);
					// else if (data.targetItem.type === 'mafii') factionAdmin.sendMafiaList(playerMp);
				}
			} else if (action === 'tp_to_garage') {
				const garageEntities = require('../garage/entities').default;
				const garage = garageEntities.items.find((g: any) => g && g.index === data.id);
				if (garage) {
					playerMp.position = new mp.Vector3(garage.position.x, garage.position.y, garage.position.z);
					playerMp.dimension = 0;
					playerMp.notify(`~g~Te-ai teleportat la garajul #${garage.index}.`);

					try {
						const TpLog = require('../models/TpLog').default;
						TpLog.create({
							issuerId: playerMp.getVariable("dbId") || playerMp.id,
							issuerName: playerMp.name,
							type: 'TPGARAGE',
							details: `Garage ID: ${garage.index}`
						});
					} catch (e) {}
				} else {
					playerMp.notify('~r~Garajul nu a fost gasit.');
				}
			} else if (action === 'tp_to_house') {
				const house = houseCtrl.items.find(h => h && h.customId === data.id);
				if (house) {
					playerMp.position = new mp.Vector3(house.position.x, house.position.y, house.position.z);
					playerMp.dimension = 0;
					playerMp.notify(`~g~Te-ai teleportat la casa #${house.customId || house.index}.`);
					
					try {
						const TpLog = require('../models/TpLog').default;
						TpLog.create({
							issuerId: playerMp.getVariable("dbId") || playerMp.id,
							issuerName: playerMp.name,
							type: 'TPHOUSE',
							details: `House ID: ${house.customId || house.index}`
						});
					} catch (e) {}
				} else {
					playerMp.notify('~r~Casa nu a fost gasita.');
				}
			} else if (action === 'tp_to_biz') {
				const biz = businessCtrl.items.find(b => b && (b.customId === data.id || b.index === data.id));
				if (biz) {
					playerMp.position = new mp.Vector3(biz.position.x, biz.position.y, biz.position.z);
					playerMp.dimension = 0;
					playerMp.notify(`~g~Te-ai teleportat la afacerea #${biz.customId || biz.index}.`);
					
					try {
						const TpLog = require('../models/TpLog').default;
						TpLog.create({
							issuerId: playerMp.getVariable("dbId") || playerMp.id,
							issuerName: playerMp.name,
							type: 'TPBIZ',
							details: `Business ID: ${biz.customId || biz.index}`
						});
					} catch (e) {}
				} else {
					playerMp.notify('~r~Afacerea nu a fost gasita.');
				}
			} else {
				// Delegate to faction admin if not handled here
				admFaction.handleAdminAction(playerMp, action, dataStr);
			}
		});

		mp.events.add('server:adminList', async (playerMp: PlayerMp, type: string) => {
			const admin = mp.players.get(playerMp);
			if (!admin || !admin.adminLvl || !permissions.hasPermission(admin, 'helperinteste')) return;

			if (type === 'house') {
				this.sendHouseList(playerMp);
			} else if (type === 'afaceri') {
				this.sendBusinessList(playerMp);
			} else if (type === 'clanuri') {
				admFaction.sendClanList(playerMp);
			} else if (type === 'gang') {
				admFaction.sendGangList(playerMp);
			} else if (type === 'mafie') {
				admFaction.sendMafieList(playerMp);
			} else if (type === 'whitelist') {
				const wl = require('../helpers/whitelist');
				const rawList = await wl.getWhitelistData();
				const list = rawList.map((item: any) => ({
					id: item.serial,
					info: item.name,
					owner: 'Whitelist',
					type: 'whitelist'
				}));
				playerMp.call('client:setAdminList', ['WHITELIST MANAGE', JSON.stringify(list)]);
				return;
			} else if (type.startsWith('garage')) {
				const filter = type.includes('_') ? type.split('_')[1] : undefined;
				this.sendGarageList(playerMp, filter);
			}
		});

		mp.events.add('server:adminTeleport', (playerMp: PlayerMp, targetId: number) => {
			const admin = mp.players.get(playerMp);
			if (!admin || !admin.adminLvl || !permissions.hasPermission(admin, 'helperinteste')) return;

			const target = mp.players.at(targetId);
			if (target) {
				playerMp.dimension = target.dimension;
				playerMp.position = target.position;
				playerMp.notify(`~g~Te-ai teleportat la ${target.name}.`);

				try {
					const TpLog = require('../models/TpLog').default;
					TpLog.create({
						issuerId: playerMp.getVariable("dbId") || playerMp.id,
						issuerName: playerMp.name,
						type: 'TPTO',
						details: `To Player: ${target.name} (ID: ${target.id})`
					});
				} catch (e) {}
			}
		});
	}
}

export default new Admin();
