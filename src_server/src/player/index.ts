import UserModel from 'models/User';
import CharModel from 'models/Character';
import money from 'helpers/money';
import time from 'basic/time';
import tasks from 'awards/tasks';
import bonus from 'awards/bonus';
import vehicleCtrl from 'vehicle';
import house from 'house';
import business from 'business';
import garage from 'garage';
import factions from 'factions';
import hunger from './hunger';
import thirst from './thirst';
import character from './character';
import spawn from './spawn';
import playerDeath from './death';
import playerStorage from './inventory/storage';
import './events';
import './docs';
import './crouch';
import './hudsettings';

class PlayerController {
	async load(player: Player, user: UserModel) {
		const { mp } = player;
		const { character: data } = user as UserModel & { character: CharModel };

		mp.setVariables({
			uid: data.uid,
			fixId: data.uid,
			adminLvl: user.adminLvl
		});

		mp.health = data.health > 0 ? data.health : 100;
		mp.armour = data.armorValue || 0;
		mp.name = `${data.firstName}_${data.lastName}`;

		player.dbId = data._id.toString();
		player.fixId = data.uid;
		if (player.mp) player.mp.fixId = data.uid;
		player.account = user._id.toString();
		player.adminLvl = user.adminLvl;
		player.experience = data.experience;
		player.phone = data.phone;
		player.inventory = data.inventory;
		player.vehicleSlots = data.vehicleSlots;
		player.registerAt = data.createdAt;
		player.licenses = data.licenses;
		player.skills = data.skills;
		player.bankAccount = data.bankAccount;
		player.bankPin = data.bankPin;
		player.hudSettings = data.hudSettings;
		player.arrest = data.arrest;
		player.paydayTime = data.paydayTime;
		player.deathExpiresAt = data.deathExpiresAt;

		// Ensure phone is initialized correctly as a plain object with arrays
		const phoneData = data.toObject().phone || {};
		let messages = phoneData.messages || [];

		// Handle legacy stringified messages if any
		if (messages.length === 1 && typeof messages[0] === 'string' && messages[0].startsWith('[')) {
			try {
				messages = JSON.parse(messages[0]);
				// Optional: update DB to clean it up permanently
				CharModel.findByIdAndUpdate(data._id, { $set: { 'phone.messages': messages } }).exec().catch(() => {});
			} catch (e) {
				console.error("[Phone] Failed to parse legacy messages JSON:", e);
			}
		}

		player.phone = {
			number: phoneData.number,
			contacts: phoneData.contacts || [],
			blacklist: phoneData.blacklist || [],
			messages: messages
		};

		time.setTimeOnClient(mp);

		const moneyData = data.toObject().money || { cash: 0, bank: 0 };
		const actualCash = (player.inventory || [])
			.filter(i => i.name === 'ron')
			.reduce((acc, i) => acc + i.amount, 0);
		
		moneyData.cash = actualCash;

		money.updatePlayer(player, { ...moneyData, points: user.donate });
		hunger.updateForPlayer(player, data.hunger);
		thirst.updateForPlayer(player, data.thirst);

		character.load(player, data.appearance as any);

		tasks.generate(player, data, user.loginAt);
		bonus.initPlayerBonus(player, data.bonusTime, user.loginAt);
		house.loadForPlayer(player);
		business.loadForPlayer(player);
		garage.loadForPlayer(player);
		factions.loadForPlayer(player);
		playerStorage.syncHasStatie(player);
		playerStorage.syncHasSmartwatch(player);

		await vehicleCtrl.loadPlayerVehicles(player);

		if (data.position) player.tp(data.position, 90, mp.id + 1);
		else spawn.toStart(player);

		if (data.hudSettings) {
			player.mp.call('client:updateHudVisibility', [JSON.stringify(data.hudSettings.visibility)]);
			if (data.hudSettings.styles) {
				player.mp.call('client:updateHudStyle', [JSON.stringify(data.hudSettings.styles)]);
			}
		}

		if (data.health <= 0 || (data.deathExpiresAt && data.deathExpiresAt > Date.now())) {
			player.dead = true;
		}
	}

	savePlayers(players: Player[]) {
		const operations = [];

		players.forEach((player) => {
			if (!mp.players.exists(player.mp)) return;

			operations.push({
				updateOne: {
					filter: { _id: player.dbId },
					update: {
						position: player.mp.position,
						health: player.mp.health,
						armorValue: player.mp.armour || 0,
						paydayTime: player.paydayTime,
						bonusTime: player.bonusTime,
						experience: player.experience,
						hudSettings: player.hudSettings,
						arrest: player.arrest,
						deathExpiresAt: player.deathExpiresAt
					}
				}
			});
		});

		if (operations.length) CharModel.bulkWrite(operations);
	}
}

export default new PlayerController();
