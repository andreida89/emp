import { compare } from 'utils/encryption';
import UserModel from 'models/User';
import CharacterModel from 'models/Character';
import hud from 'helpers/hud';
import players from 'helpers/players';
import ban from 'admin/ban';
import playerCtrl from 'player';
import token from './token';
import logger from 'utils/logger';
import axios from 'axios';
import { checkWhitelist } from 'helpers/whitelist';
import BanLog from '../models/BanLog';
import moment from 'moment';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1496794790614925322/ImEPmLo42Krw_tfpc4gkRjnHTyldVsNpcf7zdwy1ZBf4i0_2lOHxljCYbD-x7OMINoDJ';

async function sendDiscordLog(data: any) {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            embeds: [data] // Fix: embeds should be an array, not inside "content"
        });
    } catch (error) {
        //console.error('Failed to send Discord log:', error.response?.data || error);
    }
}


class Login {
constructor() {
    mp.events.subscribe(
        {
            'Auth-SignIn': this.signIn.bind(this),
            'Auth-SignInWithCode': this.signInWithCode.bind(this)
        },
        false
    );

    mp.events.subscribeToDefault(
        {
            playerReady: async (player: Player) => {
                // Debug serial la connect
                const serial = player.mp.serial;
                console.log(`[DEBUG][playerReady] Serial primit: ${serial}`);

                const whitelisted = await checkWhitelist(player, serial);
                //console.log(`[DEBUG][playerReady] Este whitelisted? ${whitelisted}`);

                if (!whitelisted) {
                    //console.log(`[DEBUG][playerReady] Serialul NU este pe whitelist (${serial}). Trimite pagina de constructie!`);
                    player.callEvent('Auth-ShowConstruction');
                    return;
                }
                //console.log(`[DEBUG][playerReady] Serialul ESTE pe whitelist (${serial}). Merge spre login!`);
                player.callEvent('Auth-ShowMenu');
            }
        },
        false
    );
}

    private isRecognizedDevice(player: PlayerMp, serial: string, social: string) {
        return player.socialClub === social && player.serial === serial;
    }

    private async signIn(player: Player, email: string, password: string) {
        const user = await UserModel.findOne({ email }).populate('character');
        
        // Also check if this serial is banned globally
        const bannedSerial = await BanLog.findOne({ 
            bannedSerial: player.mp.serial,
            $or: [{ isPermanent: true }, { term: { $ne: 'Permanent' } }] // We will parse term check below
        }).sort({ createdAt: -1 });

        if (bannedSerial) {
             let stillBanned = false;
             if (bannedSerial.isPermanent) stillBanned = true;
             else if (bannedSerial.term !== 'Permanent') {
                 // But wait, the expiry date is in UserModel, in BanLog we saved "term" like "5 ZILE"
                 // Actually, it's easier to check UserModel but BanLog helps track the serial
                 // Let's find the original banned user's account to get exact expiry
                 const origUser = await UserModel.findOne({ serial: player.mp.serial }).lean();
                 if (origUser && origUser.ban && (origUser.ban.permanent || moment().diff(origUser.ban.expires, 'minutes') < 0)) {
                     stillBanned = true;
                 }
             }
             if (stillBanned) {
                hud.showNotification(
                    player,
                    'error',
                    `Serialul tau este blocat pentru un ban anterior.`,
                    true
                );
                throw new SilentError('user is blocked');
             }
        }

        const error = await this.checkData(user, password);

        if (error) return Promise.reject(error);
        if (mp.players.getByDbId(user.character)) return;

        if (ban.isValid(user)) {
            hud.showNotification(
                player,
                'error',
                `Ai fost banat pe motivul ${
                    user.ban.reason
                }. Durata: ${ban.getExpiresDate(user.ban)}.`,
                true
            );
            throw new SilentError('user is blocked');
        }

        if (!this.isRecognizedDevice(player.mp, user.serial, user.socialName)) {
            await token.create('login', email);
            return Promise.reject({ field: 'email', confirm: true });
        }

        await this.loadAccount(player, user);
    }

    private async signInWithCode(player: Player, email: string, code: string) {
        const user = await UserModel.findOne({ email }).populate('character');
        const isValidCode = await token.isValid(email, 'login', code);

        if (!user || !isValidCode) throw new SilentError('auth token is invalid');

        user.serial = player.mp.serial;
        user.socialName = player.mp.socialClub;

        await this.loadAccount(player, user);
    }

    private async checkData(user: UserModel, password: string) {
        if (!user) return { field: 'email', message: 'Cont inexistent' };

        const isCorrectPass = await compare(password, user.password);

        if (!isCorrectPass || mp.players.getByDbId(user._id)) {
            return { field: 'password', message: 'Parola incorecta' };
        }
    }

    private async loadAccount(player: Player, user: UserModel) {
        await user.populate({ path: 'character' }).execPopulate();
        await playerCtrl.load(player, user);

        user.loginAt = new Date().toISOString();
        if (!user.ip.includes(player.mp.ip)) user.ip.push(player.mp.ip);
        await user.save();
        await (user.character as any).save();

        players.authorize(player);

        const playerName = player.mp.name || "Unknown Player";
        const playerIP = player.mp.ip || "Unknown IP";
        const IDb = user.character?.uid || "Unknown Game ID"; // Character UID from DB

		await sendDiscordLog({
			title: "📌 Player Login | Status",
			color: 3066993, // Light blue color
			description: `**${playerName}** s-a logat pe server.`,
			fields: [
				{ name: "**ADRESA IP**", value: `\`${playerIP}\``, inline: true },
				{ name: "**ID IC**", value: `\`${IDb}\``, inline: true }
			],
			footer: { text: "Loguri server | Empire", icon_url: "https://empirerp.ro/empirerp.png" },
			timestamp: new Date().toISOString()
		});
		
	    }
}

const login = new Login();
