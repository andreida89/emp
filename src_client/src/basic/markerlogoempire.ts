const textureDict: string = "serv_electricscooter";
const textureName: string = "marker4";

const pos: Vector3Mp = new mp.Vector3(-268.8787, -991.3987, 32.00805);
const drawDistance: number = 50.0;

mp.events.add('playerReady', () => {
    mp.game.graphics.requestStreamedTextureDict(textureDict, true);
});

// 

mp.events.add('render', () => {
    if (!mp.game.graphics.hasStreamedTextureDictLoaded(textureDict)) return;

    const playerPos: Vector3Mp = mp.players.local.position;

    const dist: number = mp.game.system.vdist(
        playerPos.x, playerPos.y, playerPos.z,
        pos.x, pos.y, pos.z
    );

    if (dist > drawDistance) return;

    mp.game.graphics.drawMarker(
        9,
        pos.x, pos.y, pos.z - 1.3,
        0.0, 0.0, 0.0,
        0.0, 90.0, 0.0,
        1.0, 1.0, 1.0,
        255, 255, 255, 255,
        false, false, 2, true,
        textureDict,
        textureName,
        false
    );
});