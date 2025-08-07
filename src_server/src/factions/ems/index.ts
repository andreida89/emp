import factions from 'factions';
import FactionBuilder from 'factions/builder';
//import { Garage } from 'factions/garage';
import { Wardrobe } from 'factions/wardrobesmurd';
import './licenses';
import './health';

const name = 'ems';

const coords = factions.getCoords(name);
 const wardrobe = new Wardrobe({
	male: {
		hats: [
			[122, 0],
			[122, 1],
			[249, 0]
		],
		tops: [
			[600, 0],
			[601, 0],
			[602, 0],
			[603, 0]
		],
		torso: [
			[0, 0],
			[1, 0],
			[15, 0],
			[74, 0],
			[75, 0],
			[77, 0],
			[79, 0],
			[81, 0],
			[82, 0],
			[204, 0],
			[205, 0]
		],
		pants: [
			[10, 0],
			[24, 0],
			[225, 0],
			[226, 0]
		],
		shoes: [
			[25, 0],
			[36, 3],
			[51, 0],
			[24, 0]
		],
		masks: [
		],
		accessories: [
			[126, 0],
			[127, 0]
		],
		undershirts: [
			[0, 2],
			[10, 0],
			[11, 0],
			[21, 0],
			[25, 9],
			[27, 0],
			[64, 0],
			[69, 0],
			[72, 0],
			[72, 1],
			[96, 0]
		]
	},
	female: {
		hats: [
			[122, 0],
			[122, 1],
			[249, 0]
		],
		tops: [
			[600, 0],
			[601, 0],
			[602, 0],
			[603, 0]
		],
		torso: [
			[0, 0],
			[1, 0],
			[15, 0],
			[74, 0],
			[75, 0],
			[77, 0],
			[79, 0],
			[81, 0],
			[82, 0],
			[204, 0],
			[205, 0]
		],
		pants: [
			[10, 0],
			[24, 0],
			[225, 0],
			[226, 0]
		],
		shoes: [
			[25, 0],
			[36, 3],
			[51, 0],
			[24, 0]
		],
		masks: [
		],
		accessories: [
			[126, 0],
			[127, 0]
		],
		undershirts: [
			[0, 2],
			[10, 0],
			[11, 0],
			[21, 0],
			[25, 9],
			[27, 0],
			[64, 0],
			[69, 0],
			[72, 0],
			[72, 1],
			[96, 0]
		]
	}
});

//const garage = new Garage(coords.garage, ['emsnspeedo', 'emsroamer'], {});

const builder = new FactionBuilder(name, true);

builder.createWarehouse(coords.warehouse, 500000000000);
builder.createInventory(coords.inventory, { cells: 180, slots: 10000 });
builder.createWorkshop(coords.workshop, {
	medkit: 15
});

builder.setWardrobe(coords.wardrobe, wardrobe);
//builder.setGarage(garage);

builder.makeBlip(coords.spawn, { name: 'Spital', model: 61, color: 1, scale: 1.1 });

const ems = builder.build();

export default ems;
