import Main from './main';
import Keypad from './keypad';
import Contacts from './contacts';
import Settings from './settings';
import Maps from './maps';
import Sim from './sim';
import Vehicles from './vehicles';
import Referral from './referral';
import Support from './support';
import Donation from './donation';

export type PhoneApp = {
	name: string;
	component: any;
	attached?: boolean;
};

const apps: { [key: string]: PhoneApp } = {
    maps: {
        name: 'GPS',
        component: Maps
    },
    sim: {
        name: 'Info SIM',
        component: Sim
    },
    referral: {
        name: 'Referral',
        component: Referral
    },
    vehicles: {
        name: 'Vehicule',
        component: Vehicles
    },
    donation: {
        name: 'Magazin',
        component: Donation
    },
    support: {
        name: 'Suport',
        component: Support
    },

    calls: {
        name: 'Apeluri',
        component: Keypad,
        attached: true
    },
    contacts: {
        name: 'Contacte',
        component: Contacts,
        attached: true
    },
    messages: {
        name: 'Mesaje',
        component: Main,
        attached: true
    },
    settings: {
        name: 'Setari',
        component: Settings,
        attached: true
    }
};


export default apps;
