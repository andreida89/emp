/* eslint-disable import/first */
require('dotenv').config();

import 'source-map-support/register';
import mongoose from 'mongoose';
import './helpers';
import './auth';
import Api from './api';
import redis from './utils/redis';
import mailer from './utils/mailer';
//import weather from './basic/weather';
import time from './basic/time';
import './basic/voice';
import './basic/chat';
import './basic/doors';
import './basic/fingerpointing';
import './basic/handsup';
import './basic/e';
import './basic/cayococa';

import './basic/cosuridegunoi';

import './basic/atasamente';

import './basic/aduty';
import './arataid/index';

//import './basic/cayomaria';
import antiCheat from './basic/anti-cheat';
import logger from './utils/logger';
import './phone';
import './services';
import authToken from './auth/token';
import { loadJobs } from './jobs';
import { loadServices } from './services/service';
import houses from './house/entities';
import businesses from './business/entities';
import './awards/daily';
import './admin';
import './utils/savepos';



import factions from './factions';
import './factions/army';
import './factions/police';
import './factions/ems';
import './factions/sindicat';
import './factions/primarie';
import './factions/mafia';
import './factions/gangs';
import './donation';
import './vehicle';

import './jobs/ciuperci/index';
import './jobs/rame/index';
import './vanzareciuperci/index';
import './piata/index';


import './jafmagazin/index';

import Builder from './vehicle/abuilder';
import './commands';
//import './mrg';
import UserModel from 'models/User';
import CharacterModel from 'models/Character';
import axios from 'axios';
import permissions from 'admin/permissions';
import './events/eventManager';
import './events/comanda';
import jucator from 'helpers/players';
import Character from 'models/Character';
import Business from 'models/Business';
import House from 'models/House';
import Vehicle from 'models/Vehicle';
import User from 'models/User';
import fs from 'fs';

import { spawnCosuri } from 'basic/cosuridegunoi';



import './modulenoi/streamdistancemanager';



function sendGlobalNotification(admin: Player, text: string) {
	console.log(`Global Notification Received: ${text}`);
    if (!permissions.hasPermission(admin, 'admin')) {
        console.log("No permission to send notification");
        return;
    } else {
		console.log('Mesaj de la Cristi');
	}

	console.log(`Sending Global Notification: ${text}`);
    // Send the message to all players as a HUD notification
	mp.players.forEach(player => {
		player.call("HUD-GlobalNotify", [text]);
	});
	

}

// Register the event
mp.events.subscribe({
    'Admin-GlobalNotify': sendGlobalNotification
});


class App {
	private async connectToDatabase() {
		redis.init();
		mp.redis = redis.client;
		await mongoose.connect(process.env.DB_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false
		});

		logger.success('Database connected.');
	}

	async init() {
		mp.events.delayInitialization = true;

		try {
			await this.connectToDatabase();

			new Api().init();
			mailer.init();

			//weather.init();
			time.run();
			antiCheat.init();

			await authToken.clearExpired();
			await loadServices();
			await loadJobs();
			await houses.load();
			await businesses.load();
			await factions.load();

			setTimeout(() => {
				mp.events.delayInitialization = false;
			}, +process.env.INIT_DELAY);
		} catch (err) {
			console.error(err, 'initialize error :(');
		}
	}
}

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1345187485075902596/KxxvVxJdetCKZ5KEjcONqyQT4cfefkJvKMuQSLfN5z7BiaV8qTmAONKkq_IwtxhHgJVK';
const DISCORD_WEBHOOK_URLCK = 'https://discord.com/api/webhooks/1354163525366448228/XC3osYp5ZdgE0TO_W3Dq3GCrq9RbPUiCkcSLkJ5iDjpTTI3M9VWjI32RfBK6_FgKpwBB';

