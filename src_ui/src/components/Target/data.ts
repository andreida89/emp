export const sections: {
    [name: string]: { [name: string]: string | [string, string] };
} = {
    player: {
        organization: 'Organizatie',
        docs: 'Documente',
        property: 'Proprietati',
        others: 'Alte actiuni'
    },
    self: {
        mood: 'Stare',
        walking: 'Stil de mers',
        animations: 'Animatii',
        docs: 'Documente'
    },
    vehicle: {
        seatbelt: 'Centura de siguranta',
        lock: 'Incuietoare',
        doors: 'Usi',
        trunk: 'Portbagaj',
        passengers: 'Da afara pasagerul',
        refuel: 'Alimenteaza',
        repair: 'Repara'
    }
};

export const groups: typeof sections = {
    organization: {},
    others: {
        money: 'Da bani',
        handshake: 'Strange mana'
    },
    docs: {
        passport: 'Buletin',
        licenses: 'Licente'
    },
    property: {
        vehicle: 'Vanzare vehicul',
        house: 'Vanzare casa',
        business: 'Vanzare afacere'
    },
    passengers: {},
	doors: {
		hood: 'Capota',
		front_left: ['Fata stanga', 'doors'],
		front_right: ['Fata dreapta', 'doors'],
		rear_left: ['Spate stanga', 'doors'],
		rear_right: ['Spate dreapta', 'doors']
	},
    trunk: {
        inventory: ['Deschide', 'trunk'],
        access: ['Acces', 'trunk']
    },
    mood: {
        normal: ['Obisnuit', 'mood'],
        aiming: ['Jucaus', 'mood'],
        angry: ['Furioas', 'mood'],
        drunk: ['Beat', 'mood'],
        happy: ['Fericit', 'mood'],
        injured: ['Trist', 'mood'],
        stressed: ['Stresat', 'mood'],
        sulking: ['Suparat', 'mood']
    },
    walking: {
        normal: ['Normal', 'walking'],
        drunk: ['Beat', 'walking'],
        fat: ['Gras', 'walking'],
        gangster: ['Gangster', 'walking'],
        quick: ['Grabit', 'walking'],
        sad: ['Trist', 'walking'],
        injured: ['Ranit', 'walking']
    },
    animations: {}
};