import moment from 'moment';
import axios from 'axios';
import UserModel from 'models/User';
import CharacterModel from 'models/Character';
import chat from 'basic/chat';
import permissions from './permissions';
//import journal from './journal';

const BAN_WEBHOOK_URL = 'https://discord.com/api/webhooks/1342883075498971208/LcJFZdVUFBV7tuGPSMubeumgDDePs_1tNETArnhne_9j_ukCIzr--tP5--hVkiYaGOur';
const UNBAN_WEBHOOK_URL = 'https://discord.com/api/webhooks/1342884108262707210/Gfzgwab9QecFOUBaroCgsZ6khau2VEH6Fs0UV-on18lJsnR1-iE3kU1pWn7xfgCpHROM';

type BanData = {
	admin: string;
	reason: string;
	expires: string;
	permanent: boolean;
};

async function sendDiscordLog(webhookUrl: string, embed: any) {
    try {
        await axios.post(webhookUrl, { embeds: [embed] });
    } catch (error) {
        console.error('Failed to send Discord log:', error);
    }
}

class Ban {
	constructor() {
		mp.events.subscribe({
			'Admin-Ban': this.banPlayer.bind(this),
			'Admin-Unban': this.unbanPlayer.bind(this)
		});
	}

	isValid(user: UserModel) {
		const { ban: data } = user;
		if (!data) return false;
		return data.permanent || moment().diff(data.expires, 'minutes') < 0;
	}

	getExpiresDate(data: BanData) {
		return data.permanent ? 'Niciodata' : moment(data.expires).format('DD.MM.YYYY HH:mm');
	}

	private async banPlayer(admin: Player, userId: string, term: string, reason: string) {
		if (!permissions.hasPermission(admin, 'helper')) return;
	
		const target = mp.players.getByDbId(userId);
		if (!target) return mp.events.reject('Jucatorul nu este online');
	
		if (this.getHoursAmount(term) > 6 && !permissions.hasPermission(admin, 'administrator')) {
			return mp.events.reject('Durata maxima - 6 ore');
		}
	
		await UserModel.findByIdAndUpdate(target.account, {
			$set: { ban: { admin: admin.dbId, reason, expires: term, permanent: false } }
		}).lean();
	

		chat.sendSystem(`${admin.getName()} a banat pe ${target.getName()} (${reason})`);
		target.mp.kick(`${reason}`);
	
		// ✅ Fetch the correct email from the Users collection
		const user = await UserModel.findOne({ character: userId }).lean();
		const email = user ? user.email : "Unknown Email";
	
				// ✅ Fetch character document from `characters` collection
				let characterUid = "Unknown UID";
				if (user.character) {
					const characterData = await CharacterModel.findById(user.character).lean(); // Use Correct Model
					if (characterData && characterData.uid) {
						characterUid = characterData.uid.toString();
					}
				}

		// ✅ Send Ban Log to Discord
		const embed = {
			title: '🔨 Player Banned',
			color: 16711680,
			description: `**${target.getName()}** a primit ban de la **${admin.getName()}**`,
			fields: [
				{ name: '**Player ID**', value: `\`${characterUid}\``, inline: true },
				{ name: '**Email**', value: `\`${email}\``, inline: true },
				{ name: '**Duration**', value: `\`${this.getExpiresDate({ admin: admin.dbId, reason, expires: term, permanent: false })}\``, inline: true },
				{ name: '**Reason**', value: `\`${reason}\``, inline: false }
			],
			footer: { text: 'Server Logs | Empire', icon_url: 'https://redland.ro/empirerp.png' },
			timestamp: new Date().toISOString()
		};
		await sendDiscordLog(BAN_WEBHOOK_URL, embed);
	}

	private async unbanPlayer(admin: Player, email: string) { 
		if (!permissions.hasPermission(admin, 'administrator')) {
			return mp.events.reject('Nu ai suficiente drepturi!');
		}
	
		// ✅ Find user by email and check for active bans
		const user = await UserModel.findOneAndUpdate(
			{
				email: email.toLowerCase(),
				'ban': { $exists: true },
				'ban.permanent': { $ne: true }
			},
			{ $unset: { ban: "" } },
			{ new: true }
		);
	
		if (!user) return mp.events.reject('Jucatorul nu a fost gasit sau nu are un ban activ');
	
		// ✅ Fetch character document from `characters` collection
		let characterUid = "Unknown UID";
		if (user.character) {
			const characterData = await CharacterModel.findById(user.character).lean(); // Use Correct Model
			if (characterData && characterData.uid) {
				characterUid = characterData.uid.toString();
			}
		}
	
		// ✅ Record unban action in journal
		journal.recordAction(admin, 'unban', email, characterUid);
		chat.sendSystem(`${admin.getName()} a debanat pe ${email}`);
	
		// ✅ Send Unban Log to Discord
		const embed = {
			title: '✅ Player Unbanned',
			color: 65280,
			description: `**${email}** a fost debanat de catre ${admin.getName()}`,
			fields: [
				{ name: '**Email**', value: `\`${email}\``, inline: true },
				{ name: '**Player UID**', value: `\`${characterUid}\``, inline: true }
			],
			footer: { text: 'Server Logs | Empire', icon_url: 'https://redland.ro/empirerp.png' },
			timestamp: new Date().toISOString()
		};
		await sendDiscordLog(UNBAN_WEBHOOK_URL, embed);
	}
	
	
	

	private getHoursAmount(date: string) {
		return moment(date).diff(moment(), 'hours');
	}
}

export default new Ban();