async function sendDiscordLog(data: any) {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            embeds: [data] // Fix: embeds should be an array, not inside "content"
        });
    } catch (error) {
        console.error('Failed to send Discord log:', error.response?.data || error);
    }
}
async function sendDiscordLogCk(data: any) {
    try {
        await axios.post(DISCORD_WEBHOOK_URLCK, {
            embeds: [data] // Fix: embeds should be an array, not inside "content"
        });
    } catch (error) {
        console.error('Failed to send Discord log:', error.response?.data || error);
    }
}
const deathReasons = {
	2460120199: "Antique Cavalry Dagger",
	2508868239: "Baseball Bat",
	4192643659: "Bottle",
	2227010557: "Crowbar",
	2725352035: "Fist",
	2343591895: "Flashlight",
	1141786504: "Golf Club",
	1317494643: "Hammer",
	4191993645: "Hatchet",
	3638508604: "Knuckle",
	2578778090: "Knife",
	3713923289: "Machete",
	3756226112: "Switchblade",
	1737195953: "Nightstick",
	419712736: "Pipe Wrench",
	3441901897: "Battle Axe",
	2484171525: "Pool Cue",
	940833800: "Stone Hatchet",
	453432689: "Pistol",
	3219281620: "Pistol MK2",
	1593441988: "Combat Pistol",
	584646201: "AP Pistol",
	911657153: "Stun Gun",
	2578377531: "Pistol .50",
	3218215474: "SNS Pistol",
	2285322324: "SNS Pistol MK2",
	3523564046: "Heavy Pistol",
	137902532: "Vintage Pistol",
	1198879012: "Flare Gun",
	3696079510: "Marksman Pistol",
	3249783761: "Heavy Revolver",
	3415619887: "Heavy Revolver MK2",
	2548703416: "Double Action",
	2939590305: "Up-n-Atomizer",
	324215364: "Micro SMG",
	736523883: "SMG",
	2024373456: "SMG MK2",
	4024951519: "Assault SMG",
	171789620: "Combat PDW",
	3675956304: "Machine Pistol",
	3173288789: "Mini SMG",
	1198256469: "Unholy Hellbringer",
	487013001: "Pump Shotgun",
	1432025498: "Pump Shotgun MK2",
	2017895192: "Sawed-Off Shotgun",
	3800352039: "Assault Shotgun",
	2640438543: "Bullpup Shotgun",
	2828843422: "Musket",
	984333226: "Heavy Shotgun",
	4019527611: "Double Barrel Shotgun",
	317205821: "Sweeper Shotgun",
	3220176749: "Assault Rifle",
	961495388: "Assault Rifle MK2",
	2210333304: "Carbine Rifle",
	4208062921: "Carbine Rifle MK2",
	2937143193: "Advanced Rifle",
	3231910285: "Special Carbine",
	2526821735: "Special Carbine MK2",
	2132975508: "Bullpup Rifle",
	2228681469: "Bullpup Rifle MK2",
	1649403952: "Compact Rifle",
	2634544996: "MG",
	2144741730: "Combat MG",
	3686625920: "Combat MG MK2",
	1627465347: "Gusenberg Sweeper",
	100416529: "Sniper Rifle",
	205991906: "Heavy Sniper",
	177293209: "Heavy Sniper MK2",
	3342088282: "Marksman Rifle",
	1785463520: "Marksman Rifle MK2",
	2982836145: "RPG",
	2726580491: "Grenade Launcher",
	1305664598: "Smoke Grenade Launcher",
	1119849093: "Minigun",
	2138347493: "Firework Launcher",
	1834241177: "Railgun",
	1672152130: "Homing Launcher",
	125959754: "Compact Grenade Launcher",
	3056410471: "Ray Minigun",
	2481070269: "Grenade",
	2694266206: "BZ Gas",
	4256991824: "Smoke Grenade",
	1233104067: "Flare",
	615608432: "Molotov",
	741814745: "Sticky Bomb",
	2874559379: "Proximity Mine",
	126349499: "Snowball",
	3125143736: "Pipe Bomb",
	600439132: "Baseball",
	883325847: "Jerry Can",
	101631238: "Fire Extinguisher",
	4222310262: "Parachute",
	2461879995: "Electric Fence",
	3425972830: "Hit by Water Cannon",
	133987706: "Rammed by Car",
	2741846334: "Run Over by Car",
	3452007600: "Fall",
	4194021054: "Animal",
	324506233: "Airstrike Rocket",
	2339582971: "Bleeding",
	2294779575: "Briefcase",
	28811031: "Briefcase 02",
	148160082: "Cougar",
	1223143800: "Barbed Wire",
	4284007675: "Drowning",
	1936677264: "Drowning In Vehicle",
	539292904: "Explosion",
	910830060: "Exhaustion",
	3750660587: "Fire",
	341774354: "Heli Crash",
	3204302209: "Vehicle Rocket",
	2282558706: "Vehicle Akula Barrage",
	431576697: "Vehicle Akula Minigun",
	2092838988: "Vehicle Akula Missile",
	476907586: "Vehicle Akula Turret Dual",
	3048454573: "Vehicle Akula Turret Single",
	328167896: "Vehicle APC Cannon",
	190244068: "Vehicle APC MG",
	1151689097: "Vehicle APC Missile",
	3293463361: "Vehicle Ardent MG",
	2556895291: "Vehicle Avenger Cannon",
	2756453005: "Vehicle Barrage Rear GL",
	1200179045: "Vehicle Barrage Rear MG",
	525623141: "Vehicle Barrage Rear Minigun",
	4148791700: "Vehicle Barrage Top MG",
	1000258817: "Vehicle Barrage Top Minigun",
	3628350041: "Vehicle Bombushka Cannon",
	741027160: "Vehicle Bombushka Dual MG",
	3959029566: "Vehicle Cannon Blazer",
	1817275304: "Vehicle Caracara MG",
	1338760315: "Vehicle Caracara Minigun",
	2722615358: "Vehicle Cherno Missile",
	3936892403: "Vehicle Comet MG",
	2600428406: "Vehicle Deluxo MG",
	3036244276: "Vehicle Deluxo Missile",
	1595421922: "Vehicle Dogfighter MG",
	3393648765: "Vehicle Dogfighter Missile",
	2700898573: "Vehicle Dune Grenade Launcher",
	3507816399: "Vehicle Dune MG",
	1416047217: "Vehicle Dune Minigun",
	1566990507: "Vehicle Enemy Laser",
	1987049393: "Vehicle Hacker Missile",
	2011877270: "Vehicle Hacker Missile Homing",
	1331922171: "Vehicle Halftrack Dual MG",
	1226518132: "Vehicle Halftrack Quad MG",
	855547631: "Vehicle Havok Minigun",
	785467445: "Vehicle Hunter Barrage",
	704686874: "Vehicle Hunter Cannon",
	1119518887: "Vehicle Hunter MG",
	153396725: "Vehicle Hunter Missile",
	2861067768: "Vehicle Insurgent Minigun",
	507170720: "Vehicle Khanjali Cannon",
	2206953837: "Vehicle Khanjali Cannon Heavy",
	394659298: "Vehicle Khanjali GL",
	711953949: "Vehicle Khanjali MG",
	3754621092: "Vehicle Menacer MG",
	3303022956: "Vehicle Microlight MG",
	3846072740: "Vehicle Mobileops Cannon",
	3857952303: "Vehicle Mogul Dual Nose",
	3123149825: "Vehicle Mogul Dual Turret",
	4128808778: "Vehicle Mogul Nose",
	3808236382: "Vehicle Mogul Turret",
	2220197671: "Vehicle Mule4 MG",
	1198717003: "Vehicle Mule4 Missile",
	3708963429: "Vehicle Mule4 Turret GL",
	2786772340: "Vehicle Nightshark MG",
	1097917585: "Vehicle Nose Turret Valkyrie",
	3643944669: "Vehicle Oppressor MG",
	2344076862: "Vehicle Oppressor Missile",
	3595383913: "Vehicle Oppressor2 Cannon",
	3796180438: "Vehicle Oppressor2 MG",
	1966766321: "Vehicle Oppressor2 Missile",
	3473446624: "Vehicle Plane Rocket",
	1186503822: "Vehicle Player Buzzard",
	3800181289: "Vehicle Player Lazer",
	1638077257: "Vehicle Player Savage",
	2456521956: "Vehicle Pounder2 Barrage",
	2467888918: "Vehicle Pounder2 GL",
	2263283790: "Vehicle Pounder2 Mini",
	162065050: "Vehicle Pounder2 Missile",
	3530961278: "Vehicle Radar",
	3177079402: "Vehicle Revolter MG",
	3878337474: "Vehicle Rogue Cannon",
	158495693: "Vehicle Rogue MG",
	1820910717: "Vehicle Rogue Missile",
	2971687502: "Vehicle Rotors",
	50118905: "Vehicle Ruiner Bullet",
	84788907: "Vehicle Ruiner Rocket",
	3946965070: "Vehicle Savestra MG",
	231629074: "Vehicle Scramjet MG",
	3169388763: "Vehicle Scramjet Missile",
	1371067624: "Vehicle Seabreeze MG",
	3450622333: "Vehicle Searchlight",
	4171469727: "Vehicle Space Rocket",
	3355244860: "Vehicle Speedo4 MG",
	3595964737: "Vehicle Speedo4 Turret MG",
	2667462330: "Vehicle Speedo4 Turret Mini",
	968648323: "Vehicle Strikeforce Barrage",
	955522731: "Vehicle Strikeforce Cannon",
	519052682: "Vehicle Strikeforce Missile",
	1176362416: "Vehicle Subcar MG",
	3565779982: "Vehicle Subcar Missile",
	3884172218: "Vehicle Subcar Torpedo",
	1744687076: "Vehicle Tampa Dual Minigun",
	3670375085: "Vehicle Tampa Fixed Minigun",
	2656583842: "Vehicle Tampa Missile",
	1015268368: "Vehicle Tampa Mortar",
	1945616459: "Vehicle Tank",
	3683206664: "Vehicle Technical Minigun",
	1697521053: "Vehicle Thruster MG",
	1177935125: "Vehicle Thruster Missile",
	2156678476: "Vehicle Trailer Dualaa",
	341154295: "Vehicle Trailer Missile",
	1192341548: "Vehicle Trailer Quad MG",
	2966510603: "Vehicle Tula Dual MG",
	1217122433: "Vehicle Tula MG",
	376489128: "Vehicle Tula Minigun",
	1100844565: "Vehicle Tula Nose MG",
	3041872152: "Vehicle Turret Boxville",
	1155224728: "Vehicle Turret Insurgent",
	729375873: "Vehicle Turret Limo",
	2144528907: "Vehicle Turret Technical",
	2756787765: "Vehicle Turret Valkyrie",
	4094131943: "Vehicle Vigilante MG",
	1347266149: "Vehicle Vigilante Missile",
	2275421702: "Vehicle Viseris MG",
	1150790720: "Vehicle Volatol Dual MG",
	1741783703: "Vehicle Water Cannon"
};

