import { IconType } from 'react-icons';
import {
	IoPeople,
	IoStar,
	IoWallet,
	IoCar,
	IoAlbums,
	IoMedical,
	IoServer,
	IoSettings,
	IoLibrary,
	IoCall,
	IoShield
} from 'react-icons/io5';

type App = {
	title: string;
	color: string;
	icon: IconType;
	route: string;
};

const factionApps: { [name: string]: string[] } = {
	umu: ['members', 'ranks', 'money', 'vehicles', 'medic_calls', 'journal'],
	politie: ['members', 'ranks', 'money', 'vehicles', 'politie_calls', 'database', 'journal'],
	sindicat: ['members', 'ranks', 'money', 'vehicles', 'database', 'journal'],
    primarie: ['members', 'ranks', 'money', 'vehicles', 'database', 'journal'],
	santamuerte: ['members', 'ranks', 'money', 'vehicles', 'journal'],
    losdiablos: ['members', 'ranks', 'money', 'vehicles', 'journal']
};

const apps: { [key: string]: App } = {
    settings: {
        title: 'Setari',
        color: '#79787A',
        icon: IoSettings,
        route: '/settings/'
    },
    ranks: {
        title: 'Ranguri',
        color: '#ff9501',
        icon: IoStar,
        route: '/ranks/'
    },
    members: {
        title: 'Membri',
        color: '#007aff',
        icon: IoPeople,
        route: '/members/'
    },
    money: {
        title: 'Balanta organizatiei',
        color: '#32BF55',
        icon: IoWallet,
        route: '/money/'
    },
    vehicles: {
        title: 'Vehicule',
        color: '#FAC800',
        icon: IoCar,
        route: '/vehicles/'
    },
    materials: {
        title: 'Livrare materiale',
        color: '#5855d6',
        icon: IoAlbums,
        route: '/materials/'
    },
    politie_calls: {
        title: 'Apeluri',
        color: '#007aff',
        icon: IoCall,
        route: '/pol_calls/'
    },
    medic_calls: {
        title: 'Apeluri',
        color: '#FE3B30',
        icon: IoMedical,
        route: '/med_calls/'
    },
    database: {
        title: 'Baza de date',
        color: '#FE3B30',
        icon: IoServer,
        route: '/database/'
    },
    journal: {
        title: 'Jurnal de actiuni',
        color: '#30A9DC',
        icon: IoLibrary,
        route: '/journal/'
    },
    gang_zones: {
        title: 'Teritorii',
        color: '#FE3B30',
        icon: IoShield,
        route: '/gang_zones/'
    }
};


export function getApps(faction: string) {
	const data: typeof apps = {};

	factionApps[faction].forEach((app) => {
		data[app] = apps[app];
	});

	return data;
}
