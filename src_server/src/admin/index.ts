import money from 'helpers/money';
import hud from 'helpers/hud';
import chat from 'basic/chat';
import permissions from './permissions';
import teleport from './teleport';
import './ban';
import './report';
import './vehicle';
import './house';
import './demorgan';
import './faction';
import './noclip';
import playerDeath from 'player/death';

class Admin {
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

	private getSelfCoords(admin: Player) {
		if (!admin || !admin.mp || !admin.mp.position) {
			return null;
		}
		if (!permissions.hasPermission(admin, 'helper')) return null;
		const { x, y, z } = admin.mp.position;
		return { x, y, z };
	}

	private kickPlayer(admin: Player, target: string, reason: string) {
		if (!permissions.hasPermission(admin, 'helper')) return;

		const player = mp.players.getByDbId(target);

		if (player) {
			player.mp.kick(reason);

			//journal.recordAction(admin, 'kick', `${player.getName()} | ${reason}`, player.dbId);
			chat.sendSystem(`${admin.getName()} a dat kick lui ${player.getName()} (${reason})`);
		}
	}

	private changePlayerModel(admin: Player, target: string, model: string) {
		if (!permissions.hasPermission(admin, 'cofondator')) return;

		const player = mp.players.getByDbId(target);

		if (player) {
			player.mp.model = mp.joaat(model);
			//journal.recordAction(admin, 'skin', `${player.getName()} | ${model}`, player.dbId);
		}
	}

	private async changeMoney(admin: Player, dbId: string, sum: number) {
		if (!permissions.hasPermission(admin, 'cofondator')) return;

		const target = mp.players.getByDbId(dbId);
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
		if (!permissions.hasPermission(admin, 'helper')) return;

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
				admin.tp(coords);
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

				if (player) callback(player, data);
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
			'Admin-Revive': async (player: Player, targetId: string) => {	
				const targetPlayer = mp.players.getByDbId(targetId);
				if (!targetPlayer) {
					return;
				}
				try {
					playerDeath.revive(targetPlayer);
				} catch (error) {
				}
			},
			'Admin-Rspwn': async (player: Player, targetId: string) => {

    			const targetPlayer = mp.players.getByDbId(targetId);
    			if (!targetPlayer) {
        			return;
    			}
    			try {
        			playerDeath.rspwn(targetPlayer);
    			} catch (error) {
    			}
			}
		});
	}
}

export default new Admin();
