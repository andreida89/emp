import { sortBy } from 'lodash';
import { finishWork } from 'jobs';
import CharModel from 'models/Character';
import animations from 'helpers/animations';
import prison from 'basic/prison';
import hospitals from 'data/hospitals.json';
import umu from 'factions/umu';
import umuCalls from 'factions/umu/calls';
import cuffsActions from 'factions/actions/cuffs';
import bagActions from 'factions/actions/bag';
import hunger from './hunger';
import thirst from './thirst';
import inventory from './inventory';

class PlayerDeath {
	private deathTimeout: number;

	constructor() {
		this.deathTimeout = 30 * 60 * 1000;

		mp.events.subscribeToDefault({ playerDeath: this.onDeath.bind(this) });

		mp.events.subscribe({
			'Player-Die': this.death.bind(this),
			'Player-DieEvent': this.deathevent.bind(this)
		});
	}

	ressurect(player: Player) {
		umuCalls.cancelCall(player.dbId);

		player.dead = false;
		player.deathExpiresAt = undefined;
		player.mp.setVariable('deathMenuOpened', false);
		player.mp.health = 50;
		animations.stopOnServer(player.mp);

		CharModel.findByIdAndUpdate(player.dbId, { 
			$set: { deathExpiresAt: undefined, health: 50 } 
		}).exec().catch(() => {});
	}

	revive(player: Player) {
		console.log(`Am primit cererea pentru ${player.name}`); // Corrected logging
	
		try {
			umuCalls.cancelCall(player.dbId);
	
			player.dead = false;
			player.deathExpiresAt = undefined;
			player.mp.setVariable('deathMenuOpened', false);
			player.mp.health = 100;
			animations.stopOnServer(player.mp);
			console.log(`Am dat revive lui ID ${player.dbId}`); // Corrected logging

			CharModel.findByIdAndUpdate(player.dbId, { 
				$set: { deathExpiresAt: undefined, health: 100 } 
			}).exec().catch(() => {});
		} catch (error) {
			console.error(`Eroare la revive: ${error.message}`);
		}
	}

	

	async triggerDeath(player: Player, remainingTime?: number) {
		const { mp } = player;
		player.dead = true;
		mp.setVariable('deathMenuOpened', true);
		bagActions.reset(player);

		mp.spawn(mp.position);
		mp.health = 100;

		animations.stopScenario(player);
		animations.playOnServer(mp, 'dead');

		const time = remainingTime !== undefined ? remainingTime : this.deathTimeout;
		if (time > 0) {
			player.deathExpiresAt = Date.now() + time;
		}

		CharModel.findByIdAndUpdate(player.dbId, { 
			$set: { deathExpiresAt: player.deathExpiresAt, health: 0 } 
		}).exec().catch((err) => console.error(`[Death] DB Update error: ${err.message}`));

		await player.callEvent(
			'Player-ShowDeathMenu',
			[time, umu.getPlayers(true).length],
			true
		);
	}

	private async onDeath(player: Player) {
		const { mp } = player;

		if (player.admin_duty) {
			bagActions.reset(player);
			cuffsActions.reset(player);
			mp.spawn(mp.position);
			this.revive(player);
			return;
		}

		if (mp.dimension === 10000) {
			bagActions.reset(player);
			cuffsActions.reset(player);
			mp.spawn(mp.position);
			this.revive(player);
			return;
		}

		if (player.dead || prison.isImprisoned(player) || (mp.dimension > 0 && mp.dimension !== 2)) {
			return this.death(player);
		}

		if (mp.dimension === 2) {
			return this.onDeathEvent(player);
			console.log("ACUM PLEACA SI onDeathEvent");
		}

		return this.triggerDeath(player);
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
			[this.deathTimeout, umu.getPlayers(true).length],
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

		if (prison.isImprisoned(player)) {
			prison.putToRandomCell(player);
		} else if (player.adminJail || player.mp.getVariable('isJailed')) {
			player.mp.dimension = 10000;
			player.mp.position = new mp.Vector3(3080.15, -4776.47, 6.08);
		}
	}

	rspwn(player: Player) {
	
		try {
			cuffsActions.reset(player);
			finishWork(player);
			umuCalls.cancelCall(player.dbId);
			hunger.reset(player);
			thirst.reset(player);	
			player.dead = false;
			player.deathExpiresAt = undefined;
			player.mp.setVariable('deathMenuOpened', false);
			player.mp.health = 100;
			animations.stopOnServer(player.mp);
			const hospital = this.getClosestHospital(player.mp);	
			player.mp.spawn(new mp.Vector3(hospital.x, hospital.y, hospital.z));
			player.mp.dimension = 0;	
			if (prison.isImprisoned(player)) {
				prison.putToRandomCell(player);
			}

			CharModel.findByIdAndUpdate(player.dbId, { 
				$set: { deathExpiresAt: undefined, health: 100 } 
			}).exec().catch(() => {});
		
		} catch (error) {
		}
	}
	

	private getClosestHospital(player: PlayerMp) {
		return sortBy(hospitals, ({ x, y, z }) => player.dist(new mp.Vector3(x, y, z)))[0];
	}
}

export default new PlayerDeath();
