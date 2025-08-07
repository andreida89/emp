import { isNumber } from 'lodash';

type Clothes = {
	[name: string]: number[][];
};

const localPlayer = mp.players.local;

const components = {
	tops: 11,           // alltops.json
	pants: 4,           // allpantaloni.json
	shoes: 6,           // allincaltaminte.json
	masks: 1,            // allmasks.json
	accessories: 7,     // allaccesorii.json
	tasks: 9,           // alias pt armor
	torso: 3,           // alltorso.json
	undershirts: 8,      // allundershirt.json
	bag: 5

};

const props = {
	hats: 0,             // allhats.json
	glasses: 1,         // allglasses.json
	ears: 2,            // allears.json
	watches: 6,           // allceasuri.json
	bracelets: 7         // allbratari.json
};


const camPositions: {
	[name: string]: { angle: number; dist: number; height: number };
} = {
	hats: { angle: 0, dist: 0.7, height: 0.8 },
	tops: { angle: 0, dist: 1.1, height: 0.3 },
	pants: { angle: 0, dist: 1.2, height: -0.4 },
	shoes: { angle: 0, dist: 0.7, height: -0.7 },
	glasses: { angle: 0, dist: 0.7, height: 0.6 },
	masks: { angle: 0, dist: 0.7, height: 0.6 },
	accessories: { angle: 0, dist: 1, height: 0.3 },
	watches: { angle: 74, dist: 1, height: 0 },
	bracelets: { angle: 74, dist: 1, height: 0 },
	ears: { angle: 0, dist: 0.8, height: 0.6 },
	tasks: { angle: 0, dist: 1.1, height: 0.3 },
	torso: { angle: 0, dist: 1.1, height: 0.4 },
	undershirts: { angle: 0, dist: 1.1, height: 0.2 },
	bag: { angle: 180, dist: 1.3, height: 0.4 }
};


class ClothingShop {
	private type = 'hats';

	private item = 0;

	private clothes: Clothes = {};

	constructor() {
		mp.events.subscribe({
			'ClothingShop-ShowMenu': this.showMenu.bind(this),
			'ClothingShop-CloseMenu': this.closeMenu.bind(this),
			'ClothingShop-ChangeType': this.changeType.bind(this),
			'ClothingShop-ChangeItem': this.setItem.bind(this)
		});
	}

	private showMenu() {
		mp.browsers.showPage('clothing_shop', null, true, true);
	}

	private async closeMenu() {
		await mp.events.callServer('ClothingShop-Exit');

		mp.cameras.reset();
		this.clothes = {};

		mp.browsers.hidePage();
	}

/**	private async getClothesByType(type: string) {
		if (this.clothes[type]) return;

		const items = await mp.events.callServer('ClothingShop-GetClothes', type);

		this.clothes[type] = items;
	}
**/

private async getClothesByType(type: string) {
	if (this.clothes[type]) return;

	const items = await mp.events.callServer('ClothingShop-GetClothes', type);

	if (!Array.isArray(items) || items.length === 0) {
		console.warn(`[ClothingShop] Nicio piesa de tip '${type}' nu a fost gasita.`);
		this.clothes[type] = []; // prevenim crash
		return;
	}

	this.clothes[type] = items;
}

	private updateClothesData() {
		mp.events.callBrowser('ClothingShop-SetData', {
			price: this.getPriceOfItem(),
			colors: this.getColorsAmount()
		});
	}

	private async setItem(item: number, color: number, next = false, initial = false) {
		this.item = item;

		const style = this.getStyleOfItem();

		await mp.events.callServer('ClothingShop-SetItem', [
			this.type,
			{ style, color },
			initial
		]);

		if (next) this.updateClothesData();
	}

/**	private async changeType(type: string) {
		this.type = type;

		await this.getClothesByType(type);

		this.setItem(0, 0, true, true);
		this.switchCamera();

		return this.clothes[type].length;
	}
**/
private async changeType(type: string) {
	this.type = type;

	await this.getClothesByType(type);

	if (!this.clothes[type] || this.clothes[type].length === 0) {
		mp.events.callBrowser('ClothingShop-SetData', {
			price: 0,
			colors: 0
		});
		return 0; // exit early
	}

	this.setItem(0, 0, true, true);
	this.switchCamera();

	return this.clothes[type].length;
}

	private getColorsAmount() {
		const style = this.getStyleOfItem();

		return isNumber(components[this.type])
			? localPlayer.getNumberOfTextureVariations(components[this.type], style)
			: localPlayer.getNumberOfPropTextureVariations(props[this.type], style);
	}

	private getPriceOfItem() {
		return this.clothes[this.type][this.item][1];
	}

	private getStyleOfItem() {
		return this.clothes[this.type][this.item][0];
	}

	private switchCamera() {
		const camData = camPositions[this.type];
		const offset = new mp.Vector3(0, 0, camData.height);

		mp.cameras.setToPlayer(offset, offset, camData.dist, camData.angle);
	}
}

const shop = new ClothingShop();
