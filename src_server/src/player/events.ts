import moment from 'moment';
import CharModel from 'models/Character';
import offers from 'helpers/offers';
import { finishWork } from 'jobs';
import vehicleDespawn from 'vehicle/despawn';
import emsCalls from 'factions/ems/calls';
import axios from 'axios';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1255211705311694872/zql4ztkNdbXnGOjMCGSXMT88xjIfwkPBq5gmD7x3MQMLYJI3snraFC23OJCCv9kQO80s';

async function sendDiscordLog(embed: any) {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, { embeds: [embed] });
    } catch (error) {
        console.error('Failed to send Discord log:', error);
    }
}

class PlayerEvents {
	constructor() {
		mp.events.add('playerJoin', this.onJoin);
		mp.events.add('playerQuit', this.onLeave);

		mp.events.subscribe({
			playerSelectTarget: (player: Player, target: any) => {
				player.target = target;
			},
			playerCreateWaypoint: (player: Player, coords: PositionEx) => {
				if (!coords) return;

				const { x, y, z } = coords;
				player.waypoint = new mp.Vector3(x, y, z);
			},
			'Player-KickAfk': (player: Player) => {
				player.mp.kick('AFK');
			}
		});
	}

	private onJoin(player: PlayerMp) {
		player.colshapes = [];
		//player.attachments = [];

		player.spawn(new mp.Vector3(34.58, 856.84, 197.76));
		player.dimension = player.id + 1000;
	}

private async onLeave(player: PlayerMp, reason: string) {
    // Salvează TOATE datele de care ai nevoie cât playerul este valid!
    const { id, position, health } = player;
    const data = mp.players.get(player);

    // Salvează valorile ESENȚIALE cât playerul este valid
    const dbId = data?.dbId;
    const inventory = data?.inventory;
    const hunger = data?.hunger;
    const thirst = data?.thirst;
    const paydayTime = data?.paydayTime;
    const bonusTime = data?.bonusTime;
    const loginAt = data?.loginAt;
    const isDead = data?.dead;
    const currentHealth = isDead ? 0 : health;
    const armorValue = player.armour || player.mp?.armour || 0; // ← Folosește direct valoarea actuală de armură

    // Salvează pentru log (opțional)
    const playerName = player.name || "Unknown Player";
    const playerIP = player.ip || "Unknown IP";
    //const gameUID = player.getVariable("uid") || "Unknown Game UID";
const gameUID =
    player.fixId ||
    (player.mp && player.mp.fixId) ||
    (player.getVariable && player.getVariable('fixId')) ||
    "Unknown Game UID";


    console.log(`[DEBUG] Player Quit - Name: ${playerName}, Reason: ${reason}, IP: ${playerIP}, Game UID: ${gameUID}`);
    console.log(`[DEBUG] Armor save value: ${armorValue}`);

    if (dbId) {
        // FĂ lucrurile dependente de player/data AICI (cât încă e valid!)
        if (isDead) emsCalls.cancelCall(dbId);

        offers.refuse(data);
        finishWork(data);
        vehicleDespawn.despawnPlayerVehicles(data);

        // Actualizare CharacterModel în DB
        try {
            await CharModel.findByIdAndUpdate(dbId, {
                $set: {
                    position,
                    inventory,
                    hunger,
					thirst,
                    health: currentHealth,
                    paydayTime,
                    bonusTime,
                    armorValue
                },
                $inc: {
                    playedTime: moment().diff(loginAt, "minutes")
                }
            });
        } catch (err) {
            console.error('[ERROR] Failed to update CharacterModel on quit:', err);
        }
    }

    // După ce ai terminat, șterge playerul din mp.players!
    mp.players.delete(id);

    // Log Discord (după ștergere, nu mai folosi player/data după await!)
    try {
        const embed = {
            title: "🚪 Player Disconnected",
            color: 0xFF5733, // Red-orange color
            description: `**${playerName}** a ieșit de pe server.`,
            fields: [
                { name: "**MOTIV**", value: `\`${reason}\``, inline: true },
                { name: "**ADRESA IP**", value: `\`${playerIP}\``, inline: true },
                { name: "**ID IC**", value: `\`${gameUID}\``, inline: true }
            ],
            footer: {
                text: "Server Logs | Empire",
                icon_url: "https://empirerp.eu/empirerp.png"
            },
            timestamp: new Date().toISOString()
        };

        await axios.post(DISCORD_WEBHOOK_URL, { embeds: [embed] });

    } catch (error) {
        console.error("Failed to log player quit:", error);
    }
}

	
}

const events = new PlayerEvents();
