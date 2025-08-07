import factions from 'factions';
import peds from 'data/peds.json';

let lastGlobalRobberyTimestamp = 0;
const ROBBERY_COOLDOWN_MS = 2 * 60 * 1000; // 1 ora

mp.events.add('startStoreRobbery', (player, pedIndex: number, pedPosition: Vector3Mp) => {
	const pedData = peds[pedIndex];
	if (!pedData || pedData.model !== 'mp_m_shopkeep_01') return;

	const now = Date.now();
	if (now - lastGlobalRobberyTimestamp < ROBBERY_COOLDOWN_MS) {
		player.call('AnuntNotification2', ['Un jaf este deja in desfasurare sau perioada de cooldown global (1 ora) nu s-a incheiat. Incearca mai tarziu.', 'roz']);
		return;
	}

	const lspdFaction = Object.values(factions.items).find(f => f.name.toLowerCase() === 'lspd');
	if (!lspdFaction) {
		console.log("Eroare: nu am gasit factiunea LSPD");
		return;
	}

	const lspdOnlineCount = mp.players.toArray().filter(p =>
		p.faction === lspdFaction.id && p.getVariable('inServicePolice') === true
	).length;

	if (lspdOnlineCount < 1) {
		player.call('AnuntNotification2', ['Nu sunt destui politisti in serviciu! Este nevoie de minim 1!', 'rosu']);
		return;
	}

	mp.players.forEach((p) => {
		if (p.faction === lspdFaction.id && p.getVariable('inServicePolice') === true) {
			p.call('AlertaPolitie', ['JAF IN DESFASURARE IN ZONA MARCATA PE HARTA!']);
			p.call('client:robberyAlert', [pedPosition]);
		}
	});

	lastGlobalRobberyTimestamp = now;
	player.call('AnuntNotification2', ['JAFUL A INCEPUT SI POLITIA A FOST ALERTATA! GRABESTE-TE!', 'galben']);
});
