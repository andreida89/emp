import house from 'house/entities';
import houseOwning from 'house/owning';
import houseBuilding from 'house/building';
import prison from 'basic/prison';
import factions from 'factions';

const startPosition = {
	x: -1032.353,
	y: -2731.16,
	z: 13.757
};

class Spawn {
	constructor() {
		mp.events.subscribe({
			'Spawn-ShowMenu': this.showMenu.bind(this),
			'Spawn-SelectType': this.selectType.bind(this),
			'Spawn-ToStart': this.toStart
		});
	}

	toStart(player: Player) {
		player.tp(startPosition, 88.233);
	}

	private toHouse(player: Player, index: number) {
		const data = house.getItem(player, index);

		if (houseOwning.isOwner(player, data.owner)) {
			player.tp(houseBuilding.getExitPosition(data), 90, data.dimension);
		}
	}

	private toFaction(player: Player) {
		const faction = factions.getCoords(player.faction);

		if (faction?.spawn) player.tp(faction.spawn);
	}

	private selectType(player: Player, type: 'start' | 'house' | 'org', data: any) {
		if (player.mp.getVariable('isJailed')) return;

		switch (type) {
			case 'start':
				this.toStart(player);
				break;
			case 'house':
				this.toHouse(player, data);
				break;
			case 'org':
				this.toFaction(player);
				break;

			default:
				player.togglePrivateDimension();
				break;
		}

		if ( prison.isImprisoned( player ) ) prison.putToRandomCell( player );

		player.mp.call( 'playerSelectSpawn' );

		if ( player.dead ) {
			const playerDeath = require( './death' ).default;
			const remainingTime = (player.deathExpiresAt !== undefined && player.deathExpiresAt !== null) 
				? Math.max( 0, player.deathExpiresAt - Date.now() ) 
				: undefined;
			playerDeath.triggerDeath( player, remainingTime ).catch( console.error );
		} else {
			player.callEvent('Browser-HidePage');
		}
	}

	private showMenu(player: Player) {
		if (player.mp.getVariable('isJailed')) {
			player.callEvent('Browser-HidePage');
			return;
		}

		player.callEvent('Spawn-ShowMenu', [
			prison.isImprisoned(player),
			player.houses,
			player.faction
		]);
	}
}

export default new Spawn();
