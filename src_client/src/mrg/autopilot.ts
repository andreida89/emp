const localPlayer = mp.players.local;
let autoPilotActivated = false;
let autoPilotColshape = null;

const vehiclesHaveAutopilot = ["chiron19", "agerars"]; // Vehicule compatibile cu Autopilot

mp.keys.bind(0x76, true, function () { // F7
    if (localPlayer.vehicle) {
        const currentModel = localPlayer.vehicle.model;
        const isAutopilotCapable = vehiclesHaveAutopilot.some(v => mp.game.joaat(v) === currentModel);

        if (!isAutopilotCapable) {
            return mp.gui.chat.push("Acest vehicul nu are autopilot.");
        }

        if (localPlayer.vehicle.getPedInSeat(-1) === localPlayer.handle && !autoPilotActivated) {
            if (!localPlayer.vehicle.getIsEngineRunning()) {
                mp.gui.chat.push("Autopilotul nu poate fi folosit cu motorul oprit.");
                return;
            }

            if (mp.game.invoke('0x1DD1F58F493F1DA5')) { // IS_WAYPOINT_ACTIVE
                let blipID = mp.game.invoke('0x186E5D252FA50E7D'); // _GET_BLIP_INFO_ID_ITERATOR
                let firstBlip = mp.game.invoke('0x1BEDE233E6CD2A1F', blipID); // GET_FIRST_BLIP_INFO_ID
                let nextBlip = mp.game.invoke('0x14F96AA50D6FBEA7', blipID); // GET_NEXT_BLIP_INFO_ID

                for (let i = firstBlip; mp.game.invoke('0xA6DB27D19ECBB7DA', i) !== 0; i = nextBlip) { // DOES_BLIP_EXIST
                    if (mp.game.invoke('0xBE9B0959FFD0779B', i) === 4) { // GET_BLIP_INFO_ID_TYPE (Waypoint)
                        let coord = mp.game.ui.getBlipInfoIdCoord(i);

                        if (coord) {
                            localPlayer.taskVehicleDriveToCoordLongrange(
                                localPlayer.vehicle.handle,
                                coord.x, coord.y, 0.0,
                                32.5, // Speed
                                2883621, // Driving style
                                40.0 // Stopping range
                            );

                            mp.gui.chat.push("Autopilot pornit!");
                            autoPilotActivated = true;

                            if (autoPilotColshape !== null) autoPilotColshape.destroy();
                            autoPilotColshape = mp.colshapes.newCircle(coord.x, coord.y, 15.0, localPlayer.dimension);
                        }

                        return;
                    }
                }
            } else {
                mp.gui.chat.push("Plasează un marker pe hartă pentru a activa autopilotul.");
            }
        } else if (autoPilotActivated) {
            stopAutopilot();
            mp.gui.chat.push("Autopilot oprit!");
        }
    }
});

mp.events.add('playerEnterVehicle', () => {
    if (localPlayer.vehicle) stopAutopilot(false);
});

mp.events.add('vehicleEngineHandler', () => {
    if (localPlayer.vehicle) stopAutopilot();
});

mp.events.add("playerEnterColshape", (shape) => {
    if (shape === autoPilotColshape) {
        stopAutopilot();
        mp.gui.chat.push("Ai ajuns la destinație!");
    }
});

function stopAutopilot(stopVehicle = true) {
    if (autoPilotActivated) {
        if (localPlayer.vehicle) {
            if (stopVehicle) localPlayer.vehicle.setVelocity(0.0, 0.0, 0.0);
            localPlayer.clearTasks();
        }

        if (autoPilotColshape !== null) {
            autoPilotColshape.destroy();
            autoPilotColshape = null;
        }

        autoPilotActivated = false;
    }
}
