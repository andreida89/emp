import rpc from 'rage-rpc';
import players from 'helpers/players';
import factions from 'factions';
import Faction from 'factions/faction';
import chatCommands, { COMMANDS, colors } from './commands';
import factionChat from './faction';

class Chat {
	public colors = colors;

	constructor() {
		mp.events.subscribeToDefault({
			playerChat: (player: Player, data: string) => {
				try {
					const { mode, text } = JSON.parse(data);
					this.sendPlayerMessage(player, text, mode);
				} catch (err) {
					console.log(err, data, 'chat error');
				}
			}
		});

		rpc.register('Chat-GetUserData', (data: any, info: rpc.PlayerMeta) => {
			const player = players.get(info.player.id);
			if (!player) return null;
			let factiuneName: string | null = null;
			if (player.faction) {
				const fact = factions.getFaction(player.faction);
				if (fact) {
					factiuneName = fact.name.toUpperCase();
				} else {
					factiuneName = player.faction.toUpperCase();
				}
			}
			const adminLvl = info.player.getVariable('adminLvl') || 0;
			const vipLvl = info.player.getVariable('vipLvl') || 0;
			return {
				faction: factiuneName,
				isAdmin: adminLvl > 0,
				hasVip: vipLvl > 0
			};
		});
	}

	sendSystem(message: string, color = 'b80614') {
		this.sendToAll(`!{${color}}${message}`);
	}

	sendPlayerMessage(player: Player, message: string, command: COMMANDS) {
		const { position } = player.mp;
		const text = chatCommands.prepareString(chatCommands.getTemplate(message, command), [
			player
		]);

		switch (command) {
			case COMMANDS.SCREAM:
				this.sendNear(position, text, 30);
				break;
			case COMMANDS.WHISPER: {
				const [id] = message.split(' ');
				const target = mp.players.at(parseInt(id, 10));
				if (!player.entityIsNearby(target)) return;

				this.sendToPlayer(target, text);
				break;
			}
			default:
				if (chatCommands.isFactionCommand(command)) {
					factionChat.sendMessage(player, text, command);
				} else {
					this.sendToAll(text); // 👈 now /say goes to all players
				}
				break;
		}
	}

	sendToAll(message: string) {
		mp.players.broadcast(message);
	}

	sendNear(position: Vector3Mp, message: string, range = 10) {
		mp.players.broadcastInRange(position, range, message);
	}

	sendToPlayer(player: PlayerMp, message: string) {
		player.outputChatBox(message);
	}

	sendToFaction(faction: Faction, message: string) {
		faction.getPlayers().forEach((player) => {
			this.sendToPlayer(player.mp, message);
		});
	}
}

export { COMMANDS };

export default new Chat();
