import keycode from 'keycode';
import './fly';
import './esp';
import './spectator';
import './cam';

const player = mp.players.local;

class Admin {
	constructor() {
		mp.keys.bind(+keycode('F4'), false, this.showMenu);

		mp.events.subscribe({
			'Admin-SetGM': this.setInvincible,
			'Admin-GlobalNotify': this.sendGlobalNotification
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

		mp.browsers.showPage('admin', { level });
		mp.browsers.setHideBind(mp.browsers.hidePage);
	}

	private setInvincible(status: boolean) {
		const adminLvl = player.getVariable('adminLvl');

		if (!adminLvl) return;

		player.setInvincible(status);
		mp.game.graphics.notify(status ? 'GM: ~g~Activat' : 'GM: ~r~Dezactivat');
	}
}

const admin = new Admin();
