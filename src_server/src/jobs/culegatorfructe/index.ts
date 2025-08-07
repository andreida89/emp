import tasks from 'awards/tasks';
import Job from '../job';
import Mere from './mere';
import Prune from './prune';
import Afine from './afine';

class Culegatorfructe extends Job {
	constructor() {
		super(
			'Culegatorfructe',
			[85, 385, 480],
			{ x: 2564.24, y: 4680.42, z: 34.08 },
			{ name: 'Culegator de Fructe', model: 1, color: 5 }
		);
	}

	async addSkillPoints(player: Player) {
		await super.addSkillPoints(player);
	}

	protected getBranchOfLevel(level: number) {
		switch (level) {
			case 0:
				return Mere;
			case 1:
				return Prune;
			case 2:
				return Afine;

			default:
				return Mere;
		}
	}
}

const job = new Culegatorfructe();

job.addBranch(Mere);
job.addBranch(Prune);
job.addBranch(Afine);
