import factions from 'factions';
import FactionBuilder from 'factions/builder';
//import { Garage } from 'factions/garage';
import { Wardrobe } from 'factions/wardrobe';


const name = 'primarie';

const coords = factions.getCoords(name);
/** const wardrobe = new Wardrobe({
	male: {
		hats: [
		],
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
			[15, 0],
			[24, 0],
			[30, 1],
			[36, 3],
			[97, 1],
			[104, 2],
			[106, 0],
			[106, 9],
			[106, 4],
			[106, 2]
		],
		masks: [
			[4, 1],
			[4, 2],
			[14, 9],
			[126, 0],
			[249, 0]
		],
		accessories: [
		],
		undershirts: [
		[217, 0],
		[217, 1],
		[217, 2]
		]
	},
	female: {
		hats: [
			[45, 0],
			[38, 0],
			[122, 0],
			[124, 0]
		],
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
		accessories: [
			[20, 0],
			[22, 0],
			[35, 0],
			[152, 0],
			[159, 0],
			[189, 0],
			[191, 0]
		],
		undershirts: [
		[],
		]
	}
});
**/
const builder = new FactionBuilder(name, true);

builder.createWarehouse(coords.warehouse, 50000);
builder.createInventory(coords.inventory, { cells: 500, slots: 100000 });
builder.createWorkshop(coords.workshop, {
	handcuffs: 5,
	nightstick: 8,
	stungun: 10,
	knife: 5,
	pistol: 15,
	pistol50: 18,
	smg: 50,
	combatpdw: 70,
	pumpshotgun: 90,
	carbinerifle: 120,
	'9mm': 1,
	'7.62mm': 3,
	'12gauge': 5,
	armor_medium: 5,
	armor_heavy: 15
});

//builder.setWardrobe(coords.wardrobe, wardrobe);
//builder.setGarage(garage);
//builder.makeBlip(coords.spawn, { name: 'Politie', model: 60, color: 3 });

const primarie = builder.build();

export default primarie;
