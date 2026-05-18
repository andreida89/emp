import browser from 'helpers/browser';

const activeShotBlips = new Map<string, any>();

mp.events.add('client:politie:shotAlert', (message: string, position: any) => {
	// Notificare UI
	if (browser) {
		browser.execute(`window.AlertaPolitie(${JSON.stringify(message)})`);
	}

	// Blip pe harta
	if (!position || typeof position.x !== 'number') return;

	const key = `${position.x.toFixed(1)}_${position.y.toFixed(1)}`;
	
	if (activeShotBlips.has(key)) {
		const old = activeShotBlips.get(key);
		if (old.blip && mp.game.ui.doesBlipExist(old.blip)) {
			mp.game.ui.removeBlip(old.blip);
		}
		clearTimeout(old.timeout);
	}

	try {
		const blip = mp.game.ui.addBlipForRadius(position.x, position.y, position.z, 140.0);
		
		if (blip) {
			mp.game.ui.setBlipColour(blip, 1); // Rosu
			mp.game.ui.setBlipAlpha(blip, 140);
			mp.game.ui.setBlipFlashes(blip, true);

			const timeout = setTimeout(() => {
				if (mp.game.ui.doesBlipExist(blip)) {
					mp.game.ui.removeBlip(blip);
				}
				activeShotBlips.delete(key);
			}, 10000);

			activeShotBlips.set(key, { blip, timeout });
		}
	} catch (e) {
		// Log error to chat if in debug
	}
});

// Compatibilitate evenimente vechi
mp.events.add('AlertaPolitie', (message: string) => {
	if (browser) browser.execute(`window.AlertaPolitie(${JSON.stringify(message)})`);
});

mp.events.add('client:politie:showShotBlip', (position: any) => {
	mp.events.call('client:politie:shotAlert', "S-au auzit focuri de arma!", position);
});

