const JAIL_COORDS = new mp.Vector3(3080.15, -4776.47, 6.08);
const JAIL_DIMENSION = 10000;
const FINISH_COORDS = new mp.Vector3(961.12, -2111.89, 31.95);

const MARKER_COORDS = [
    { x: 3081.30, y: -4787.73, z: 6.08 },
    { x: 3084.87, y: -4778.35, z: 6.08 },
    { x: 3072.50, y: -4759.69, z: 6.08 },
    { x: 3081.47, y: -4746.80, z: 6.08 },
    { x: 3061.79, y: -4743.02, z: 6.08 },
    { x: 3080.68, y: -4726.54, z: 6.0 },
    { x: 3060.41, y: -4727.11, z: 6.08 },
    { x: 3071.77, y: -4709.34, z: 6.08 },
    { x: 3059.78, y: -4713.16, z: 6.63 },
    { x: 3071.99, y: -4697.41, z: 6.08 },
    { x: 3060.43, y: -4690.86, z: 6.08 },
    { x: 3042.46, y: -4684.30, z: 6.08 },
    { x: 3070.79, y: -4680.52, z: 10.74 },
    { x: 3073.69, y: -4691.18, z: 10.74 },
    { x: 3077.11, y: -4704.13, z: 10.74 },
    { x: 3079.93, y: -4715.65, z: 10.74 },
    { x: 3083.84, y: -4729.26, z: 10.74 },
    { x: 3087.49, y: -4742.89, z: 10.74 },
    { x: 3093.17, y: -4753.68, z: 6.08 },
    { x: 3066.44, y: -4773.14, z: 6.08 },
    { x: 3087.99, y: -4778.29, z: 6.08 },
    { x: 3081.13, y: -4807.94, z: 7.08 },
    { x: 3093.27, y: -4801.71, z: 7.08 },
    { x: 3083.83, y: -4796.04, z: 6.08 },
    { x: 3062.92, y: -4760.29, z: 6.08 }
];


class JailWork {
	private checkpointsLeft: number = 0;
	private currentMarkerIndex: number = 0;
	private marker: MarkerMp | null = null;
	private blip: BlipMp | null = null;
	private isWorking: boolean = false;

	constructor() {
		mp.events.add('client:admin:jail', (count: number) => {
			this.startJail(count);
		});

		mp.keys.bind(0x45, true, () => {
			if (this.checkpointsLeft > 0 && !this.isWorking) {
				const pos = mp.players.local.position;
				const target = MARKER_COORDS[this.currentMarkerIndex];
				const dist = mp.game.gameplay.getDistanceBetweenCoords(
					pos.x,
					pos.y,
					pos.z,
					target.x,
					target.y,
					target.z,
					true
				);

				if (dist < 2.0) {
					this.doWork();
				}
			}
		});
	}

	private startJail(count: number) {
		this.checkpointsLeft = count;
		this.currentMarkerIndex = 0;
		this.isWorking = false;
		
		this.createMarker();
		
		mp.game.graphics.notify('~r~Ai fost trimis la inchisoare! ~w~Finalizeaza munca pentru a iesi.');
	}

	private createMarker() {
		this.destroyMarker();

		if (this.checkpointsLeft <= 0) {
			this.finish();
			return;
		}

		const pos = MARKER_COORDS[this.currentMarkerIndex];
		
		this.marker = mp.markers.new(0, new mp.Vector3(pos.x, pos.y, pos.z), 1.0, {
			color: [255, 255, 0, 100],
			visible: true,
			dimension: JAIL_DIMENSION
		});

		this.blip = mp.blips.new(1, new mp.Vector3(pos.x, pos.y, pos.z), {
			name: 'Munca Inchisoare',
			color: 5,
			scale: 0.8,
			shortRange: false,
			dimension: JAIL_DIMENSION
		});
		this.blip.setRoute(true);
	}

	private destroyMarker() {
		if (this.marker) {
			this.marker.destroy();
			this.marker = null;
		}
		if (this.blip) {
			this.blip.destroy();
			this.blip = null;
		}
	}

	private async doWork() {
		this.isWorking = true;
		const player = mp.players.local;

		const animDict = 'amb@world_human_hammering@male@base';
		mp.game.streaming.requestAnimDict(animDict);
		while (!mp.game.streaming.hasAnimDictLoaded(animDict)) mp.game.wait(0);

		player.freezePosition(true);
		player.taskPlayAnim(animDict, 'base', 8.0, 1.0, -1, 1, 0, false, false, false);
		
		mp.game.graphics.notify('Repari... (5s)');

		setTimeout(() => {
			player.stopAnimTask('amb@world_human_hammering@male@base', 'base', 3.0);
			player.freezePosition(false);
			
			this.checkpointsLeft--;
			mp.events.callRemote('server:admin:jailUpdate', this.checkpointsLeft);
			
			this.currentMarkerIndex++;
			if (this.currentMarkerIndex >= MARKER_COORDS.length) {
				this.currentMarkerIndex = 0;
			}

			this.isWorking = false;
			this.createMarker();
			
			if (this.checkpointsLeft > 0) {
				mp.game.graphics.notify(`Mai ai ~y~${this.checkpointsLeft} ~w~puncte de reparat.`);
			}
		}, 5000);
	}

	private finish() {
		mp.events.callRemote('server:admin:jailFinish');
		mp.game.graphics.notify('~g~Ti-ai ispasit pedeapsa. Esti liber!');
	}
}

new JailWork();
