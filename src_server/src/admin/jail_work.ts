import jucator from 'helpers/players';
import permissions from './permissions';
import chat from 'basic/chat';
import Character from 'models/Character';

const JAIL_COORDS = { x: 3080.15, y: -4776.47, z: 6.08 };
const JAIL_DIMENSION = 10000;
const FINISH_COORDS = { x: 961.12, y: -2111.89, z: 31.95 };

/**
 * =========================
 *  SERVER EVENTS (FIXED)
 * =========================
 */

mp.events.add("server:admin:jailUpdate", async (player: PlayerMp, checkpoints: number) => {
    player.setVariable('jailCheckpoints', checkpoints);

    const logicPlayer = jucator.get(player.id);
    if (logicPlayer?.dbId) {
        await Character.updateOne(
            { _id: logicPlayer.dbId },
            { $set: { jailCheckpoints: checkpoints } }
        );
    }
});

mp.events.add("server:admin:jailFinish", async (player: PlayerMp) => {
    console.log('jailFinish OK');

    player.dimension = 0;
    player.position = new mp.Vector3(
        FINISH_COORDS.x,
        FINISH_COORDS.y,
        FINISH_COORDS.z
    );

    player.setVariable('jailCheckpoints', 0);
    player.setVariable('isJailed', false);

    const logicPlayer = jucator.get(player.id);
    const dbId = logicPlayer?.dbId || player.dbId;

    if (dbId) {
        await Character.updateOne(
            { _id: dbId },
            {
                $set: {
                    adminJail: false,
                    jailCheckpoints: 0
                }
            }
        );
    }
});

/**
 * =========================
 *  FUNCTION (ADMIN JAIL)
 * =========================
 */

export const jailPlayer = (admin: Player, targetId: string, checkpoints: number) => {
    if (!permissions.hasPermission(admin, 'helper')) return;

    const target = mp.players.toCustomArray()
        .find(p => p.fixId === parseInt(targetId));

    if (!target) return;

    target.mp.dimension = JAIL_DIMENSION;
    target.mp.position = JAIL_COORDS;

    target.mp.setVariable('jailCheckpoints', checkpoints);
    target.mp.setVariable('isJailed', true);

    Character.updateOne(
        { _id: target.dbId },
        {
            $set: {
                adminJail: true,
                jailCheckpoints: checkpoints
            }
        }
    ).exec();

    target.mp.call('client:admin:jail', [checkpoints]);

    chat.sendSystem(
        `${admin.getName()} a dat jail lui ${target.getName()} (${checkpoints} puncte)`
    );
};