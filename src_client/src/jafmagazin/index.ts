import peds from 'data/peds.json';

mp.keys.bind(0x45, true, () => {
	const handle = mp.game.player.getEntityIsFreeAimingAt();
	const ped = mp.peds.toArray().find(p => p.handle === handle);
	if (!ped) return;

	const pedIndex = peds.findIndex(p => mp.game.joaat(p.model) === ped.model);
	if (pedIndex === -1) return;

	const pedPosition = ped.getCoords(true);
	mp.events.callRemote("startStoreRobbery", pedIndex, pedPosition);
});

// ======================= //
// Sistem de ALERTE JAFURI //
// ======================= //

interface RobberyAlert {
	radiusBlip: BlipMp;
	waypointBlip: BlipMp | null;
	interval: NodeJS.Timeout;
}

const activeRobberyAlerts: Map<string, RobberyAlert> = new Map();

mp.events.add('client:robberyAlert', (position: Vector3) => {
	const key = `${position.x.toFixed(2)}_${position.y.toFixed(2)}_${position.z.toFixed(2)}`;

	const existing = activeRobberyAlerts.get(key);
	if (existing) {
		existing.radiusBlip?.destroy();
		existing.waypointBlip?.destroy();
		clearInterval(existing.interval);
		activeRobberyAlerts.delete(key);
	}

	const radiusBlip = mp.blips.new(9, position, {
		scale: 1,
		color: 1,
		alpha: 150,
		shortRange: false
	});
	radiusBlip.setFlashes(true);

	setTimeout(() => {
		radiusBlip?.destroy();
	}, 10000);

	// === Waypoint dezactivat temporar ===
	// const waypointBlip = mp.blips.new(1, position, {
	// 	scale: 1,
	// 	color: 1,
	// 	shortRange: false
	// });
	// waypointBlip.setRoute(true);
	// waypointBlip.setRouteColour(1);
	const waypointBlip: BlipMp | null = null;

	const interval = setInterval(() => {
		const localPos = mp.players.local.position;
		const dist = mp.game.system.vdist(
			localPos.x, localPos.y, localPos.z,
			position.x, position.y, position.z
		);

		if (dist < 10) {
			waypointBlip?.destroy();
			clearInterval(interval);
			activeRobberyAlerts.delete(key);
		}
	}, 1000);

	activeRobberyAlerts.set(key, {
		radiusBlip,
		waypointBlip,
		interval
	});
});
