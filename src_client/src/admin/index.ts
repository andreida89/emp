import keycode from 'keycode';
import browser from 'helpers/browser';
import './fly';
import './esp';
import './spectator';
import './cam';
import './menu';
 
const player = mp.players.local;

class Admin {
	constructor() {
		mp.events.add('Admin-TriggerReportCountUpdate', () => {
			if (browser.browser) browser.browser.execute('if(window.AdminTicketsUpdate) window.AdminTicketsUpdate();');
		});

		mp.events.add('client:admin:invincible', (state: boolean) => {
			mp.players.local.setInvincible(state);
		});

        mp.events.add('Admin-SetGM', (status: boolean) => {
            this.setInvincible(status);
        });
        
        mp.events.add('Admin-GlobalNotify', (message: string) => {
            this.sendGlobalNotification(message);
        });

        mp.events.add('client:admin:freeze', (state: boolean) => {
            mp.players.local.freezePosition(state);
            mp.players.local.setInvincible(state); // Optional: also make them invincible while frozen
            if (state) {
                mp.game.graphics.notify("~r~Ai fost inghetat de un admin!");
            } else {
                mp.game.graphics.notify("~g~Ai fost dezghetat de un admin!");
            }
        });

		mp.events.subscribe({
			'Admin-SetGM': (status: boolean) => this.setInvincible(status),
			'Admin-GlobalNotify': (message: string) => this.sendGlobalNotification(message)
		});
	}
    private sendGlobalNotification(message: string) {
        mp.events.call('HUD-GlobalNotify', message);
    }
	
    private registerEvents() {
        mp.events.add('Admin-SendPlayerCoords', (targetId, x, y, z) => {
            if (mp.browsers) {
                mp.browsers.callPage('admin', 'updateCoords', { targetId, x, y, z });
            }
        });
    }
	
	private showMenu() {
		const level = player.getVariable('adminLvl');

		if (!level) return;

		const duty = player.getVariable('adminTag');
		if (!duty) {
			mp.game.graphics.notify('~r~Trebuie sa fii ON DUTY (/aduty)!');
			return;
		}

		mp.browsers.showPage('admin', { level });
		mp.browsers.setHideBind(mp.browsers.hidePage);
	}

	private setInvincible(status: boolean) {
		const adminLvl = player.getVariable('adminLvl');

		if (!adminLvl) return;

		player.setInvincible(status);
		//mp.game.graphics.notify(status ? 'GM: ~g~Activat' : 'GM: ~r~Dezactivat');
	}
}

const admin = new Admin();
