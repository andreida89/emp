import { IRoute } from 'routes';
import Docs from './docs';
import Garage from './garage';
import Wardrobe from './wardrobe';
import Wardrobepolice from './wardrobepolice';
import Wardrobesindicat from './wardrobesindicat';
import Wardrobesmurd from './wardrobesmurd';
import Workshop from './workshop';
import Tablet from '../Tablet';

export default [
	{
		path: '/factions/docs',
		component: Docs
	},
	{
		path: '/factions/garage',
		component: Garage
	},
	{
		path: '/factions/garage',
		component: Garage
	},
	{
		path: '/factions/tablet',
		component: Tablet
	},
	{
		path: '/factions/wardrobe',
		component: Wardrobe
	},
	{
		path: '/factions/wardrobepolice',
		component: Wardrobepolice
	},
	{
		path: '/factions/wardrobesmurd',
		component: Wardrobesmurd
	},
	{
		path: '/factions/wardrobesindicat',
		component: Wardrobesindicat
	},
	{
		path: '/factions/workshop',
		component: Workshop
	}
] as IRoute[];
