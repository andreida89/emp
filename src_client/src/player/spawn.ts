import antiCheat from 'basic/anti-cheat';

const localPlayer = mp.players.local;

class Spawn {
	constructor() {
		mp.events.subscribe({
			'Spawn-ShowMenu': this.showMenu.bind(this)
		});
		mp.events.subscribeToDefault({
			playerSelectSpawn: this.onSelect
		});
	}

	private onSelect() {
		if (localPlayer.getVariable('adminLvl')) return;

		mp.game.audio.stopAudioScene('CHARACTER_CHANGE_IN_SKY_SCENE');
		mp.events.unsubscribeToDefault({ render: this.disableActions });

		antiCheat.init();
	}

	private disableActions = () => {
		mp.game.controls.disableControlAction(0, 200, true); // ESC
		mp.game.controls.disableControlAction(0, 199, true); // ESC
	};

	private showMenu(jail: boolean, houses: number[], faction?: string) {
		mp.game.audio.startAudioScene('CHARACTER_CHANGE_IN_SKY_SCENE');
		mp.events.subscribeToDefault({ render: this.disableActions });

		mp.browsers.showPage('spawn', {
			house: houses.length > 0,
			exit: true,
			start: true,
			org: !!faction,
			jail,
			houses
		});
	}
}

const spawn = new Spawn();

export {};
