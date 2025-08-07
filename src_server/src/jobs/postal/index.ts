import tasks from 'awards/tasks';
import Job from '../job';
import Courier from './courier';
import Warehouse from './warehouse';
import Driver from './driver';

class Postal extends Job {
	constructor() {
		super(
			'Postal',
			[120, 340, 420],
			{ x: -259.075, y: -842.88, z: 31.424 },
			{ name: 'Job Postas', model: 478, color: 29 }
		);
	}

	async startWork(player: Player, level: number) {
		if (player.level < 2) {
			return mp.events.reject('Este necesar nivelul 2 in joc');
		}
		if (!player.hasLicense('car')) {
			return mp.events.reject('Acest job necesita Permis categoria B');
		}

		await super.startWork(player, level);
	}

	async addSkillPoints(player: Player) {
		await super.addSkillPoints(player);
		await tasks.implement(player, 'postal_delivery');
	}

	protected getBranchOfLevel(level: number) {
		switch (level) {
			case 0:
				return Courier;
			case 1:
				return Driver;
			case 2:
				return Warehouse;

			default:
				return Driver;
		}
	}
}

const job = new Postal();

job.addBranch(Courier);
job.addBranch(Driver);
job.addBranch(Warehouse);
