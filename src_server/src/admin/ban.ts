import moment from 'moment';
import axios from 'axios';
import UserModel from 'models/User';
import CharacterModel from 'models/Character';
import chat from 'basic/chat';
import permissions from './permissions';
//import journal from './journal';

const BAN_WEBHOOK_URL = 'https://discord.com/api/webhooks/1498344992819642599/SEdAEZIkH4YZ-z5ns0gA4m-SUvTrK7MdO0y4xdPEK8voVVyx08LWIYFd_En7mZ7Kwbsq';
const UNBAN_WEBHOOK_URL = 'https://discord.com/api/webhooks/1498345002709942454/gI7iUIW1piUO9Jeopg8RA3vHX1iwqH04T-GSeZMWVR4Y11ShnqXoqj5wBtu2RMshDwry';

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

import BanLog from '../models/BanLog';

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

	async banPlayer(admin: Player, userId: string, term: string, reason: string, isPermanent: boolean = false, withPayment: boolean = false) {
		if (!permissions.hasPermission(admin, 'helper')) return;
	
		// Calculate expiry date if temporary
		let expires = moment().add(10, 'years').format(); // fallback for perm
		if (isPermanent) {
			expires = moment().add(100, 'years').format();
		} else {
			// Handle units like "zi", "zile", "saptamana", "saptamani", "luna", "luni"
			const termLower = term.toLowerCase().replace(/\s/g, '');
			const amountMatch = termLower.match(/^(\d+)/);
			const amount = amountMatch ? parseInt(amountMatch[1], 10) : 0;
			
			if (amount <= 0) {
				return mp.events.reject('Durata invalida. Exemplu: 1zi, 7zile, 1luna');
			}

			if (termLower.includes('zi') || termLower.includes('zile')) {
				expires = moment().add(amount, 'days').format();
			} else if (termLower.includes('saptamana') || termLower.includes('saptamani')) {
				expires = moment().add(amount, 'weeks').format();
			} else if (termLower.includes('luna') || termLower.includes('luni')) {
				expires = moment().add(amount, 'months').format();
			} else {
				// Default to days if no unit recognized
				expires = moment().add(amount, 'days').format();
			}

			// Permission check for long bans
			const totalHours = moment(expires).diff(moment(), 'hours');
			if (totalHours > 6 && !permissions.hasPermission(admin, 'administrator')) {
				return mp.events.reject('Durata maxima temporara pt tine este de 6 ore');
			}
		}
	
		// Find the target's character and user, online or offline
		// In test environment, userId is the fixId (UID)
		const targetIdNum = parseInt(userId, 10);
		let targetCharacter = await CharacterModel.findOne({ uid: targetIdNum }).lean();
		
		if (!targetCharacter && userId.length === 24) {
			targetCharacter = await CharacterModel.findById(userId).lean();
		}

		if (!targetCharacter) {
			return mp.events.reject('Jucatorul nu a fost gasit in baza de date.');
		}

		let targetUser = await UserModel.findOne({ character: targetCharacter._id }).lean();
		
		if (!targetUser) {
			// Try finding by account directly if targetCharacter was somehow not linked properly
			targetUser = await UserModel.findById(userId).lean();
		}

		if (!targetUser) {
			return mp.events.reject('Jucatorul nu are un cont valid atasat.');
		}

		await UserModel.findByIdAndUpdate(targetUser._id, {
			$set: { ban: { admin: admin.dbId, reason, expires, permanent: isPermanent } }
		}).lean();
	
		// Insert BanLog
		let adminEmail = 'N/A';
		if (admin.dbId && admin.dbId.length === 24) {
			const adminUser = await UserModel.findOne({ character: admin.dbId }).lean();
			if (adminUser) adminEmail = adminUser.email;
		}

		await BanLog.create({
			issuerId: admin.fixId,
			issuerEmail: adminEmail,
			bannedId: targetCharacter.uid || 0,
			bannedEmail: targetUser.email || 'N/A',
			bannedSerial: targetUser.serial || 'N/A',
			reason: reason,
			term: isPermanent ? 'Permanent' : term,
			isPermanent,
			withPayment
		});

		const onlineTarget = mp.players.getByFixId(userId);
		const targetName = onlineTarget ? onlineTarget.getName() : `${targetCharacter?.firstName || ''} ${targetCharacter?.lastName || ''}`.trim() || 'Offline Player';

		chat.sendSystem(`${admin.getName()} a banat pe ${targetName} (${reason})`);
		if (onlineTarget) onlineTarget.mp.kick(`Banat: ${reason}`);
	
		// Send Ban Log to Discord
		const embed = {
			title: '🔨 Player Banned',
			color: 16711680,
			description: `**${targetName}** a primit ban de la **${admin.getName()}**`,
			fields: [
				{ name: '**Player ID**', value: `\`${userId}\``, inline: true },
				{ name: '**Email**', value: `\`${targetUser.email}\``, inline: true },
				{ name: '**Duration**', value: `\`${isPermanent ? 'Permanent' : term}\``, inline: true },
				{ name: '**Reason**', value: `\`${reason}\``, inline: false },
				{ name: '**Plata**', value: `\`${withPayment ? 'CU PLATA' : 'FARA PLATA'}\``, inline: true }
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