async function playerDeathHandler(player, reason, killer) {
    if (!player) return; // Prevent crashes if player is undefined

    const deathName = player.name;
    const killerName = killer?.name || "Unknown"; // If no killer, show "Unknown"

    let userDBID = "Unknown DB ID";
    let killerDBID = "Unknown DB ID";
    let userEmail = "Unknown Email";
    let killerEmail = "Unknown Email";

    try {
        // Extract firstName & lastName from player
        const [deathFirstName, deathLastName] = deathName.split("_");

        // Find character in DB
        const character = await CharacterModel.findOne({
            firstName: deathFirstName,
            lastName: deathLastName
        }).select('uid');

        if (character) {
            userDBID = character.uid.toString();

            // Find the corresponding user using the character UID
            const user = await UserModel.findOne({ character: character._id }).select('email');
            if (user) userEmail = user.email;
        }

        // Fetch killer's DB ID and email if available
        if (killer && killer.name) {
            const [killerFirstName, killerLastName] = killer.name.split("_");

            const killerCharacter = await CharacterModel.findOne({
                firstName: killerFirstName,
                lastName: killerLastName
            }).select('uid');

            if (killerCharacter) {
                killerDBID = killerCharacter.uid.toString();

                // Find the killer's email using the character UID
                const killerUser = await UserModel.findOne({ character: killerCharacter._id }).select('email');
                if (killerUser) killerEmail = killerUser.email;
            }
        }
    } catch (error) {
        //console.error("Error fetching character DB ID or email:", error);
    }

    // Get the readable reason, fallback to the numeric ID if not found
    const reasonText = deathReasons[reason] || `Unknown Reason (${reason})`;

    await sendDiscordLog({
        title: "📌 Player Death",
        color: 3066993, // Light blue color
        description: `**${deathName} (DB ID: ${userDBID}, Email: ${userEmail})** a fost ucis de catre **${killerName} (DB ID: ${killerDBID}, Email: ${killerEmail})** cu motivul **${reasonText}**.`,
        footer: { text: "Loguri server | Empire", icon_url: "https://redland.ro/empirerp.png" },
        timestamp: new Date().toISOString()
    });

	// ✅ Trigger CK if death reason is Heavy Revolver (reason ID: 3249783761)
if (reason === 3249783761 && player && player.name) {
	await handleCharacterKill(player, 'CK prin moarte cu Heavy Revolver', 'SINDICAT');
  }
}

