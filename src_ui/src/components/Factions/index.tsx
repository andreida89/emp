import { IRoute } from 'routes';
import Docs from './docs';
import Garage from './garage';
import Wardrobe from './wardrobe';
import Wardrobepolitie from './wardrobepolitie';
import Wardrobesindicat from './wardrobesindicat';
import WardrobeUMU from './wardrobeumu';
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
		path: '/factions/wardrobepolitie',
		component: Wardrobepolitie
	},
	{
		path: '/factions/wardrobeumu',
		component: WardrobeUMU
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
