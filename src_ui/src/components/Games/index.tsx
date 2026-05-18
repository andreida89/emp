import { IRoute } from 'routes';
import Lockpick from './Lockpick';
import FishingMinigame from './FishingMinigame';

export default [
	{
		path: '/games/lockpick',
		component: Lockpick
	},
	{
		path: '/games/fishing',
		component: FishingMinigame
	}
] as IRoute[];