mp.events.add("playerDeath", playerDeathHandler);

async function handleCharacterKill(targetPlayer: PlayerMp, reasonText: string, adminName: string = 'Server') {
	const logicTarget = jucator.get(targetPlayer.id);
	if (!logicTarget?.fixId) return;
  
	try {
	  const character = await Character.findOne({ uid: logicTarget.fixId });
	  if (!character) return;
  
	  const characterId = character._id;
  
	  // Sterge caracterul
	  await Character.deleteOne({ _id: characterId });
  
	  // Scoate ownership-uri
	  await Business.updateMany({ owner: characterId }, { $set: { owner: null } });
	  await House.updateMany({ owner: characterId }, { $set: { owner: null } });
	  await Vehicle.deleteMany({ owner: characterId });
	  await User.deleteMany({ character: characterId });
  
	  // Kick jucatorul
	  targetPlayer.kick(`Ai primit CK. Motiv: ${reasonText}`);
  
	  console.log(`[CK] ${targetPlayer.name} a fost sters de ${adminName} cu motivul: ${reasonText}`);

	  await sendDiscordLogCk({
        title: "📌 Player Death",
        color: 3066993, // Light blue color
        description: `**${targetPlayer.name}** (DB ID: **${logicTarget.fixId}** a primit CK de la **${adminName}** cu motivul **${reasonText}**.`,
        footer: { text: "Loguri server | Empire", icon_url: "https://redland.ro/empirerp.png" },
        timestamp: new Date().toISOString()
    });

	} catch (err) {
	  console.error('[CK ERROR]', err);
	}
  }

