import hud from 'basic/hud';
import gangZones from 'factions/gang/zones';

const player = mp.players.local;

class Auth {
	constructor() {
		mp.events.subscribe({
			'Auth-ShowMenu': this.showMenu.bind(this),
			'Auth-ShowConstruction': this.showConstruction,
			'Auth-SuccessLogin': this.onLogin,
			'Auth-SuccessRegister': this.onRegister.bind(this),
			'Auth-SaveCredentials': (data: any) => {
				mp.storage.update({ remember_login: data });
			}
		});
	}
    private showConstruction() {
        mp.browsers.showPage('construction');
        // Poți da și un chat.push cu un mesaj de informare
    }
	private showMenu() {
		const loginData = mp.storage.data.remember_login;
		mp.browsers.showPage('auth', { 
			email: loginData?.email || mp.storage.data.login || '',
			password: loginData?.password || ''
		});
		gangZones.load();
	}

	private onLogin(email: string) {
		mp.storage.update({ login: email });

		setInterval(() => mp.discord.update('Joaca', 'pe EMPIRERP.RO'), 10000);
		mp.gui.chat.push(`Bun venit pe Empire Romania RolePlay`);
		//mp.gui.chat.push(`!{FF7600}Informatii utile - https://empirerp.eu`);		

		hud.updateOnline();
		hud.setPlayerId();

		if (player.getVariable('isNewbie')) {
			return mp.events.callServer('Character-ShowCreator');
		}

		//mp.browsers.showPage('daily');
		mp.events.callServer('Spawn-ShowMenu');
		player.freezePosition(false);
	}

	private onRegister(email: string) {
		mp.storage.update({ login: email });
	}
}

const auth = new Auth();
