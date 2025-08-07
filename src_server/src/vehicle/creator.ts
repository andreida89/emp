import cryptoRandomString from 'crypto-random-string';
import VehicleModel from 'models/Vehicle';
import Builder from './builder';
import vehicleState from './state';
import { Tuning } from './tuning';

class VehicleCreator {
async buildForPlayer(player: Player, builder: Builder) {
    const govNumber = await this.generateNumber();

    builder.setNumberPlate(govNumber);
    builder.setOwner(player.dbId);

    const vehicle = builder.build();
    const fuel = vehicle.getVariable('fuel');
    const tuning = vehicle.getVariable('tuning');

    const doc = await VehicleModel.create({
        name: vehicle.name,
        owner: player.dbId,
        fuel: fuel.current,
        govNumber,
        tuning
    });

    mp.vehicles.authorize(vehicle, doc._id);
    player.vehicles.push(vehicle.dbId);

    return vehicle;
}


	buildTemporary(
		model: string,
		position: PositionEx,
		heading = 90,
		owner?: VehicleOwner,
		tuning?: Partial<Tuning>
	) {
		const builder = new Builder(model, position, heading);

		builder.setNumberPlate('EMPIRE');
		builder.installTuning(tuning);
		if (owner) builder.setOwner(owner.player, owner.faction);

		return builder.build();
	}

spawnForPlayer(player: Player, position: PositionEx, data: VehicleModel) {
    const builder = new Builder(data.name, position, 90);

    builder.setNumberPlate(data.govNumber);
    builder.installTuning(data.tuning);
    builder.setOwner(player.dbId);

    const vehicle = builder.build();

    // Setezi inventory, mileage
    vehicle.inventory = data.inventory;
    vehicle.mileage = typeof data.mileage !== 'undefined' ? data.mileage : 0;
    vehicle.setVariable('fuel', {
        ...vehicle.getVariable('fuel'),
        current: data.fuel
    });

    // FORCEAZĂ atât engine cât și locked la false!
    vehicleState.update(vehicle, { ...data.state, engine: false, locked: false });

    // Setezi engine și locked la false, redundant (siguranță pe entity)
    vehicle.engine = false;
    vehicle.locked = false;

    // Opțional - client engine off
    if (vehicle.getOccupant && vehicle.getOccupant(0)) {
        vehicle.getOccupant(0).call('ForceEngineOff', [vehicle.id]);
    }

    // Opțional - update și în DB
    if (vehicle.dbId) {
        VehicleModel.updateOne(
            { _id: vehicle.dbId },
            { 'state.engine': false, 'state.locked': false }
        ).exec();
    }

    mp.vehicles.authorize(vehicle, data._id);

    return vehicle;
}





	private async generateNumber(): Promise<string> {
		let number: string;
	
		do {
			// Generate a 2-digit number (00-99)
			const randomDigits = String(Math.floor(Math.random() * 100)).padStart(2, '0');
	
			// Generate a 3-letter uppercase string (since 'crypto-random-string' doesn't support alphabetic type)
			const randomLetters = cryptoRandomString({ length: 3, characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' });
	
			// Final plate format: "LS 01 ABC"
			const plate = `LS${randomDigits}${randomLetters}`;
	
			// Check if the plate already exists in the database
			const isExists = await VehicleModel.countDocuments({ govNumber: plate });
	
			if (!isExists) number = plate;
		} while (!number);
	
		return number;
	}
	
	
}

export { Builder };
export default new VehicleCreator();
