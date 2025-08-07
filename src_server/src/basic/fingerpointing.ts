mp.events.add("fpsync.update", (player, camPitch, camHeading) => {
    for (const target of mp.players.toArray()) {
        if (target !== player && target.dist(player.position) < 100) {
            target.call("fpsync.update", [player.id, camPitch, camHeading]);
        }
    }
});


mp.events.add("pointingStop", (player) => {
    player.stopAnimation();
});