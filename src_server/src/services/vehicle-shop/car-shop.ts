import VehicleShop from './shop';

type CarShopData = {
	id: string;
	vehicles: string[];
	blip: BlipsOptions;
};

const shops: CarShopData[] = [
	{
		id: 'cheap_carshop',
		vehicles: [
      'brioso2',
      'asbo',
      'club',
      'asea',
      'emperor2',
      'premier',
      'cheburek',
      'tornado3',
      'journey',
      'surfer2',
      'asterope',
      'blista',
      'fugitive',
      'regina',
      'ingot',
		],
		blip: {
			name: 'Dealer Auto (Ieftine)',
			model: 225,
			color: 3
		}
	},
	{
		id: 'mid_carshop',
		vehicles: [
      'hellion',
      'glendale',
      'brioso',
      'kanjo',
      'issi2',
      'oracle',
      'felon',
      'oracle2',
      'jackal',
      'sentinel',
      'zion',
      'blade',
      'buccaneer',
      'dukes',
      'warrener',
      'dubsta',
      'baller3',
      'rebla',
      'vstr',
		],
		blip: {
			name: 'Dealer Auto (Medii)',
			model: 530,
			color: 48
		}
	},
   {
		id: 'vip_carshop',
		vehicles: [

		],
		blip: {
			name: 'VIP Dealership',
			model: 530,
			color: 48
		}
	},
	{
		id: 'premium_carshop',
		vehicles: [
      'schlagen',
      'zentorno',
      'chiron19',
      'skyline',
      'm4comp',
      'm5comp',
      'jesko20',
      'huracan',
      '18rs7',
      '18Velar',
      '63gls',
      '63gls2',
      '350z',
      '2019M5',
      'a45',
      'a90',
      'agerars',
      'amggt16',
      'astondb11',
      'avtr',
      'bentayga',
      'bentaygast',
      'bentley20',
      'bmw730',
      'bmwe28',
      'bmwe34',
      'bmwe36',
      'bmwe38',
      'bmwe39',
      'bmwe46',
      'bmwe70',
      'bmwg07',
      'bmwm2',
      'bmwm4',
      'bmwm7',
      'bmwx7',
      'bmwz4',
      'camry70',
      'cls63s',
      'cullinan',
      'cyber',
      'e63s',
      'eqg',
      'g63',
      'ghost',
      'gle63',
      'gt63s',
      'i8',
      'kiastinger',
      'lc200',
      'lex570',
      'mark2',
      'modelx',
      'mp1',
      'msprinter',
      'panamera17turbo',
      'rs6',
      'rs72',
      'rx7',
      's63cab',
      's600',
      'starone',
      'tahoe2',
      'teslaroad',
      'urus',
      'vclass',
      'w210',
      'x5g05',
      'x5me70',
      'x6m',
      'x6m2',
      'bestiagts',
      'neon',
      'ninef',
      'jester',
      'infernus2',
      't20',
      'tempesta',
      'reaper',
      'coquette4',
      'osiris',
      'furia',
      'cheetah2',
      'entity2',
		],
		blip: {
			name: 'Dealer Auto (Scumpe)',
			model: 669,
			color: 50
		}
	}
];

class CarShop extends VehicleShop {
	constructor(data: CarShopData) {
		super(data.id, data.blip, data.vehicles);
	}

	protected async canBuy(player: Player) {
		await super.canBuy(player);

		if (!player.hasLicense('car')) {
			return mp.events.reject('Nu detii permis de conducere cat. B');
		}
	}
}

shops.forEach((shop) => new CarShop(shop));
