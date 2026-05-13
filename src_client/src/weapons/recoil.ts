interface RecoilInfo {
	shake: number;
	automatic: boolean;
}

const recoilData: { [key: string]: RecoilInfo } = {
	"WEAPON_PISTOL_MK2": { shake: 0.10, automatic: false },
	"WEAPON_CERAMICPISTOL": { shake: 0.10, automatic: false },
	"WEAPON_COMBATPISTOL": { shake: 0.03, automatic: false },
	"WEAPON_PISTOL50": { shake: 0.10, automatic: false },
	"WEAPON_SNSPISTOL": { shake: 0.10, automatic: false },
	"WEAPON_HEAVYPISTOL": { shake: 0.10, automatic: false },
	"WEAPON_VINTAGEPISTOL": { shake: 0.10, automatic: false },
	"WEAPON_STUNGUN": { shake: 0.01, automatic: false },
	"WEAPON_FLAREGUN": { shake: 0.01, automatic: false },
	"WEAPON_DOUBLEACTION": { shake: 0.25, automatic: false },
	"WEAPON_NAVYREVOLVER": { shake: 0.4, automatic: false },
	"WEAPON_GADGETPISTOL": { shake: 0.4, automatic: false },
	"WEAPON_APPISTOL": { shake: 0.05, automatic: true },
	"WEAPON_MACHINEPISTOL": { shake: 0.050, automatic: true },
	"WEAPON_MICROSMG": { shake: 0.041, automatic: true },
	"WEAPON_SMG": { shake: 0.055, automatic: true },
	"WEAPON_SMG_MK2": { shake: 0.055, automatic: true },
	"WEAPON_ASSAULTSMG": { shake: 0.035, automatic: true },
	"WEAPON_COMBATPDW": { shake: 0.035, automatic: true },
	"WEAPON_GUSENBERG": { shake: 0.085, automatic: true },
	"WEAPON_MG": { shake: 0.05, automatic: true },
	"WEAPON_COMBATMG": { shake: 0.05, automatic: true },
	"WEAPON_ASSAULTRIFLE_MK2": { shake: 0.035, automatic: true },
	"WEAPON_MILITARYRIFLE": { shake: 0.030, automatic: true },
	"WEAPON_TACTICALRIFLE": { shake: 0.035, automatic: true },
	"WEAPON_CARBINERIFLE": { shake: 0.035, automatic: true },
	"WEAPON_COMPACTRIFLE": { shake: 0.035, automatic: true },
	"WEAPON_SPECIALCARBINE_MK2": { shake: 0.035, automatic: true },
	"WEAPON_BULLPUPRIFLE_MK2": { shake: 0.035, automatic: true },
	"WEAPON_HEAVYRIFLE": { shake: 0.035, automatic: true },
	"WEAPON_ADVANCEDRIFLE": { shake: 0.035, automatic: true },
	"WEAPON_DBSHOTGUN": { shake: 0.55, automatic: false },
	"WEAPON_SAWNOFFSHOTGUN": { shake: 0.48, automatic: false },
	"WEAPON_PUMPSHOTGUN_MK2": { shake: 0.48, automatic: false }
};

let lastShotTime = 0;
let currentDamageModifier = 1.0;
const GADGET_PISTOL_HASH = mp.game.joaat("WEAPON_GADGETPISTOL");
const PISTOL50_HASH = mp.game.joaat("WEAPON_PISTOL50");
const automaticFireRateCooldown = 120;

mp.events.add("render", () => {
	const player = mp.players.local;
	const currentWeapon = player.weapon;

	let targetModifier = 1.0;
	if (currentWeapon === GADGET_PISTOL_HASH) {
		targetModifier = 1.5;
	} else if (currentWeapon === PISTOL50_HASH) {
		targetModifier = 1.4;
	}

	if (targetModifier !== currentDamageModifier) {
		mp.game.player.setWeaponDamageModifier(targetModifier);
		currentDamageModifier = targetModifier;
	}

	if (player.isShooting()) {
		const currentTime = Date.now();
		for (const weaponName in recoilData) {
			const weaponHash = mp.game.joaat(weaponName);
			if (weaponHash === currentWeapon) {
				const recoil = recoilData[weaponName];
				const cooldown = recoil.automatic ? automaticFireRateCooldown : 300;
				if (currentTime - lastShotTime > cooldown) {
					lastShotTime = currentTime;
					if (recoil.shake && recoil.shake > 0) {
						mp.game.cam.shakeGameplayCam("SMALL_EXPLOSION_SHAKE", recoil.shake);
					}
				}
				break;
			}
		}
	}
});

mp.events.add('createWaypointBlip', (x: number, y: number) => {
	mp.game.ui.setNewWaypoint(x, y);
});
