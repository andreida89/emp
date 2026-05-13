import rpc from 'rage-rpc';
import User from '../models/User';
import Character from '../models/Character';
import Vehicle from '../models/Vehicle';
import factions from '../factions';
import jucator from '../helpers/players';

mp.events.add("playerCommand", (player, command) => {
    let args = command.split(" ");
    let animName = args[1];

    if (args[0] === "e") {
        if (!animName) {
            player.outputChatBox("Folosește: /e [nume animatie]");
            return;
        }

        if (animName === "c") {
            player.call("animation.stop");

            for (const target of mp.players.toArray()) {
                if (target !== player && target.dist(player.position) < 100) {
                    target.call("animation.sync", [player.id, null, false]);
                }
            }
        } else {
            player.call("animation.play", [animName]);

            for (const target of mp.players.toArray()) {
                if (target !== player && target.dist(player.position) < 100) {
                    target.call("animation.sync", [player.id, animName, true]);
                }
            }
        }
    }
});

