import { isNumber } from 'lodash';
import hud from 'helpers/hud';
import empty from 'data/clothes/empty.json';
//import torsos from 'data/clothes/torsos.json';
//import undershirts from 'data/clothes/undershirts.json';
//import tops from 'data/clothes/tops.json';

type ClothesItem = {
	style: number;
	color: number;
	gender?: 'male' | 'female';
};

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



export type ClothesName = keyof typeof components | keyof typeof props;

class Clothes {
set = (player: Player, name: ClothesName, item: ClothesItem) => {
	const { mp } = player;
	const { gender } = player;

	let rawStyle = item.style;
	let rawColor = item.color;

	// Convertim la număr (fallback la 0 dacă e invalid)
	const style = isNumber(rawStyle) ? rawStyle : Number(rawStyle);
	const color = isNumber(rawColor) ? rawColor : Number(rawColor);

	if (isNaN(style) || isNaN(color)) {
		console.warn(`[Clothes.set] Invalid data for ${name}: style=${rawStyle}, color=${rawColor} → using 0`);
	}

	const safeStyle = isNaN(style) ? 0 : style;
	const safeColor = isNaN(color) ? 0 : color;

	if (item.gender && gender !== item.gender) {
		hud.showNotification(
			player,
			'error',
			'Aceasta imbracaminte nu este compatibila cu genul tau.',
			true
		);
		throw new SilentError('wrong clothes');
	}

	// Debug: log info clar înainte de setare
	//console.log(`[Clothes.set] Applying ${name} with style=${safeStyle}, color=${safeColor}`);

	switch (name) {
		case 'mask':
			return this.setMask(player, { style: safeStyle, color: safeColor });

		default:
			if (this.isComponent(name)) {
				mp.setClothes(components[name], safeStyle, safeColor, 2);
			} else {
				mp.setProp(props[name], safeStyle, safeColor);
			}
	}
};


	hide(player: Player, name: ClothesName) {
		const { gender } = player;

		this.set(player, name, {
			style: this.isComponent(name) ? empty[gender][components[name]] : 255,
			color: 0,
			gender
		});
	}

	load(player: Player) {
		this.clear(player);

		Object.values(player.equipment).forEach((item) => {
			if (item.data?.style >= 0) this.set(player, item.name as any, item.data as any);
		});
	}

	clear(player: Player) {
		Object.keys(props).forEach((item) => this.hide(player, item as any));
		Object.keys(components).forEach((item) => this.hide(player, item as any));
	}

	private isComponent(name: string) {
		return typeof components[name] === 'number';
	}

	private getComponentData(player: PlayerMp, name: keyof typeof components) {
		return (components[name] === 11
			? player.getVariable(name) ?? player.getClothes(components[name])
			: player.getClothes(components[name])) as ReturnType<typeof player.getClothes>;
	}

	private isEmpty(player: Player, component: keyof typeof components, style: number) {
		const { gender } = player;
		const id = components[component];

		return empty[gender][id] === style;
	}
/**
	private setJacket(player: Player, data: ClothesItem) {
		const { mp } = player;
		const top = this.getComponentData(mp, 'shirt');

		this.setClientClothes(mp, 'jacket', data);
		this.setShirt(player, { style: top.drawable, color: top.texture });
	}

	private setShirt(player: Player, data: ClothesItem) {
		const { mp, gender } = player;
		let { drawable: top } = this.getComponentData(mp, 'jacket');

		// not sync, only data storage
		this.setClientClothes(player.mp, 'shirt', data);

		if (!isNumber(tops[gender][top])) {
			top = data.style;

			this.setClientClothes(player.mp, 'jacket', data);
		}

		this.setUndershirt(player, top, data);
		this.applyCorrectTorso(player, top);
	}

	private setUndershirt(player: Player, top: number, { style, color }: ClothesItem) {
		const { mp, gender } = player;

		const type: number = tops[gender][top];
		const drawable: number = undershirts[gender][style]?.[type] ?? empty[gender][8];

		mp.setClothes(8, drawable, color, 2);
	}

	private applyCorrectTorso(player: Player, top: number) {
		const { mp, gender } = player;

		const torso: number = torsos[gender][top] ?? empty[gender][3];

		mp.setClothes(3, torso, 0, 2);
	}
**/
	private setMask(player: Player, data: ClothesItem) {
		const { mp } = player;

		mp.setClothes(1, data.style, data.color, 2);
		mp.setVariable('inMask', !this.isEmpty(player, 'mask', data.style));
	}

	private setClientClothes(player: PlayerMp, name: string, data: ClothesItem) {
		const { style: drawable, color: texture } = data;

		player.setVariable(name, { drawable, texture });
	}
}

export default new Clothes();
