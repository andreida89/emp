import factions from 'factions';
import FactionBuilder from 'factions/builder';
//import { Garage } from 'factions/garage';
import { Wardrobe } from 'factions/wardrobepolice';
import './ticket';
import './info';
import './wanted';

const name = 'lspd';

const coords = factions.getCoords(name);
const wardrobe = new Wardrobe({
	male: {
		hats: [
			[247, 0],
			[247, 1],
			[248, 0]
		],
		tops: [
			[589, 0],
			[589, 1],
			[589, 2],
			[589, 3],
			[589, 4],
			[589, 5],
			[589, 6],
			[589, 7],
			[589, 8],
			[589, 9],
			[589, 10],
			[590, 0],
			[590, 1],
			[590, 2],
			[591, 0],
			[591, 1],
			[591, 2],
			[591, 3],
			[591, 4],
			[591, 5],
			[591, 6],
			[591, 7],
			[591, 8],
			[591, 9],
			[591, 10],
			[592, 0],
			[592, 1],
			[592, 2],
			[593, 0],
			[593, 1],
			[593, 2],
			[593, 3],
			[593, 4],
			[594, 0],
			[594, 1],
			[594, 2],
			[594, 3],
			[594, 4],
			[594, 5],
			[594, 6],
			[594, 7],
			[594, 8],
			[594, 9],
			[594, 10],
			[596, 0],
			[597, 0],
			[598, 0],
			[599, 0]
		],
		torso: [
			[0, 0],
			[1, 0],
			[4, 0],
			[6, 0],
			[11, 0],
			[15, 0],
			[17, 0],
			[30, 0],
			[31, 0],
			[33, 0],
			[35, 0],
			[37, 0],
			[38, 0]
		],
		pants: [
			[222, 1],
			[223, 0],
			[224, 0]
		],
		shoes: [
			[25, 0],
			[21, 0],
			[50, 0],
			[51, 0],
			[53, 0],
			[24, 0],
			[25, 0],
			[160, 0]
		],
		tasks: [
			[62, 0],
			[63, 0],
			[64, 0],
			[65, 0]
		],
		masks: [
			[35, 0],
			[51, 0],
			[52, 0],
			[57, 0]
		],
		accessories: [
			[201, 0]
		]
	}
});

//const garage = new Garage(
//	coords.garage,
//	['poltaxi', 'unvan', 'unsilv', 'unram', 'unlightning', 'untesla', 'unstang', 'uncam', 'untaco'],
//	{ armor: 2, paint: { primary: [255, 255, 255, 0], secondary: [0, 0, 0, 0] } }
//);

const builder = new FactionBuilder(name, true);

builder.createWarehouse(coords.warehouse, 500000000000);
builder.createInventory(coords.inventory, { cells: 180, slots: 10000 });
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
builder.setWardrobe(coords.wardrobe, wardrobe);
//builder.setGarage(garage);
builder.makeBlip(coords.spawn, { name: 'Politie', model: 60, color: 3 });

const police = builder.build();

export default police;
