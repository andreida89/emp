import browser from 'helpers/browser';

// =======================
//  Stamina System (100ms)
// =======================

const MAX_STAMINA = 100;
const SPRINT_DRAIN_SECONDS = 10;
const REGEN_SECONDS = 30;
const TICK_MS = 100;
const EPS = 0.01;

const DRAIN_RATE = MAX_STAMINA / SPRINT_DRAIN_SECONDS;
const REGEN_RATE = MAX_STAMINA / REGEN_SECONDS;

let stamina = MAX_STAMINA;
let sprintLocked = false;
let lastTick = Date.now();
let announcedLock = false;
let announcedUnlock = false;

function clamp(v: number, min: number, max: number) {
    return Math.min(max, Math.max(min, v));
}

function isOnFoot(): boolean {
    const me = mp.players.local;
    return me && me.getHealth() > 0 && !me.vehicle;
}

function getSpeedMS(): number {
    const me = mp.players.local;
    return me ? me.getSpeed() : 0;
}

function isSprintKeyHeld(): boolean {
    return mp.game.controls.isControlPressed(0, 21);
}

function logicTick(deltaSec: number) {
    const speed = getSpeedMS();
    const sprintKey = isSprintKeyHeld();
    const effectivelySprinting = isOnFoot() && sprintKey && speed > 1.0 && !sprintLocked;

    if (effectivelySprinting) {
        stamina = clamp(stamina - DRAIN_RATE * deltaSec, 0, MAX_STAMINA);
        if (stamina <= EPS) {
            stamina = 0;
            sprintLocked = true;
            announcedUnlock = false;
            if (!announcedLock) {
                //mp.gui.chat.push("!{#ff5555}[DEBUG] Sprint LOCKED la stamina 0");
                announcedLock = true;
            }
        }
    } else {
        if (stamina < MAX_STAMINA - EPS) {
            stamina = clamp(stamina + REGEN_RATE * deltaSec, 0, MAX_STAMINA);
        } else {
            stamina = MAX_STAMINA;
        }
    }

    if (sprintLocked && stamina >= MAX_STAMINA - EPS) {
        sprintLocked = false;
        stamina = MAX_STAMINA;
        announcedLock = false;
        if (!announcedUnlock) {
            //mp.gui.chat.push("!{#55ff55}[DEBUG] Sprint UNLOCKED la stamina 100");
            announcedUnlock = true;
        }
    }
}

setInterval(() => {
    const now = Date.now();
    const deltaSec = (now - lastTick) / 1000;
    lastTick = now;
    logicTick(deltaSec);
}, TICK_MS);

let lastStaminaUI = -1;

mp.events.add("render", () => {
    if (sprintLocked) {
        mp.game.controls.disableControlAction(0, 21, true);
    }

    const uiVal = Math.round(stamina);
    if (uiVal !== lastStaminaUI) {
        lastStaminaUI = uiVal;
        try {
            //mp.gui.chat.push(`!{#aaaaaa}[DEBUG] Trimitem in UI stamina: ${uiVal}`);
            browser.browser.execute(`window.UpdateStamina(${uiVal})`);
        } catch (e) {
            //mp.gui.chat.push("!{#ff0000}[DEBUG] Eroare la browser.execute() - UI nu e gata?");
        }
    }
});
