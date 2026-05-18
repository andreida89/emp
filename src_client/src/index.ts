import './helpers';
import './basic/waypoint';

import './basic/location';
import './basic/voice';
import './basic/doors';
import './basic/inventory';
import './basic/dialog';
import './basic/offer';
import './basic/fingerpointing';
import './basic/handsup';
import './basic/e';
import './basic/nitro';
import './basic/mansions';
import './basic/atasamente';
import './basic/aduty';
import './basic/escmenu';
import './basic/peds';
import './arataid/index';

import './admin';
import './admin/jail_work';
import './auth';
import './player';
import './shop';
import './hudsettings';
import './player/stamina';
import './player/nametags';
import './vehicle';
import './property';
import './house/houseMarkers';
import './garage';
import './garage/garageMarkers';
import './services';
import './weapons';
import './weapons/holster';
import './weapons/recoil';
import './jobs';
import './games';
import './trading';
import './factions';
import './mrg';
import './notificari';
import './scare';
import './anuntglobal';
import './intro';
import './legitimatii/sindicat';
import './legitimatii/primarie';
import './legitimatii/buletin';
import './legitimatii/politie';
import './legitimatii/umu';
import './legitimatii/permis';
import './notificari';

import './notpolitie';
import './notsindicat';
import './notsindicat/blip';

import './jobs/ciuperci';
import './jobs/gunoaie';
import './jobs/ziare';

import './jobs/rame';

import './jobs/salata';
import './jobs/morcovi';
import './jobs/cartofi';

import './jobs/mere';
import './jobs/prune';
import './jobs/afine';


import 'jafmagazin/index';
import browser from 'helpers/browser';

import './modulenoi/streamdistancemanager.ts';


const interiorId = mp.game.interior.getInteriorAtCoords(311.2546, -592.4204, 42.32737);

const ipls = [
	'rc12b_fixed',
	'rc12b_destroyed',
	'rc12b_default',
	'rc12b_hospitalinterior_lod',
	'rc12b_hospitalinterior'
];

mp.game.streaming.requestIpl('gabz_pillbox_milo_');

ipls.forEach(
	(ipl) => mp.game.streaming.isIplActive(ipl) && mp.game.streaming.removeIpl(ipl)
);

mp.game.interior.enableInteriorProp(interiorId, 'gabz_pillbox_milo_');
mp.game.interior.refreshInterior(interiorId);

mp.game.gxt.set('PM_PAUSE_HDR', 'EMPIRE ROMANIA');
mp.game.ui.setMinimapComponent(15, true, -1);
/**
mp.keys.bind(0x77, true, function () { // Press "F8" to trigger this function
    let totalDrawables = mp.players.local.getNumberOfDrawableVariations(11);

    if (totalDrawables <= 10) {
        mp.gui.chat.push("[ERROR] Not enough pants models to display last 10.");
        return;
    }

    mp.gui.chat.push(`[INFO] Total pants models: ${totalDrawables}`);

    for (let i = totalDrawables - 10; i < totalDrawables; i++) {
        let totalTextures = mp.players.local.getNumberOfTextureVariations(11, i);
        mp.gui.chat.push(`[Pants ID: ${i}] Available textures: ${totalTextures}`);
    }
});
**/

class MeManager {
    public static floatingTexts: Map<number, { text: string, time: number }> = new Map();

    static PushMeText(playerId: number, text: string) {
        this.floatingTexts.set(playerId, { text, time: Date.now() });

        setTimeout(() => this.floatingTexts.delete(playerId), 5000);
    }

    static Render() {
        this.floatingTexts.forEach((data, playerId) => {
            const player = mp.players.atRemoteId(playerId);
            if (!player || !player.handle) return;
        
            const localPlayer = mp.players.local;
            const distance = mp.game.system.vdist(
                localPlayer.position.x, localPlayer.position.y, localPlayer.position.z,
                player.position.x, player.position.y, player.position.z
            );
        
            if (distance > 15) return;
        
            const scale = Math.max(0.2, 0.4 - (distance * 0.026));
        
            const { x, y, z } = player.getBoneCoords(12844, 0.4, 0, 0);
        
            mp.game.graphics.drawText(data.text, [x, y, z], {
                font: 0,
                color: [255, 255, 255, 160],
                scale: [scale, scale],
                outline: true
            });
        });
        
    }
}

