import jucator from 'helpers/players';

mp.events.add('server:eyes:getids', (player: PlayerMp) => {
    mp.players.forEachInRange(player.position, 15, (target) => {
        if (target !== player) {
            const targetData = jucator.get(target.id);
            if (!targetData || !targetData.fixId) return;

            player.call('client:key:eyes', [targetData.fixId, target.id, 2000]);
        }

        target.call('client:me:PushMeText', [player.id, '* Se scarpina la ochi', 2000]);
    });
});