mp.events.addCommand('notify', (player, message) => {
    if(!message) return player.outputChatBox("You need to enter a message.");

	mp.players.forEach((player) => {
		player.notify(`~ws~ ~p~${message} ~ws~`);
	});
    
    //mp.players.forEach(players => {
    //    players.notify(`~r~${msg}`);
    //})
});

mp.events.addCommand('veh', (player, models) => {
    if (!models) return player.outputChatBox('/veh [model]');
    let tpos = player.position;
    tpos.x = tpos.x + 2;
    let heading = 0;
    const vbuild = new Builder(models, tpos, heading);
    vbuild.setNumberPlate('EMPIRE');
    let vehicle = vbuild.build();

    if (!vehicle) {
        player.outputChatBox("Error: Failed to create vehicle.");
    } else {
        vehicle.isAdminVehicle = true; // <-- SETEAZĂ DUPĂ build!
    }
});




/**
const DISCORD_WEBHOOK_URLSTATUS = 'https://discord.com/api/webhooks/1355953194756215016/KkhTJCEv9sWwpUcvcBcOehSxDOHG6z0MBaj7oGqXVjI6JEr3pGv3PyJIFnZgQD01TUqQ';
const PEAK_FILE = './peak.json';

let lastMessageId: string | null = null;
let peakPlayers = loadPeakPlayers();

function loadPeakPlayers(): number {
    if (fs.existsSync(PEAK_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(PEAK_FILE, 'utf-8'));
            return data.peak || 0;
        } catch {
            return 0;
        }
    }
    return 0;
}

function savePeakPlayers(value: number) {
    fs.writeFileSync(PEAK_FILE, JSON.stringify({ peak: value }, null, 2));
}

function updatePeakPlayers() {
    const current = mp.players.length;
    if (current > peakPlayers) {
        peakPlayers = current;
        savePeakPlayers(peakPlayers);
    }
}


export async function updateDiscordStatus() {
    updatePeakPlayers();

    const players = mp.players.length;
    const maxPlayers = 2000;
    const ip = 'connect.empirerp.eu';

    const embed = {
        title: '📡 EMPIRE ROMANIA ROLEPLAY | SERVER STATUS',
        color: 15158332,
        fields: [
            { name: '📋 Nume Server:', value: 'EMPIRE ROMANIA ROLEPLAY' },
            { name: '🖥️ IP Server:', value: ip },
            { name: '🟢 Status', value: 'Online', inline: true },
            { name: '👥 Jucatori', value: `${players}/${maxPlayers}`, inline: true },
            { name: '🆙 Record Jucatori', value: `${peakPlayers}`, inline: true },
        ],
        footer: {
            text: `EMPIRE ROMANIA • ${new Date().toLocaleString('ro-RO')}`,
        },
        timestamp: new Date().toISOString(),
		thumbnail: {
			url: "https://redland.ro/empirerp.png"
		}
    };

    try {
        if (lastMessageId) {
            try {
                await axios.patch(`${DISCORD_WEBHOOK_URLSTATUS}/messages/${lastMessageId}`, {
                    embeds: [embed]
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                return;
            } catch (patchError) {
                console.warn('PATCH failed, trying to delete old message...');
                try {
                    await axios.delete(`${DISCORD_WEBHOOK_URLSTATUS}/messages/${lastMessageId}`);
                } catch (deleteError) {
                    console.warn('Delete also failed:', deleteError.response?.data || deleteError);
                }
                lastMessageId = null;
            }
        }

        const res = await axios.post(`${DISCORD_WEBHOOK_URLSTATUS}?wait=true`, {
            embeds: [embed]
        });

        if (res.data?.id) {
            lastMessageId = res.data.id;
            //console.log('New status message sent. ID saved:', lastMessageId);
        }

    } catch (error) {
        console.error('Discord status error:', error.response?.data || error);
    }
}


// ——— Rulează o dată la start și apoi la fiecare 5 minute ———
updateDiscordStatus();

setInterval(() => {
    updateDiscordStatus();
}, 5 * 60 * 1000);

**/

