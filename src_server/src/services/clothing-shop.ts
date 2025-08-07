import money from 'helpers/money';
//import ClothesModel from 'models/Clothes';
import playerInventory from 'player/inventory';
import playerClothes, { ClothesName } from 'player/clothes';
import tasks from 'awards/tasks';
import Service from './service';
import { pay } from 'helpers/pay';
import allTorso from 'data/clothes/alltorso.json';
import allUndershirts from 'data/clothes/allundershirt.json';
import allTops from 'data/clothes/alltops.json';
import allTasks from 'data/clothes/alltasks.json';
import allAccessories from 'data/clothes/allaccesorii.json';
import allShoes from 'data/clothes/allincaltaminte.json';
import allPants from 'data/clothes/allpantaloni.json';
import allMasks from 'data/clothes/allmasks.json';
import allHats from 'data/clothes/allhats.json';
import allGlasses from 'data/clothes/allglasses.json';
import allEars from 'data/clothes/allears.json';
import allWatches from 'data/clothes/allceasuri.json';
import allBracelets from 'data/clothes/allbratari.json';
import allBags from 'data/clothes/allgenti.json';

type Clothes = {
	[category in ClothesName]?: [number, number][];
};

type Product = {
	type: string;
	index: number;
	color: number;
};

class ClothingShop extends Service {
	private readonly clothes: {
		[gender in Player['gender']]: Clothes;
	};

	constructor() {
		super('clothing_shop', { name: 'Magazin de Haine', model: 73, color: 24 });

		this.clothes = { male: {}, female: {} };
	}

	protected subscribeToEvents() {
		mp.events.subscribe({
			'ClothingShop-SetItem': this.setItem,
			'ClothingShop-GetClothes': this.getClothesByType.bind(this),
			'ClothingShop-Buy': this.buy.bind(this),
			'ClothingShop-BuyFree': this.buyfree.bind(this),
			'ClothingShop-Exit': this.onExit
		});
	}

	load(data: (PositionEx & { radius?: number })[]) {
		super.load(data);
		this.loadClothesList();
	}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;

		player.togglePrivateDimension();
		player.callEvent('ClothingShop-ShowMenu');
	}

	setItem(player: Player, type: ClothesName, item: any, load = false) {
		if (load) playerClothes.load(player);

		playerClothes.set(player, type, item);
	}

	private onExit(player: Player) {
		playerClothes.load(player);
		player.togglePrivateDimension();
	}

	private getClothesOfGender(player: Player) {
		return this.clothes[player.gender];
	}

	private getClothesByType(player: Player, type: string) {
		return this.getClothesOfGender(player)[type];
	}

	private getPrice(clothes: Clothes, type: string, index: number) {
		return clothes[type][index][1] as number;
	}

	private prepareForInventory(clothes: Clothes, data: Product) {
		const { type, index, color } = data;
		const style: number = clothes[type][index][0];

		return {
			name: type,
			amount: 1,
			data: {
				style,
				color
			}
		};
	}

	private async buy(player: Player, product: Product, payment: PaymentType) {
		const clothes = this.getClothesOfGender(player);
		const item = this.prepareForInventory(clothes, product);

		playerInventory.checkEnoughSlots(player, [item]);

		const price = this.getPrice(clothes, product.type, product.index);

		await pay(player, payment, price, 'clothing shop');
		await playerInventory.addItem(player, item);

		await tasks.implement(player, 'buy_clothes');
	}
private async buyfree(player: Player, product: Product, payment: PaymentType) {
	const clothes = this.getClothesOfGender(player);
	const item = this.prepareForInventory(clothes, product);

	playerInventory.checkEnoughSlots(player, [item]);
	await pay(player, payment, price, 'clothing shop');
	await playerInventory.addItem(player, item);

	await tasks.implement(player, 'buy_clothes');

	player.call('AnuntNotification', ['Articolul a fost adaugat in inventar', 'success']);
}


/**	private async loadClothesList() {
		const clothes = await ClothesModel.find({}).lean();

		clothes.forEach((item) => {
			const { gender, category, style, price } = item;
			const list = this.clothes[gender][category] || [];

			if (category === 'mask') {
				this.clothes.male[category] = [...list];
				this.clothes.female[category] = [...list];

				this.clothes.male[category].push([style, price]);
				this.clothes.female[category].push([style, price]);
			} else {
				this.clothes[gender][category] = [...list];
				this.clothes[gender][category].push([style, price]);
			}
		});
	} **/

	private loadClothesList() {
	const datasets = [
		...allHats,
		...allTops,
		...allPants,
		...allShoes,
		...allGlasses,
		...allMasks,
		...allAccessories,
		...allWatches,
		...allBracelets,
		...allEars,
		...allTasks,
		...allTorso,
		...allUndershirts,
		...allBags

	];

	datasets.forEach((item: any) => {
		const { sex, category, drawable, price } = item;
		const gender = sex as 'male' | 'female';

		if (!this.clothes[gender][category]) {
			this.clothes[gender][category] = [];
		}

		this.clothes[gender][category].push([drawable, Number(price)]);
	});
}

}

const service = new ClothingShop();
