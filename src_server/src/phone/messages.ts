import rpc from 'rage-rpc';
import CharModel from 'models/Character';
import { SilentError } from 'utils/errors';

class PhoneMessages {
	constructor() {
		this.subscribeToEvents();
	}

	private async sendMessage(player: Player, data: { num: string; text: string }) {
		const targetNumber = data.num;
		const text = data.text;
		if (!player || !player.phone || !player.phone.number) {
			throw { err: { msg: 'Nu ai un telefon sau numar de telefon' } };
		}

		if (player.phone.number === targetNumber) {
			throw { err: { msg: 'Nu-ti poti trimite mesaje tie insuti' } };
		}
		
		const date = Date.now();
		// Sender message is already read
		const senderMsg = { phone: targetNumber, text, type: 'outgoing' as const, date, read: true };

		let targetPlayer: Player | undefined;
		const players = mp.players.toCustomArray();
		targetPlayer = players.find(p => p.phone && p.phone.number === targetNumber);

		if (targetPlayer && mp.players.exists(targetPlayer.mp)) {
			// Player is online
			if (targetPlayer.phone.blacklist && targetPlayer.phone.blacklist.includes(player.phone.number)) {
				throw { err: { msg: 'Acest utilizator te-a blocat' } };
			}
			
			// Receiver message is unread
			const receiverMsg = { phone: player.phone.number, text, type: 'incoming' as const, date, read: false };
			await CharModel.findByIdAndUpdate(targetPlayer.dbId, { $push: { 'phone.messages': receiverMsg } });
			
			if (!targetPlayer.phone.messages) targetPlayer.phone.messages = [];
			targetPlayer.phone.messages.push(receiverMsg);

			// Emit event to target
			targetPlayer.mp.call('Phone-ReceiveMessage', [receiverMsg]);
			targetPlayer.mp.call('HUD-NotifyComponent', ['Ai primit un mesaj nou!', 'success']);
		} else {
			// Player is offline, let's query DB
			const targetChar = await CharModel.findOne({ 'phone.number': targetNumber }).select('phone _id').exec();
			if (!targetChar) {
				throw { err: { msg: 'Abonatul nu a fost gasit sau este indisponibil' } };
			}
			
			// Check if blocked
			if (targetChar.phone && targetChar.phone.blacklist && targetChar.phone.blacklist.includes(player.phone.number)) {
				throw { err: { msg: 'Acest utilizator te-a blocat' } };
			}
			
			// Save for receiver offline
			const receiverMsg = { phone: player.phone.number, text, type: 'incoming' as const, date, read: false };
			await CharModel.findByIdAndUpdate(targetChar._id, { $push: { 'phone.messages': receiverMsg } });
		}

		// Save for sender
		await CharModel.findByIdAndUpdate(player.dbId, { $push: { 'phone.messages': senderMsg } });
		if (!player.phone.messages) player.phone.messages = [];
		player.phone.messages.push(senderMsg);

		return senderMsg;
	}

	private async sendLocation(player: Player, targetNumber: string) {
		const { x, y, z } = player.mp.position;
		const text = `[Locatie GPS] ${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
		return this.sendMessage(player, { num: targetNumber, text });
	}

	private async markAsRead(player: Player, targetNumber: string) {
		if (!player.phone || !player.phone.messages) return;
		
		let updated = false;
		player.phone.messages.forEach(msg => {
			if (msg.phone === targetNumber && msg.type === 'incoming' && !msg.read) {
				msg.read = true;
				updated = true;
			}
		});

		if (updated) {
			// Update DB: Set all messages from this sender to read
			await CharModel.updateOne(
				{ _id: player.dbId },
				{ $set: { 'phone.messages.$[elem].read': true } },
				{ arrayFilters: [{ 'elem.phone': targetNumber, 'elem.type': 'incoming' }] }
			);
		}
	}

	private async getMessages(player: Player) {
		return player.phone.messages || [];
	}

	private subscribeToEvents() {
		mp.events.subscribe({
			'Phone-SendMessage': this.sendMessage.bind(this),
			'Phone-SendLocation': this.sendLocation.bind(this),
			'Phone-GetMessages': this.getMessages.bind(this),
			'Phone-MarkAsRead': this.markAsRead.bind(this)
		});
	}
}

export default new PhoneMessages();
