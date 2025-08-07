import tasks from 'awards/tasks';
import Job from '../job';
import Salata from './salata';
import Morcovi from './morcovi';
import Cartofi from './cartofi';

class Culegatorlegume extends Job {
	constructor() {
		super(
			'Culegatorlegume',
			[85, 385, 480],
			{ x: 413.25,  y: 6541.96, z: 27.65 }, 
			{ name: 'Culegator de Legume', model: 1, color: 2 }
		);
	}

	async addSkillPoints(player: Player) {
		await super.addSkillPoints(player);
	//	await tasks.implement(player, 'culegatorlegume_money');
	}

	protected getBranchOfLevel(level: number) {
		switch (level) {
			case 0:
				return Salata;
			case 1:
				return Morcovi;
			case 2:
				return Cartofi;

			default:
				return Salata;
		}
	}
}

const job = new Culegatorlegume();

job.addBranch(Salata);
job.addBranch(Morcovi);
job.addBranch(Cartofi);
