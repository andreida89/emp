import points from 'helpers/points';
import playerClothes, { ClothesName } from 'player/clothes';
import playerInventory from 'player/inventory';
import factions from 'factions';
import Faction from 'factions/faction';
import Wardrobe from './wardrobepolitie';
import hud from 'helpers/hud';

type Product = {
	type: ClothesName;
	index: number;
	color: number;
};

class WardrobeCtrl {
	constructor() {
		mp.events.subscribe({
			'FactionWardrobe-GetClothes': this.getClothes,
			'FactionWardrobe-WearItem': this.wearItem,
			'FactionWardrobe-Exit': this.onExit
		});
	}

	create(position: PositionEx, wardrobe: Wardrobe, faction: Faction) {
		const point = points.create(
			position,
			1,
			{ onKeyPress: wardrobe.showMenu },
			{ color: [24, 132, 219, 100] }
		);

		faction.points.add(point);
		faction.wardrobe = wardrobe;

		return wardrobe;
	}

	private getClothes(player: Player, type: ClothesName) {
		const faction = factions.getFaction(player.faction);
		if (faction?.wardrobe) {
			return faction.wardrobe.getClothesByType(player, type);
		}
	}

	private wearItem(player: Player, type: ClothesName, item: number, prevItem?: number) {
		const faction = factions.getFaction(player.faction);
		if (faction?.wardrobe) {
			faction.wardrobe.useClothesItem(player, { type, index: item }, prevItem);
		}
	}

	private onExit(player: Player) {
		const faction = factions.getFaction(player.faction);
		if (!faction || !faction.isAlreadyAtWork(player)) {
			playerClothes.load(player);
		}
		player.togglePrivateDimension();
	}
}

mp.events.subscribe({
	'FactionWardrobe-BuyFreePolitie': (player: Player, product: Product) => {
		const faction = factions.getFaction(player.faction);
		if (!faction || !faction.wardrobe) return;

		const clothes = faction.wardrobe.getClothesOfGender?.(player);

		// DEBUG LOGS
		//console.log(`[DEBUG][BuyFree] product.type:`, product.type);
		//console.log(`[DEBUG][BuyFree] product.index:`, product.index);
		//console.log(`[DEBUG][BuyFree] clothes[${product.type}]:`, JSON.stringify(clothes?.[product.type]));
		//console.log(`[DEBUG][BuyFree] clothes[${product.type}][${product.index}]:`, JSON.stringify(clothes?.[product.type]?.[product.index]));

		if (!clothes || !clothes[product.type] || !clothes[product.type][product.index]) {
			//console.log(`[DEBUG][BuyFree] ERROR: No clothes found for given type/index!`);
			return;
		}

		const selected = clothes[product.type][product.index];
		const [style, color] = selected;

		const item = {
			name: product.type,
			amount: 1,
			data: {
				style,  // din wardrobe!
				color   // din wardrobe!
			}
		};

		//console.log(`[DEBUG][BuyFree] Final item to add:`, JSON.stringify(item));

		playerInventory.checkEnoughSlots(player, [item]);
		playerInventory.addItem(player, item);
		hud.showNotification(player, 'error', 'Articol adaugat in geanta', true);
	}
});



export { Wardrobe };
export default new WardrobeCtrl();
