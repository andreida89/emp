import keycode from 'keycode';

const ADDER_HASH = mp.game.joaat('adder');
let isBoosting = false;
let nitroSoundId = -1;

mp.keys.bind(0x50, true, () => {
    // 0x50 is the 'P' key
    const player = mp.players.local;
    if (mp.gui.cursor.visible) return; // nu activa cand chatul sau meniul sunt deschise
    
    const vehicle = player.vehicle;
    if (vehicle && vehicle.getPedInSeat(-1) === player.handle) {
        if (vehicle.model === ADDER_HASH) {
            if (!isBoosting) {
                isBoosting = true;
                mp.game.graphics.startScreenEffect("RaceTurbo", 0, false);
                mp.game.graphics.setTimecycleModifier('rply_motionblur');
                mp.game.cam.shakeGameplayCam('SKY_DIVING_SHAKE', 0.25);

                if (nitroSoundId === -1) {
                    nitroSoundId = mp.game.audio.getSoundId();
                    if (nitroSoundId !== -1) {
                        mp.game.audio.playSoundFromEntity(
                            nitroSoundId,
                            "Boost",
                            vehicle.handle,
                            "DLC_Arena_Boost_Sounds",
                            false,
                            0
                        );
                    }
                }
            }
        }
    }
});

mp.keys.bind(0x50, false, () => {
    stopNitro();
});

function stopNitro() {
    if (isBoosting) {
        isBoosting = false;
        mp.game.graphics.stopScreenEffect("RaceTurbo");
        mp.game.cam.stopGameplayCamShaking(true);
        mp.game.graphics.setTransitionTimecycleModifier('default', 0.35);

        if (nitroSoundId !== -1) {
            mp.game.audio.stopSound(nitroSoundId);
            mp.game.audio.releaseSoundId(nitroSoundId);
            nitroSoundId = -1;
        }
    }
}

let ptfxLoaded = false;
mp.events.add('render', () => {
    if (isBoosting) {
        const player = mp.players.local;
        const vehicle = player.vehicle;
        
        if (!vehicle || vehicle.getPedInSeat(-1) !== player.handle) {
            stopNitro();
            return;
        }

        if (vehicle.model !== ADDER_HASH) {
            stopNitro();
            return;
        }

        if (!mp.game.vehicle.isThisModelACar(vehicle.model) || vehicle.getIsEngineRunning() === false) {
            stopNitro();
            return;
        }

        // Apply Boost
        if (!vehicle.isStopped()) {
            const currentSpeed = vehicle.getSpeed();
            const maximumSpeed = mp.game.vehicle.getVehicleModelMaxSpeed(vehicle.model);
            let multiplier = 2.0 * maximumSpeed / (currentSpeed > 0.5 ? currentSpeed : 0.5);
            
            // Limit multiplier to avoid flying into space
            if (multiplier > 5.0) multiplier = 5.0;

            vehicle.setEngineTorqueMultiplier(multiplier);
        }

        // Apply Exhaust Flame particles
        const ptfxAsset = "core";
        if (!mp.game.streaming.hasNamedPtfxAssetLoaded(ptfxAsset)) {
            mp.game.streaming.requestNamedPtfxAsset(ptfxAsset);
        } else {
            ptfxLoaded = true;
            
            const exhaustNames = [
                "exhaust", "exhaust_2", "exhaust_3", "exhaust_4"
            ];
            
            for (const name of exhaustNames) {
                const boneIndex = vehicle.getBoneIndexByName(name);
                if (boneIndex !== -1) {
                    const pos = vehicle.getWorldPositionOfBone(boneIndex);
                    const off = vehicle.getOffsetFromGivenWorldCoords(pos.x, pos.y, pos.z);
                    
                    if (Math.random() < 0.3) { // limit particles
                        mp.game.graphics.setPtfxAssetNextCall(ptfxAsset);
                        mp.game.graphics.startParticleFxNonLoopedOnEntity(
                            "veh_backfire",
                            vehicle.handle,
                            off.x, off.y, off.z,
                            0.0, 0.0, 0.0,
                            1.25,
                            false, false, false
                        );
                    }
                }
            }
        }
    }
});
