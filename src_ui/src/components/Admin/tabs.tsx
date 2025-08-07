import React from 'react';
import Ban from './ban';
import Reports from './reports';
import Vehicle from './vehicle';
import Kick from './kick';
import Skin from './skin';
import Money from './money';
import Teleport from './teleport';
import Coordonate from './coordonate';
import Revive from './revive';
import Respawn from './respawn';
//import Spectator from './spectator';
import Chat from './chat';
import House from './house';
import Demorgan from './demorgan';
import Faction from './faction';
//import Journal from './journal';

type Tab = {
	name: string;
	component?: React.ComponentClass<any, any> | React.FunctionComponent;
};
const helperintesteTabs: Tab[] = [
	{
		name: 'TICKETE',
		component: Reports
	},
	{
		name: 'Teleport',
		component: Teleport
	},
	{
		name: 'Revive',
		component: Revive
	},
	{
		name: 'Respawn',
		component: Respawn
	},
	{
		name: 'Coordonate',
		component: Coordonate
	}
];

const helperTabs: Tab[] = [
	{
		name: 'Kick',
		component: Kick
	},
	{
		name: 'Jail',
		component: Demorgan
	}

//	{
//		name: 'Observare',
//		component: Spectator
//	}
];
const moderatorTabs: Tab[] = [
	{
		name: 'Ban',
		component: Kick
	}
];
const moderatoravansatTabs: Tab[] = [

];
const administratorTabs: Tab[] = [
	{
		name: 'Notificari',
		component: Chat
	}
];
const managerTabs: Tab[] = [
	{
		name: 'VEHICULE',
		component: Vehicle
	}
];
const cofondatorTabs: Tab[] = [
	{
		name: 'Organizatii',
		component: Faction
	},
	{
		name: 'Skin jucator',
		component: Skin
	},
	{
		name: 'Bani',
		component: Money
	},
	{
		name: 'Case',
		component: House
	}
//	{
//		name: 'Jurnal actiuni',
//		component: Journal
//	}
];

const fondatorTabs: Tab[] = [
];

export default [
	helperintesteTabs,
	[...helperintesteTabs, ...helperTabs],
	[...helperintesteTabs, ...helperTabs, ...moderatorTabs],
	[...helperintesteTabs, ...helperTabs, ...moderatorTabs, ...moderatoravansatTabs],
	[...helperintesteTabs, ...helperTabs, ...moderatorTabs, ...moderatoravansatTabs, ...administratorTabs],
	[...helperintesteTabs, ...helperTabs, ...moderatorTabs, ...moderatoravansatTabs, ...administratorTabs, ...managerTabs],
	[...helperintesteTabs, ...helperTabs, ...moderatorTabs, ...moderatoravansatTabs, ...administratorTabs, ...managerTabs, ...cofondatorTabs],
	[...helperintesteTabs, ...helperTabs, ...moderatorTabs, ...moderatoravansatTabs, ...administratorTabs, ...managerTabs, ...cofondatorTabs, ...fondatorTabs]
];
