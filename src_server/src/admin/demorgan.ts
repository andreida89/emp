import moment from 'moment';
import chat from 'basic/chat';
import prison from 'basic/prison';
import permissions from './permissions';
//import journal from './journal';
import UserModel from 'models/User';
import CharacterModel from 'models/Character';
import axios from 'axios';

const JAIL_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1345219543248801915/HZHUxLima0lsmLqPFbLFcX6ujXXgjvfq46FklH33usAHp_vYOSWJEGTNLGf170MPuHfh';
const UNJAIL_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1345224639541940224/DTb04xUQQG886XSoedFlkNr0HaFf9_awdDKLg6cRbppIGswRIeFDBKiRuX04A3JqqeDk';
async function sendDiscordLog(webhookUrl: string, embed: any) {
    try {
        await axios.post(webhookUrl, { embeds: [embed] });
    } catch (error) {
        console.error('Failed to send Discord log:', error);
    }
}

class AdminDemorgan {
	constructor() {
		mp.events.subscribe({
			'Admin-ToDemorgan': this.toDemorgan.bind(this),
			'Admin-ReleaseDemorgan': this.releasePlayer.bind(this)
		});
	}

	private async toDemorgan(admin: Player, userId: string, term: string, reason: string) {
		if (!permissions.hasPermission(admin, 'helper')) return;

		const minutes = this.getMinutesAmount(term);

		if (minutes > 2 * 60 && !permissions.hasPermission(admin, 'administrator')) {
			return mp.events.reject('Durata maxima - 2 ore');
		}

		const target = mp.players.getByDbId(userId);

		if (target) {
			await prison.imprisonPlayer(target, minutes, reason);

			chat.sendSystem(
				`${admin.getName()} a dat jail lui ${target.getName()} (${reason})`
			);
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
			title: '🔨 Player Jail',
			color: 16711680,
			description: `**${target.getName()}** a primit jail de la **${admin.getName()}**`,
			fields: [
				{ name: '**Player ID**', value: `\`${characterUid}\``, inline: true },
				{ name: '**Email**', value: `\`${email}\``, inline: true },
				{ name: '**Duration**', value: `\`${minutes}\``, inline: true },
				{ name: '**Reason**', value: `\`${reason}\``, inline: false }
			],
			footer: { text: 'Server Logs | Empire', icon_url: 'https://redland.ro/empirerp.png' },
			timestamp: new Date().toISOString()
		};
		await sendDiscordLog(JAIL_DISCORD_WEBHOOK_URL, embed);
		}
	}

	private async releasePlayer(admin: Player, userId: string) {
		if (!permissions.hasPermission(admin, 'helper')) {
			return mp.events.reject('Nu ai suficiente drepturi!');
		}

		const target = mp.players.getByDbId(userId);

		const user = await UserModel.findOne({ character: userId }).lean();
		const email = user ? user.email : "Unknown Email";

		let characterUid = "Unknown UID";
		if (user.character) {
			const characterData = await CharacterModel.findById(user.character).lean(); // Use Correct Model
			if (characterData && characterData.uid) {
				characterUid = characterData.uid.toString();
			}
		}

		if (target && prison.isImprisoned(target)) {
			prison.releasePlayer(target);

		//	journal.recordAction(admin, 'prison_release', target.getName(), userId);
		chat.sendSystem(`${admin.getName()} a debanat pe ${email}`);

				// ✅ Send Unban Log to Discord
				const embed = {
					title: '✅ Player Unjail',
					color: 65280,
					description: `**${target.getName()} - ${email}** a primit unjail de la **${admin.getName()}**`,
					fields: [
						{ name: '**Email**', value: `\`${email}\``, inline: true },
						{ name: '**Player UID**', value: `\`${characterUid}\``, inline: true }
					],
					footer: { text: 'Server Logs | Empire', icon_url: 'https://redland.ro/empirerp.png' },
					timestamp: new Date().toISOString()
				};
				await sendDiscordLog(UNJAIL_DISCORD_WEBHOOK_URL, embed);
		}
	}

	private getMinutesAmount(date: string) {
		return moment(date).diff(moment(), 'minutes');
	}
}

const demorgan = new AdminDemorgan();
