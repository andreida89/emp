import moment from 'moment';
import CharModel from 'models/Character';
import offers from 'helpers/offers';
import { finishWork } from 'jobs';
import vehicleDespawn from 'vehicle/despawn';
import umuCalls from 'factions/umu/calls';
import axios from 'axios';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1496794801339629648/hPzTvpjSyb6fz811RK5mn1T1TEoR3YlskQ0RY09NuLFYAdJWiVZuTgwZMGwqm0nCXjrc';

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
        "server:playerCreateWaypoint": (player: PlayerMp, data: { vehicle_id: number, x: number, y: number, z: number }) => {
                const vehicle_id = data.vehicle_id;
                const vehicle = mp.vehicles.at(vehicle_id)
                
                if (!vehicle || !mp.vehicles.exists(vehicle)) return console.log("!!!vehiculu nu exista")
                const coords = new mp.Vector3(data.x, data.y, data.z);
                        
                const passengers = vehicle
                    .getOccupants()
                    .filter(p => (p.seat as number) >= 0);

                passengers.forEach(passenger => {
                    passenger.call("client:syncWaypoint", [coords.x, coords.y])
                });

                //console.log("pasagerii sincronizati:", passengers.length);
                //console.log("!!! pasagerii", passengers, vehicle, coords)
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
    const gameUID =
        data?.uid ||
        (player as any).fixId ||
        (player.getVariable && player.getVariable('uid')) ||
        "Unknown Game UID";


    console.log(`[DEBUG] Player Quit - Name: ${playerName}, Reason: ${reason}, IP: ${playerIP}, Game UID: ${gameUID}`);
    console.log(`[DEBUG] Armor save value: ${armorValue}`);

    if (dbId) {
        // FĂ lucrurile dependente de player/data AICI (cât încă e valid!)
        if (isDead) umuCalls.cancelCall(dbId);

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
                    armorValue,
                    deathExpiresAt: (isDead && data?.deathExpiresAt) ? data.deathExpiresAt : undefined
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
                icon_url: "https://empirerp.ro/empirerp.png"
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
