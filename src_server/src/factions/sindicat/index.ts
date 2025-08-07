import factions from 'factions';
import FactionBuilder from 'factions/builder';
//import { Garage } from 'factions/garage';
import { Wardrobe } from 'factions/wardrobesindicat';
import './info';

const name = 'sindicat';

const coords = factions.getCoords(name);
const wardrobe = new Wardrobe({
	male: {
		tops: [
			[605, 0],
			[605, 1],
			[605, 2],
			[606, 0],
			[606, 1],
			[606, 2],
			[607, 0],
			[607, 1],
			[607, 2],
			[611, 0],
			[611, 1],
			[611, 2]
		],
		torso: [
			[0, 0],
			[1, 0],
			[4, 0],
			[6, 0],
			[8, 0],
			[11, 0],
			[14, 0],
			[15, 0],
			[17, 0],
			[19, 0],
			[20, 0],
			[28, 0],
			[30, 0],
			[31, 0],
			[33, 0],
			[35, 0],
			[36, 0],
			[37, 0],
			[38, 0],
			[185, 0]
		],
		pants: [
			[227, 0],
			[227, 1],
			[227, 2],
			[228, 0],
			[228, 1],
			[228, 2]
		],
		shoes: [
			[161, 0],
			[161, 1],
			[161, 2]
		],
		masks: [
			[249, 0],
			[249, 1],
			[249, 2]
		],
		undershirts: [
		[35, 0],
		[90, 1],
		[96, 1],
		[147, 2],
		[149, 0],
		[150, 0],
		[150, 10],
		[161, 0],
		[161, 15],
		[161, 18],
		[218, 0],
		[218, 1],
		[218, 2]
		]
	},
	female: {
		tops: [
			[48, 0],
			[249, 1],
			[249, 2],
			[329, 0],
			[327, 0],
			[42, 0],
			[331, 0]
		],
		torso: [
			[0, 0],
			[1, 0],
			[4, 0],
			[6, 0],
			[8, 0],
			[11, 0],
			[15, 0],
			[17, 0],
			[30, 0],
			[31, 0],
			[33, 0],
			[35, 0],
			[36, 0],
			[37, 0],
			[38, 0],
		],
		pants: [
			[34, 0],
			[50, 0],
			[37, 6],
			[33, 0],
			[127, 0]
		],
		shoes: [
			[6, 0],
			[52, 0],
			[29, 0],
			[24, 0],
			[25, 0]
		],
		masks: [
			[35, 0],
			[52, 0],
			[57, 0]
		],
		undershirts: [
		[35, 0],
		[90, 1],
		[96, 1],
		[147, 2],
		[149, 0],
		[150, 0],
		[150, 10],
		[161, 0],
		[161, 15],
		[161, 18],
		[218, 0],
		[218, 1],
		[218, 2]
		]
	}
});
const builder = new FactionBuilder(name, true);

builder.createWarehouse(coords.warehouse, 500000000000);
builder.createInventory(coords.inventory, { cells: 500, slots: 100000 });
builder.createWorkshop(coords.workshop, {
	handcuffs: 1,
	knife: 1,
	gadgetpistol: 1,
	navyrevolver: 1,
	smg: 1,
	combatpdw: 1,
	pumpshotgun: 1,
	carbinerifle: 1,
	'9mm': 1,
	'7.62mm': 1,
	'12gauge': 1,
	armor_medium: 1,
	armor_heavy: 1
});
builder.setWardrobe(coords.wardrobe, wardrobe);
//builder.setGarage(garage);
//builder.makeBlip(coords.spawn, { name: 'Politie', model: 60, color: 3 });

const sindicat = builder.build();

export default sindicat;
