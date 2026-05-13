import { trim, capitalize } from 'lodash';
import { encrypt } from 'utils/encryption';
import UserModel from 'models/User';
import CharModel from 'models/Character';
import referral from 'awards/referral';
import token from './token';

type UserData = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	age: number;
	code: string;
};

class Register {
	constructor() {
		mp.events.subscribe(
			{
				'Auth-SignUp': this.createAccount.bind(this),
				'Auth-GetRegisterCode': this.sendCode
			},
			false
		);
	}

	private async createAccount({ mp: player }: Player, data: UserData) {
		const error = await this.checkData(player, player.socialClub, data);

		if (error) return Promise.reject(error);

		const { email, password, ...characterData } = await this.prepareData(data);

		const character = await CharModel.create({ ...characterData, money: { cash: 4500 } });
		const user = await UserModel.create({
			email,
			password,
			socialName: player.socialClub,
			ip: [player.ip],
			serial: player.serial,
			character: character._id
		});
		await referral.createCode(user._id);
	}

	async sendCode(player: Player, email: string) {
		const user = await UserModel.findOne({ email }).countDocuments();
		if (user) throw new SilentError('email is already exists');

		token.create('register', email);
	}

	private async checkData(
		playerMp: PlayerMp,
		socialName: string,
		data: UserData
	): Promise<{ field: string; message: string }> {
		const BanLog = require('../models/BanLog').default;
		const moment = require('moment');
		const bannedSerial = await BanLog.findOne({ 
			bannedSerial: playerMp.serial
		}).sort({ createdAt: -1 });

		if (bannedSerial) {
             let stillBanned = false;
             if (bannedSerial.isPermanent) stillBanned = true;
             else {
                 const origUser = await UserModel.findOne({ serial: playerMp.serial }).lean();
                 if (origUser && origUser.ban && (origUser.ban.permanent || moment().diff(origUser.ban.expires, 'minutes') < 0)) {
                     stillBanned = true;
                 }
             }
             if (stillBanned) return { field: 'email', message: 'Serial blocked (banned)' };
		}

		const user = await UserModel.findOne({
			$or: [{ socialName }, { email: data.email }]
		})
			.select({ email: 1, socialName: 1 })
			.lean();

		if (user?.socialName === socialName)
			return {
				field: 'email',
				message: 'Aveti deja un cont'
			};

		if (user?.email === data.email)
			return {
				field: 'email',
				message: 'E-mail folosit deja'
			};

		const characterExists = await CharModel.findOne({
			firstName: data.firstName,
			lastName: data.lastName
		}).countDocuments();

		if (characterExists)
			return {
				field: 'lastName',
				message: 'Aceasta combinatie de nume si prenume este deja folosita'
			};

		const isValidCode = await token.isValid(data.email, 'register', data.code);

		if (!isValidCode)
			return {
				field: 'code',
				message: 'Cod incorect'
			};
	}

	private async prepareData(data: UserData) {
		const email = trim(data.email).toLowerCase();
		const password = await encrypt(trim(data.password));
		const firstName = capitalize(trim(data.firstName));
		const lastName = capitalize(trim(data.lastName));
		const age = data.age || 25;

		return {
			email,
			password,
			firstName,
			lastName,
			age
		};
	}
}

const register = new Register();
