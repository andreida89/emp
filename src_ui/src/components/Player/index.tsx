import { IRoute } from 'routes';
import Passport from './passport';
import Permis from './permis';
import Licenses from './licenses';
import Death from './death';
import DeathEvent from './deathevent';

export default [
	{
		path: '/player/passport',
		component: Passport
	},
	{
		path: '/player/permis',
		component: Permis
	},
	{
		path: '/player/licenses',
		component: Licenses
	},
	{
		path: '/player/death',
		component: Death
	},
	{
		path: '/player/deathevent',
		component: DeathEvent
	}
] as IRoute[];
