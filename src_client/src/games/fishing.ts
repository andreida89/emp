import browser from 'helpers/browser';

const player = mp.players.local;

class Fishing {
	private active = false;

	constructor() {
		mp.events.subscribe({
			'Fishing-ShowMinigame': this.start.bind(this),
			'Fishing-HideMinigame': this.stop.bind(this),
			'Fishing-Success': this.getFish.bind(this),
			'Fishing-Drop': this.dropFish.bind(this)
		});
	}

	start(fishInfoJson: string, text?: string, durationSec?: number) {
		if (this.active) return;

		this.active = true;

		player.freezePosition(true);

		mp.gui.cursor.show(true, true);
		mp.gui.chat.show(false);
		mp.game.ui.displayRadar(false);

		browser.browser.execute(
			`window.PescarMinigame(${JSON.stringify(fishInfoJson)}, ${JSON.stringify(
				text || 'Se pare ca ceva a muscat!'
			)}, ${durationSec || 0})`
		);

		mp.events.call(
			'AnuntNotification2',
			'Se pare ca ceva a muscat!',
			'verde'
		);
	}

	stop() {
		if (!this.active) return;

		this.active = false;

		player.freezePosition(false);

		mp.browsers.hidePage();
	}

	private getFish(fishData: string) {
		this.stop();

		mp.events.callServer('Fishing-Success', fishData);
	}

	private async dropFish() {
		this.stop();

		await mp.events.callServer('Fishing-Drop');

		mp.events.call(
			'AnuntNotification2',
			'Blestem, pestele a scapat..',
			'rosu'
		);
	}
}

export default new Fishing();