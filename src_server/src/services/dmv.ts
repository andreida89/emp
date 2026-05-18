import money from 'helpers/money';
import playerInventory from 'player/inventory';
import inventoryHelper from 'basic/inventory/helper';
import Service from './service';
import CharModel from 'models/Character';
import licenses from 'player/licenses';

const EXAM_PRICE = 1000;

class DMV extends Service {
	constructor() {
		super('Permisboral', null, 0); 
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'DMV-StartExamRequest': this.startExamRequest.bind(this),
			'DMV-FinishExamResult': this.finishExamResult.bind(this)
		});
	}

	onKeyPress(player: Player) {
		if (player.hasLicense('car')) {
            return player.mp.call('AnuntNotification2', ['Ai deja permis de categoria B!', 'rosu']);
        }
        
        if (player.db.permisboral) {
            return player.mp.call('AnuntNotification2', ['Ai trecut deja proba scrisa! Mergi la proba practica.', 'rosu']);
        }

		player.callEvent('DMV-ShowMenu');
	}

	private async startExamRequest(player: Player, paymentType: string) {
		if (paymentType === 'cash') {
			const item = inventoryHelper.findItem(player.inventory, 'ron');
			if (!item || item.amount < EXAM_PRICE) {
                player.mp.call('AnuntNotification2', ['Nu ai destul cash (1000 RON)!', 'rosu']);
                return false;
            }
			await inventoryHelper.changeItemAmount(player.inventory, item, -EXAM_PRICE);
		} else if (paymentType === 'bank') {
			if (!player.money || player.money.bank < EXAM_PRICE) {
                player.mp.call('AnuntNotification2', ['Nu ai destui bani in banca (1000 RON)!', 'rosu']);
                return false;
            }
			await money.change(player, 'bank', -EXAM_PRICE, 'dmv_exam');
		} else {
			return false;
		}

		player.mp.call('AnuntNotification2', ['Mult succes la examen!', 'verde']);
		return true;
	}

	private async finishExamResult(player: Player, passed: boolean) {
		if (passed) {
			console.log("DMV Passed");
			player.permisboral = true;
			if (player.dbId) {
				await CharModel.updateOne({ _id: player.dbId }, { $set: { permisboral: true } });
				if (player.db) player.db.permisboral = true;
			}
			player.mp.call('AnuntNotification2', ['Felicitari! Ai trecut proba scrisa.', 'verde']);
		} else {
			player.mp.call('AnuntNotification2', ['Ai picat examenul! Poti incerca din nou dupa ce platesti taxa.', 'rosu']);
		}
	}
}

class DMVPractic extends Service {
	constructor() {
		super('Permisbpractic', null, 0); 
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'DMV-FinishPracticalExam': this.finishPracticalExam.bind(this)
		});
	}

	onKeyPress(player: Player) {
		if (player.hasLicense('car')) {
            return player.mp.call('AnuntNotification2', ['Ai deja permis de categoria B!', 'rosu']);
        }
        
        if (!player.permisboral && !player.db?.permisboral) {
            return player.mp.call('AnuntNotification2', ['Trebuie sa treci mai intai proba scrisa!', 'rosu']);
        }

        const spawn = SPAWN_LOCATIONS[Math.floor(Math.random() * SPAWN_LOCATIONS.length)];
        const vehicle = mp.vehicles.new(mp.joaat('blista'), new mp.Vector3(spawn.x, spawn.y, spawn.z), {
            heading: spawn.h,
            numberPlate: 'SCOALA',
            dimension: 0
        });

        vehicle.locked = false;
        vehicle.setVariable('locked', false);
        vehicle.setVariable('school_car', player.mp.id);
        vehicle.setVariable('maxHealth', 1000);
        vehicle.setVariable('fuel', { current: 100, max: 100 });
        
        // Initialize state for speedometer and sync
        vehicle.setVariable('state', {
            engine: false,
            locked: false,
            dirt: 0,
            health: { body: 1000, engine: 1000 },
            doors: [0, 0, 0, 0, 0, 0, 0, 0],
            indicators: { left: false, right: false },
            radioIndex: 255
        });
        
        // Fix ownership error
        if (player.dbId) {
            vehicle.owner = { player: player.dbId };
            vehicle.setVariable('owner', player.dbId);
        }
        
        // Bypasses the "Nu esti proprietarul masinii" check in toggleEngine
        (vehicle as any).isAdminVehicle = true; 

        player.examVehicle = vehicle;
        player.mp.dimension = 0;
        player.mp.putIntoVehicle(vehicle, 0);

		player.callEvent('DMV-StartPracticalExam');
	}

	private async finishPracticalExam(player: Player, passed: boolean) {
        if (player.examVehicle && mp.vehicles.exists(player.examVehicle)) {
            player.examVehicle.destroy();
            player.examVehicle = null;
        }
        player.mp.dimension = 0;
        player.tp({ x: -702.48, y: -1274.62, z: 5.25 }, 137);

		if (passed) {
			player.permisbpractic = true;
			if (player.dbId) {
                await licenses.give(player, 'car');
                await playerInventory.addItem(player, { name: 'permisb', amount: 1 });
				await CharModel.updateOne({ _id: player.dbId }, { $set: { permisbpractic: true, permisb: true } });
				if (player.db) {
					player.db.permisbpractic = true;
					player.db.permisb = true;
				}
			}
			player.mp.call('AnuntNotification2', ['Felicitari! Ai promovat proba practica si ai obtinut permisul de categoria B.', 'verde']);
		} else {
			player.mp.call('AnuntNotification2', ['Ai picat proba practica! Revino cand esti mai pregatit.', 'rosu']);
		}
	}
}

const SPAWN_LOCATIONS = [
    { x: -705.01, y: -1278.11, z: 5.00, h: 137.9801 },
    { x: -707.58, y: -1276.04, z: 5.00, h: 137.9801 },
    { x: -709.84, y: -1273.82, z: 5.00, h: 137.9 }
];

const service = new DMV();
const practic = new DMVPractic();
export default service;
