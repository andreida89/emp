let handsUp = {
    active: false,

toggle: function () {
    const player = mp.players.local;

    if (player.isInAnyVehicle(false)) return;

    if (!this.active) {
        mp.game.streaming.requestAnimDict("random@mugging3");
        while (!mp.game.streaming.hasAnimDictLoaded("random@mugging3")) {
            mp.game.wait(0);
        }

        player.taskPlayAnim("random@mugging3", "handsup_standing_base", 8.0, 0, -1, 49, 0, false, false, false);
        this.active = true;
    } else {
        player.clearTasksImmediately();
        this.active = false;
    }

    // ✅ Trimite la server
    mp.events.callRemote("handsup.sync", this.active);

    // ✅ Execută sincronizarea și local (self)
    mp.events.call("handsup.sync", player.remoteId, this.active);
}

};

// Bind X key (0x58) to toggle hands up
mp.keys.bind(0x58, true, () => {
    if (!mp.gui.cursor.visible) {
        handsUp.toggle();
    }
});

// Sync hands up for other players
mp.events.add("handsup.sync", (playerId, state) => {
    let player = mp.players.atRemoteId(playerId);
    if (player) {
        if (state) {
            mp.game.streaming.requestAnimDict("random@mugging3");
            while (!mp.game.streaming.hasAnimDictLoaded("random@mugging3")) {
                mp.game.wait(0);
            }
            player.taskPlayAnim("random@mugging3", "handsup_standing_base", 8.0, 0, -1, 49, 0, false, false, false);
        } else {
            player.clearTasksImmediately();
        }
    }
});
