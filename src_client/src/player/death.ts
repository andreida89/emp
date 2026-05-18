import effects from 'helpers/effects';
import antiCheat from 'basic/anti-cheat';

const localPlayer = mp.players.local;

class PlayerDeath {
	private timeout?: NodeJS.Timeout;
	private handleE: () => void;
	private handleG: () => void;

	constructor() {
		this.handleE = this.handleEKey.bind(this);
		this.handleG = this.handleGKey.bind(this);
		mp.events.subscribe({
			'Player-ShowDeathMenu': this.showMenu.bind(this),
			'Player-ShowDeathMenuEvent': this.showMenuEvent.bind(this),
			'Player-ClientDie': this.die.bind(this),
			'Player-ClientDieEvent': this.dieevent.bind(this)
		});

		mp.events.subscribeToData({
			isDying: (player: PlayerMp, status: boolean) => {
				if (status || localPlayer.handle !== player.handle) return;

				this.die(false);
			}
		});
	}

	private showMenu(duration: number, medics: number) {
		this.reset();
		this.timeout = setTimeout(this.die.bind(this), duration);

		mp.browsers.showPage('player/death', { duration, medics }, true, true);
		
		mp.keys.bind(0x45, true, this.handleE); // E
		mp.keys.bind(0x47, true, this.handleG); // G
	}

	private handleEKey() {
		// The UI handles the timing, but we can call die if appropriate.
		// However, the UI has the state. It's better if we tell the UI E was pressed.
		mp.events.callBrowser('Death-KeyEvent', 'e');
	}

	private handleGKey() {
		mp.events.callBrowser('Death-KeyEvent', 'g');
	}

	private showMenuEvent(duration: number, medics: number) {
		this.reset();
		this.timeout = setTimeout(this.die.bind(this), duration);
	
		mp.console.logInfo(`Showing death menu. Duration: ${duration}, Medics: ${medics}`);
	
		mp.browsers.showPage('player/deathevent', { duration, medics }, true, true);
		
		mp.keys.bind(0x45, true, this.handleE); // E
		mp.keys.bind(0x47, true, this.handleG); // G
	}

	private async die(remote = true) {
		this.reset();
		effects.stopAll();

		mp.keys.unbind(0x45, true, this.handleE);
		mp.keys.unbind(0x47, true, this.handleG);

		if (remote) {
			//antiCheat.sleep(6000);
			mp.events.callServer('Player-Die');
		}

		mp.browsers.hidePage();
		
		// Force reset dead state in UI
		if (mp.browsers && mp.browsers.browser) {
			mp.browsers.browser.execute('window.isPlayerDead = false;');
		}
	}

	private async dieevent(remote = true) {
		this.reset();
		effects.stopAll();

		mp.keys.unbind(0x45, true, this.handleE);
		mp.keys.unbind(0x47, true, this.handleG);

		if (remote) {
			//antiCheat.sleep(6000);
			mp.events.callServer('Player-DieEvent');
		}

		mp.browsers.hidePage();

		// Force reset dead state in UI
		if (mp.browsers && mp.browsers.browser) {
			mp.browsers.browser.execute('window.isPlayerDead = false;');
		}
	}
	
	private reset() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	}
}

const death = new PlayerDeath();
