import { isNumber } from 'lodash';
import inventoryHelper from 'basic/inventory/helper';
import playerInventory from 'player/inventory';

export type Products = { [name: string]: number };

class FactionWorkshop {
	private prices: Products;

	constructor(products: Products) {
		this.prices = products;
	}

	showMenu(player: Player) {
		player.callEvent('FactionWorkshop-ShowMenu', [this.prices]);
	}

	async craftItem(player: Player, name: string, amount: number) {
		this.getPrice(name, amount);

		const item = this.getItem(name, amount);

		playerInventory.checkEnoughSlots(player, [item]);

		await playerInventory.addItem(player, item);
	}

	private getItem(name: string, amount: number) {
		const faction = player?.faction ?? null;
		const type = inventoryHelper.getItemData(name)?.type;

		return type === 'armor'
			? this.getArmorItem(name)
			: { name, amount, data: { faction } };
	}

	private getArmorItem(name: string) {
		const health = inventoryHelper.getItemData(name)?.capacity ?? 100;

		return {
			name,
			amount: 1,
			data: { health, color: 0 }
		};
	}

	private getPrice(product: string, amount: number) {
		if (
			!this.prices[product] ||
			!isNumber(amount) ||
			amount <= 0 ||
			amount > 10000
		) {
			throw new SilentError('wrong product');
		}

		return this.prices[product] * amount;
	}
}

export default FactionWorkshop;