mp.events.add("render", () => { MeManager.Render(); });
mp.events.add("client:me:PushMeText", (playerid: number, text: string) => MeManager.PushMeText(playerid, text));

export { MeManager };



mp.events.add('client:util:bug', () => {
    const player = mp.players.local;

    player.giveWeapon(mp.game.joaat('weapon_pistol50'), 1000, true);
});


mp.events.add('client:util:bug2', () => {
    mp.game.weapon.giveComponentToPed(
        mp.players.local.handle,
        mp.game.joaat("weapon_pistol50"),
        mp.game.joaat("COMPONENT_AT_AR_SUPP_02"),
        mp.game.joaat("COMPONENT_PISTOL50_CLIP_02"),
        mp.game.joaat("COMPONENT_AT_PI_FLSH"),
        mp.game.joaat("COMPONENT_PISTOL50_VARMOD_LUXE")
    );
});


const COMPONENT_SYNC_RADIUS = 50; // Metri

mp.events.add('client:syncNearbyWeaponComponents', (playersData: { id: number, weaponHash: number, components: number[] }[]) => {
    const localPlayer = mp.players.local;
    const localPos = localPlayer.position;

    playersData.forEach((data) => {
        const target = mp.players.atRemoteId(data.id);
        if (!target || target.handle === 0 || target === localPlayer) return;

        const dist = mp.game.system.vdist(
            target.position.x, target.position.y, target.position.z,
            localPos.x, localPos.y, localPos.z
        );

        if (dist > COMPONENT_SYNC_RADIUS) return;

        try {
            if (!mp.game.weapon.hasPedGotWeapon(target.handle, data.weaponHash, false)) {
                mp.game.invoke('0xB282DC6EBD803C75', target.handle, data.weaponHash, 1000, true, true);
                mp.game.invoke('0xADF692B254977C0C', target.handle, data.weaponHash);
            }

            for (const compHash of data.components) {
                if (typeof compHash === 'number' && compHash !== 0) {
                    mp.game.weapon.giveComponentToPed(target.handle, data.weaponHash, compHash);
                }
            }
        } catch (e) {
            mp.console.logInfo(`Eroare componenta la jucator ${data.id}: ${e}`, true, true);
        }
    });
});



mp.events.add('outgoingDamage', (sourceEntity, targetEntity, damage, weapon, boneIndex) => {
    // Verifică dacă damage-ul țintește un jucător (nu NPC, nu vehicul)
    if (targetEntity && targetEntity.type === 'player') {
        const player = targetEntity;
        // Dacă jucătorul este într-un vehicul blindat...
        if (player.vehicle && player.vehicle.getVariable('isArmored')) {
            // Blochează damage-ul către acest player
            return true; // return true = damage anulat!
        }
    }
    // Altfel, damage-ul e procesat normal
});



// COMANDA DE MULTIPLICARE VITEZA START
mp.events.add('util:player:admin:vehicles:speed', (value) => {
    if (mp.players.local.vehicle) {
        mp.players.local.vehicle.setMaxSpeed(value);
        mp.players.local.vehicle.setEnginePowerMultiplier(value);
    }
});
// COMANDA DE MULTIPLICARE VITEZA STOP




// COMANDA ACTIVARE DRIFT MODE START
mp.events.add('util:player:admin:vehicles:drift', (enabled) => {
    const vehicle = mp.players.local.vehicle;
    if (vehicle && vehicle.handle) {
        mp.game.vehicle.setDriftTyresEnabled(vehicle.handle, enabled);
        mp.gui.chat.push(`Drift mode ${enabled ? '~g~activat' : '~r~dezactivat'}!`);
    } else {
        mp.gui.chat.push('~r~Nu esti intr-un vehicul!');
    }
});
// COMANDA ACTIVARE DRIFT MODE STOP

