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
			[628, 0],
			[628, 1],
			[628, 2],
			[629, 0],
			[629, 1],
			[629, 2],
			[630, 0],
			[630, 1],
			[630, 2],
			[636, 0],
			[636, 1],
			[636, 2]
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
			[235, 0],
			[235, 1],
			[235, 2],
			[236, 0],
			[236, 1],
			[236, 2]
		],
		shoes: [
			[163, 0],
			[163, 1],
			[163, 2]
		],
		masks: [
			[251, 0],
			[251, 1],
			[251, 2]
		],
		undershirts: [
		[35, 0],
		[90, 1],
		[147, 2],
		[149, 0],
		[150, 0],
		[150, 10],
		[161, 0],
		[222, 0],
		[223, 0],
		[223, 1],
		[223, 2],
		[224, 0],
		[224, 1],
		[224, 2],
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
