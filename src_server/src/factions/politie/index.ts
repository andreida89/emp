import factions from 'factions';
import FactionBuilder from 'factions/builder';
//import { Garage } from 'factions/garage';
import { Wardrobe } from 'factions/wardrobepolitie';
import './ticket';
import './info';
import './wanted';

const name = 'politie';

const coords = factions.getCoords(name);
const wardrobe = new Wardrobe({
	male: {
		hats: [
			[247, 0],
			[247, 1],
			[248, 0],
			[249, 0]
		],
		tops: [
			[612, 0],
			[612, 1],
			[612, 2],
			[612, 3],
			[612, 4],
			[612, 5],
			[612, 6],
			[612, 7],
			[612, 8],
			[612, 9],
			[613, 0],
			[613, 1],
			[613, 2],
			[613, 3],
			[613, 4],
			[613, 5],
			[613, 6],
			[613, 7],
			[613, 8],
			[613, 9],
			[613, 10],
			[613, 11],
			[613, 12],
			[613, 13],
			[613, 14],
			[613, 15],
			[613, 16],
			[613, 17],
			[613, 18],
			[613, 19],
			[613, 20],
			[614, 0],
			[614, 1],
			[614, 2],
			[614, 3],
			[614, 4],
			[614, 5],
			[614, 6],
			[614, 7],
			[614, 8],
			[614, 9],
			[614, 10],
			[615, 0],
			[615, 1],
			[615, 2],
			[615, 3],
			[615, 4],
			[615, 5],
			[615, 6],
			[615, 7],
			[615, 8],
			[615, 9],
			[615, 10],
			[615, 11],
			[615, 12],
			[615, 13],
			[615, 14],
			[615, 15],
			[615, 16],
			[615, 17],
			[615, 18],
			[615, 19],
			[615, 20],
			[616, 0],
			[616, 1],
			[616, 2],
			[616, 3],
			[616, 4],
			[617, 0],
			[617, 1],
			[617, 2],
			[617, 3],
			[617, 4],
			[617, 5],
			[617, 6],
			[617, 7],
			[617, 8],
			[617, 9],
			[617, 10],
			[619, 0],
			[620, 0],
			[621, 0],
			[622, 0]
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
			[230, 1],
			[231, 0],
			[232, 0]
		],
		shoes: [
			[25, 0],
			[21, 0],
			[50, 0],
			[51, 0],
			[53, 0],
			[24, 0],
			[162, 0]
		],
		tasks: [
			[64, 0],
			[65, 0],
			[66, 0],
			[67, 0],
			[68, 0]
		],
		masks: [
			[35, 0],
			[51, 0],
			[52, 0],
			[57, 0]
		],
		accessories: [
			[203, 0]
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

const politie = builder.build();

export default politie;
