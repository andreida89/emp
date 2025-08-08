mp.events.add('server:streamDistance:set', (player: PlayerMp, distance: number) => {
    if (!player || !mp.players.exists(player)) {
        //console.log(`[DEBUG Server] Player invalid sau nu există.`);
        return;
    }
    //console.log(`[DEBUG Server] ${player.name} - setStreamDistance => ${distance}`);
    player.call('client:setStreamDistance', [distance]);
});