const app = new App();
app.init();




mp.events.addCommand('bug', (player) => {
    player.call('client:util:bug');
});

mp.events.addCommand('atasa', (player) => {
    player.call('client:util:bug2')
})

/** 
const sniperHash = mp.joaat("weapon_sniperrifle");
const tecHash = mp.joaat("weapon_machinepistol");
const snsHash = mp.joaat("weapon_snspistol");

// Will give the player a sniper rifle and components (suppressor, advanced scope and luxury finish)
mp.events.addCommand("prosniper", (player) => {
    player.giveWeapon(sniperHash, 9999);
    player.giveWeaponComponent(sniperHash, mp.joaat("COMPONENT_AT_AR_SUPP_02"));
    player.giveWeaponComponent(sniperHash, mp.joaat("COMPONENT_AT_SCOPE_MAX"));
    player.giveWeaponComponent(sniperHash, mp.joaat("COMPONENT_SNIPERRIFLE_VARMOD_LUXE"));
});


mp.events.addCommand("protec", (player) => {
    player.giveWeapon(tecHash, 9999);
    player.giveWeaponComponent(tecHash, mp.joaat("COMPONENT_AT_PI_SUPP"));
    player.giveWeaponComponent(tecHash, mp.joaat("COMPONENT_MACHINEPISTOL_CLIP_02"));
});
mp.events.addCommand("tec", (player) => {
    player.removeWeaponComponent(tecHash, mp.joaat("COMPONENT_AT_PI_SUPP"));
});

mp.events.addCommand("prosns", (player) => {
    player.giveWeapon(snsHash, 9999);
    player.giveWeaponComponent(snsHash, mp.joaat("COMPONENT_SNSPISTOL_CLIP_02"));
    player.giveWeaponComponent(snsHash, mp.joaat("COMPONENT_SNSPISTOL_VARMOD_LOWRIDER"));
});
mp.events.addCommand("sns", (player) => {
    player.removeWeaponComponent(snsHash, mp.joaat("COMPONENT_SNSPISTOL_CLIP_02"));
	player.removeWeaponComponent(snsHash, mp.joaat("COMPONENT_SNSPISTOL_VARMOD_LOWRIDER"));
});

// Will remove the suppressor from the player's sniper rifle
mp.events.addCommand("loudsniper", (player) => {
    player.removeWeaponComponent(sniperHash, mp.joaat("COMPONENT_AT_AR_SUPP_02"));
});
**/


// INCARCARE COSURI DE GUNOI START
spawnCosuri();
// INCARCARE COSURI DE GUNOI END


// DETECTARE WAYPOINT PENTRU COMANDA TPW START

mp.events.add('playerCommand', (command) => {
    if (command === "tpw") {
        const blip = mp.game.ui.getFirstBlipInfoId(8); // 8 = Waypoint
        if (!mp.blips.exists(blip)) {
            mp.gui.chat.push("~r~Nu ai niciun waypoint marcat pe hartă.");
            return;
        }
        const coords = mp.game.ui.getBlipInfoIdCoord(blip);
        // Trimite coordonatele către server
        mp.events.callRemote('tpw:goto', coords.x, coords.y, coords.z);
    }
});

// DETECTARE WAYPOINT PENTRU COMANDA TPW STOP
