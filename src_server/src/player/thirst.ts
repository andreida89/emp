import hud from 'helpers/hud';
import animations from 'helpers/animations';
import prison from 'basic/prison';
import inventory from 'basic/inventory/helper';
import actions from './actions';

class Thirst {
	drink(player: Player, water: InventoryItem) {
		actions.checkActionTimeout(player);

		const { thirst } = inventory.getItemData(water.name);
		const current = player.thirst + thirst <= 100 ? player.thirst + thirst : 100;

		this.updateForPlayer(player, current);

		water.amount -= 1;
		animations.setScenario(player, `drink_${water.name}`, true);
		actions.setActionTimeout(player, 6500);
	}

	decrease(player: Player) {
		if (prison.isImprisoned(player) || player.mp.getVariable('AGM') || player.mp.getVariable('isJailed')) return;

		if (player.thirst > 0) this.updateForPlayer(player, player.thirst - 0.5);
		else player.mp.health -= 5;
	}

	reset(player: Player) {
		player.mp.health = 100;

		this.updateForPlayer(player, 100);
	}

	updateForPlayer(player: Player, thirst: number) {
		player.thirst = thirst;

		hud.showThirst(player.mp, thirst);
	}
}

export default new Thirst();
