mp.events.add("handsup.sync", (player, state) => {
    // ✅ DEBUG: vezi dacă acest event ajunge la server
    console.log(`[HANDS-UP] ${player.name} = ${state}, notifying others`);

    player.setVariable("handsUp", state);

    // ✅ Trimite către ceilalți jucători din apropiere (nu folosi streamedPlayers)
    for (const target of mp.players.toArray()) {
        if (target !== player && target.dist(player.position) < 100) {
            target.call("handsup.sync", [player.id, state]);
        }
    }
});
