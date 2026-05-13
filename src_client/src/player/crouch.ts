const movementClipSet = "move_ped_crouched";
const strafeClipSet = "move_ped_crouched_strafing";
const clipSetSwitchTime = 0.25;

let clipSetsLoaded = false;

const loadClipSets = async () => {
    mp.game.streaming.requestClipSet(movementClipSet);
    mp.game.streaming.requestClipSet(strafeClipSet);
    
    while (!mp.game.streaming.hasClipSetLoaded(movementClipSet) || !mp.game.streaming.hasClipSetLoaded(strafeClipSet)) {
        await mp.game.waitAsync(0);
    }
    clipSetsLoaded = true;
};

// load clip sets
loadClipSets();

// apply clip sets if streamed player is crouching
mp.events.add("entityStreamIn", (entity: EntityMp) => {
    if (entity.type === "player" && entity.getVariable("isCrouched") && clipSetsLoaded) {
        (entity as PlayerMp).setMovementClipset(movementClipSet, clipSetSwitchTime);
        (entity as PlayerMp).setStrafeClipset(strafeClipSet);
    }
});

// apply/reset clip sets when isCrouched changes for a streamed player
mp.events.addDataHandler("isCrouched", (entity: EntityMp, value: any) => {
    if (entity.type === "player" && clipSetsLoaded) {
        if (value) {
            (entity as PlayerMp).setMovementClipset(movementClipSet, clipSetSwitchTime);
            (entity as PlayerMp).setStrafeClipset(strafeClipSet);
        } else {
            (entity as PlayerMp).resetMovementClipset(clipSetSwitchTime);
            (entity as PlayerMp).resetStrafeClipset();
        }
    }
});

// Disable native duck (Ctrl)
mp.events.add("render", () => {
    mp.game.controls.disableControlAction(0, 36, true);
});

// CTRL key to toggle crouching
mp.keys.bind(0x11, false, () => {
    mp.events.callRemote("toggleCrouch");
});
