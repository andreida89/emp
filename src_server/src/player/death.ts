import { sortBy } from 'lodash';
import { finishWork } from 'jobs';
import animations from 'helpers/animations';
import prison from 'basic/prison';
import hospitals from 'data/hospitals.json';
import ems from 'factions/ems';
import emsCalls from 'factions/ems/calls';
import cuffsActions from 'factions/actions/cuffs';
import bagActions from 'factions/actions/bag';
import hunger from './hunger';
import thirst from './thirst';
import inventory from './inventory';

class PlayerDeath {
	private deathTimeout: number;

	constructor() {
		this.deathTimeout = 10 * 60 * 1000;

		mp.events.subscribeToDefault({ playerDeath: this.onDeath.bind(this) });

		mp.events.subscribe({
			'Player-Die': this.death.bind(this),
			'Player-DieEvent': this.deathevent.bind(this)
		});
	}

	ressurect(player: Player) {
		emsCalls.cancelCall(player.dbId);

		player.dead = false;
		player.mp.health = 50;
		animations.stopOnServer(player.mp);
	}

	revive(player: Player) {
		console.log(`Am primit cererea pentru ${player.name}`); // Corrected logging
	
		try {
			emsCalls.cancelCall(player.dbId);
	
			player.dead = false;
			player.mp.health = 100;
			animations.stopOnServer(player.mp);
			console.log(`Am dat revive lui ID ${player.dbId}`); // Corrected logging
		} catch (error) {
			console.error(`Eroare la revive: ${error.message}`);
		}
	}

	

	private async onDeath(player: Player) {
		const { mp } = player;

		//if (player.dead || mp.dimension > 0 || prison.isImprisoned(player)) {
		//	return this.death(player);
		//}
		if (player.dead || prison.isImprisoned(player) || (mp.dimension > 0 && mp.dimension !== 2)) {
			return this.death(player);
		}

		if (mp.dimension === 2) {
			return this.onDeathEvent(player);
			console.log("ACUM PLEACA SI onDeathEvent");
		}

		bagActions.reset(player);

		mp.spawn(mp.position);
		mp.health = 100;

		animations.stopScenario(player);
		animations.playOnServer(mp, 'dead');

		await player.callEvent(
			'Player-ShowDeathMenu',
			[this.deathTimeout, ems.getPlayers(true).length],
			true
		);

		player.dead = true;
	}


	private async onDeathEvent(player: Player) {
		const { mp } = player;
		bagActions.reset(player);

		mp.spawn(mp.position);
		mp.health = 100;

		animations.stopScenario(player);
		animations.playOnServer(mp, 'dead');

console.log("AM AJUNS PANA LA onDeathEvent");

		await player.callEvent(
			'Player-ShowDeathMenuEvent',
			[this.deathTimeout, ems.getPlayers(true).length],
			true
		);

		player.dead = true;
	}


	private async death(player: Player) {
		cuffsActions.reset(player);

		finishWork(player);
		await inventory.clear(player);
		hunger.reset(player);
		thirst.reset(player);

		this.ressurect(player);
		this.respawn(player);

		player.mp.health = 20;
	}

	private async deathevent(player: Player) {
		cuffsActions.reset(player);

		finishWork(player);
		//await inventory.clear(player);
		hunger.reset(player);
		thirst.reset(player);

		this.ressurect(player);
		this.revive(player);

		player.mp.health = 100;
		console.log("AM AJUNS PANA LA deathEvent");
	}
	
	private respawn(player: Player) {
		const hospital = this.getClosestHospital(player.mp);

		player.mp.spawn(new mp.Vector3(hospital.x, hospital.y, hospital.z));
		player.mp.dimension = 0;

		if (prison.isImprisoned(player)) prison.putToRandomCell(player);
	}

	rspwn(player: Player) {
	
		try {
			cuffsActions.reset(player);
			finishWork(player);
			emsCalls.cancelCall(player.dbId);
			hunger.reset(player);
			thirst.reset(player);	
			player.dead = false;
			player.mp.health = 100;
			animations.stopOnServer(player.mp);
			const hospital = this.getClosestHospital(player.mp);	
			player.mp.spawn(new mp.Vector3(hospital.x, hospital.y, hospital.z));
			player.mp.dimension = 0;	
			if (prison.isImprisoned(player)) {
				prison.putToRandomCell(player);
			}
		
		} catch (error) {
		}
	}
	

	private getClosestHospital(player: PlayerMp) {
		return sortBy(hospitals, ({ x, y, z }) => player.dist(new mp.Vector3(x, y, z)))[0];
	}
}

export default new PlayerDeath();
