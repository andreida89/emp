const textureDict: string = "serv_electricscooter";
const textureName: string = "casa";
const drawDistance: number = 20.0;

interface HouseMarker {
    id: number;
    entrance: Vector3Mp;
    exit: Vector3Mp;
    interiorDimension: number;
}

let houseMarkers: HouseMarker[] = [];

// Request it as soon as the module loads
mp.game.graphics.requestStreamedTextureDict(textureDict, true);

mp.events.add('playerReady', () => {
    mp.events.callRemote('house:requestMarkers');
});
mp.events.callRemote('house:requestMarkers');

mp.events.subscribe({
    'house:initMarkers': (dataStr: string) => {
        try {
            houseMarkers = JSON.parse(dataStr);
        } catch (e) {}
    }
});

mp.events.subscribeToDefault({
    'house:addMarker': (id: number, entrance: Vector3Mp, exit: Vector3Mp, interiorDimension: number) => {
        // Prevent duplicate markers with the same ID
        houseMarkers = houseMarkers.filter(m => m.id !== id);
        houseMarkers.push({ id, entrance, exit, interiorDimension });
    },
    'house:removeMarker': (id: number) => {
        houseMarkers = houseMarkers.filter(m => m.id !== id);
    }
});

mp.events.add('render', () => {
    if (!mp.game.graphics.hasStreamedTextureDictLoaded(textureDict)) {
        mp.game.graphics.requestStreamedTextureDict(textureDict, true);
        return;
    }

    const playerPos: Vector3Mp = mp.players.local.position;
    const playerDimension: number = mp.players.local.dimension;

    houseMarkers.forEach((marker) => {
        // Only show marker if dimension matches
        if (playerDimension !== 0 && playerDimension !== marker.interiorDimension) return;
        
        const pos = playerDimension === 0 ? marker.entrance : marker.exit;
        
        const dist: number = mp.game.system.vdist(
            playerPos.x, playerPos.y, playerPos.z,
            pos.x, pos.y, pos.z
        );

        if (dist > drawDistance) return;

        mp.game.graphics.drawMarker(
            9,
            pos.x, pos.y, pos.z - 0.2,
            0.0, 0.0, 0.0,
            0.0, 90.0, 0.0,
            0.4, 0.4, 0.4,
            255, 255, 255, 255,
            false, false, 2, true,
            textureDict,
            textureName,
            false
        );
    });
});

export {};
