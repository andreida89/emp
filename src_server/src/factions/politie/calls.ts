import cryptoRandomString from 'crypto-random-string';
import factions from 'factions';
import hud from 'helpers/hud';
import blips from 'helpers/blips';

type Call = {
	message: string;
	position: Vector3Mp;
	vehicle?: VehicleMp;
	createdAt: string;
};

class PolitieCalls {
	private calls: Map<string, Call>;

	constructor() {
		this.calls = new Map();

		mp.events.subscribe({
			'PolitieCalls-GetList': this.getCallsList.bind(this),
			'PolitieCalls-MarkPosition': this.markPosition.bind(this)
		});
	}

	deleteCall(id: string) {
		this.calls.delete(id);
	}

	createCall(message: string, position: Vector3Mp, vehicle?: VehicleMp) {
		const id = vehicle ? vehicle.id.toString() : cryptoRandomString({ length: 10 });
		if (this.calls.has(id)) return;

		this.calls.set(id, {
			message,
			position,
			vehicle,
			createdAt: new Date().toISOString()
		});

		this.notifyMembers('A fost primit un nou apel, mergeti cat mai repede!');
	}

	private getCall(id: string) {
		return this.calls.get(id);
	}

	private getCallsList() {
		return Array.from(this.calls.entries()).map(([id, { createdAt, message }]) => ({
			id,
			message,
			createdAt
		}));
	}

	private markPosition(player: Player, callId: string) {
		const call = this.getCall(callId);
		if (!call) throw new SilentError("call doesn't exists");

		const { position } = mp.vehicles.exists(call.vehicle) ? call.vehicle : call;
		blips.setWaypoint(player.mp, position);
	}

	private notifyMembers(message: string) {
		const politie = factions.getFaction('politie');

		politie
			.getPlayers(true)
			.forEach((member) => hud.showNotification(member, 'info', message));
	}
}

export default new PolitieCalls();
