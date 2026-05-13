mp.events.add("playerDeath", (player: PlayerMp) => {
    // In our codebase, the logical player may be used, but the snippet says player.data.isCrouched 
    // Usually we set variables with player.setVariable
    if (player.getVariable("isCrouched")) {
        player.setVariable("isCrouched", false);
    }
});

mp.events.add("toggleCrouch", (player: PlayerMp) => {
    let current = player.getVariable("isCrouched");
    if (current === undefined) {
        player.setVariable("isCrouched", true);
    } else {
        player.setVariable("isCrouched", !current);
    }
});