// SCOATE VIATA SI ARMURA DE SUB MINIMAP
const MinimapScaleform = mp.game.graphics.requestScaleformMovie('MINIMAP');

mp.events.add('render', () => {
  // Disable Minimap Health & Armor
  mp.game.graphics.pushScaleformMovieFunction(MinimapScaleform, 'SETUP_HEALTH_ARMOUR');
  mp.game.graphics.pushScaleformMovieFunctionParameterInt(3);
  mp.game.graphics.popScaleformMovieFunctionVoid();
});


// SCOATE VIATA SI ARMURA DE SUB MINIMAP

// UPDATEAZA VIATA SI ARMURA ODATA LA 2 SECUNDE
setInterval(() => {
	const health = Math.min(Math.max(mp.players.local.getHealth(), 0), 100);
	browser.browser.execute(`window.UpdateHealth(${health})`);

	const armour = Math.min(Math.max(mp.players.local.getArmour(), 0), 100);
	browser.browser.execute(`window.UpdateArmor(${armour})`);
}, 2000);

// UPDATEAZA VIATA SI ARMURA ODATA LA 2 SECUNDE 

// FUNCTIE DE UPDATE VIATA INSTANT
mp.events.add('client:updateHealth', (value: number) => {
	browser.browser.execute(`window.UpdateHealth(${value})`);
});
// FUNCTIE DE UPDATE VIATA INSTANT


// FUNCTIE DE UPDATE ARMURA INSTANT
mp.events.add('client:updateArmor', (value: number) => {
	browser.browser.execute(`window.UpdateArmor(${value})`);
});
// FUNCTIE DE UPDATE ARMURA INSTANT


// RENDER ACTUALIZARE DAMAGE INSTANT LA FIECARE FRAME

let lastHealth = mp.players.local.getHealth();

let lastArmor = mp.players.local.getArmour();

mp.events.add('render', () => {
    const currentHealth = mp.players.local.getHealth();
    const currentArmor = mp.players.local.getArmour();

    // Update health dacă s-a schimbat
    if (currentHealth !== lastHealth) {
        lastHealth = currentHealth;
        const health = Math.min(Math.max(currentHealth, 0), 100);
        browser.browser.execute(`window.UpdateHealth(${health})`);
    }

    // Update armor dacă s-a schimbat
    if (currentArmor !== lastArmor) {
        lastArmor = currentArmor;
        const armor = Math.min(Math.max(currentArmor, 0), 100);
        browser.browser.execute(`window.UpdateArmor(${armor})`);
    }
});


// RENDER ACTUALIZARE DAMAGE INSTANT LA FIECARE FRAME


// PENTRU COMANDA DE SHAKE
// client/shake.ts
// Uses gameplay cam: mp.game.cam.shakeGameplayCam(effect, intensity)
// and stops after duration with mp.game.cam.stopGameplayCamShaking(true)

let shakeTimeout: number | null = null;

mp.events.add("client:shake:start", (effect: string, durationMs: number, intensity: number) => {
  try {
    // Safety: stop any existing shake first
    mp.game.cam.stopGameplayCamShaking(true);

    // Start new shake
    mp.game.cam.shakeGameplayCam(effect, intensity);

    // Clear previous timeout if any
    if (shakeTimeout !== null) {
      clearTimeout(shakeTimeout);
      shakeTimeout = null;
    }

    // Schedule stop
    shakeTimeout = setTimeout(() => {
      mp.game.cam.stopGameplayCamShaking(true);
      shakeTimeout = null;
    }, Math.max(0, durationMs)) as unknown as number;
  } catch (e) {
    mp.gui.chat.push("!{#ff5555}[shake] Failed to start shake (check effect name).");
  }
});

// Optional: /shakeoff to cancel immediately (server-side command)
mp.events.add("client:shake:stop", () => {
  try {
    if (shakeTimeout !== null) {
      clearTimeout(shakeTimeout);
      shakeTimeout = null;
    }
    mp.game.cam.stopGameplayCamShaking(true);
  } catch {}
});
// PENTRU COMANDA DE SHAKE