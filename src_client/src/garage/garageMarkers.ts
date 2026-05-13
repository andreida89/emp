const textureDict: string = "serv_electricscooter";
const textureName: string = "garaj";
const drawDistance: number = 30.0;

interface GarageMarker {
    id: number;
    position: Vector3Mp;
    type?: string;
    noBlip?: boolean;
}

let garageMarkers: GarageMarker[] = [];
const activeBlips: Map<string, BlipMp> = new Map();

const blipColors: Record<string, number> = {
    'civil': 3, 'politie': 38, 'umu': 1, 'boat': 3, 'boat_politie': 38,
    'truck': 5, 'plane': 5, 'heli': 5, 'heli_politie': 38, 'heli_umu': 1,
    'kart': 5, 'formula1': 5
};

const blipModels: Record<string, number> = {
    'civil': 50, 'politie': 50, 'umu': 50, 'boat': 427, 'boat_politie': 427,
    'truck': 477, 'plane': 423, 'heli': 43, 'heli_politie': 43, 'heli_umu': 43,
    'kart': 523, 'formula1': 523
};

const blipNames: Record<string, string> = {
    'civil': 'Garaj Civil', 'politie': 'Garaj Politie', 'umu': 'Garaj UMU',
    'boat': 'Garaj Barci', 'boat_politie': 'Garaj Barci Politie', 'truck': 'Garaj Camioane',
    'plane': 'Garaj Avioane', 'heli': 'Garaj Elicopter', 'kart': 'Garaj Kart',
    'formula1': 'Garaj Formula1'
};

function updateBlips() {
    // Clear existing blips
    activeBlips.forEach(b => { if (mp.blips.exists(b)) b.destroy(); });
    activeBlips.clear();

    const groups = new Map<string, GarageMarker[]>();
    garageMarkers.forEach(m => {
        if (m.noBlip) return;
        const key = `${m.position.x.toFixed(1)}_${m.position.y.toFixed(1)}_${m.position.z.toFixed(1)}_${m.type}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(m);
    });

    groups.forEach((items, key) => {
        const first = items[0];
        if (!first.type || first.type === 'heli_politie' || first.type === 'heli_umu') return;

        const blip = mp.blips.new(
            blipModels[first.type] || 50,
            new mp.Vector3(first.position.x, first.position.y, first.position.z),
            {
                name: blipNames[first.type] || "Garaj",
                color: blipColors[first.type] || 3,
                shortRange: true,
                scale: 0.8
            }
        );
        activeBlips.set(key, blip);
    });
}

// Request it as soon as the module loads
mp.game.graphics.requestStreamedTextureDict(textureDict, true);

mp.events.add('playerReady', () => {
    mp.events.callRemote('garage:requestMarkers');
});
mp.events.callRemote('garage:requestMarkers');

mp.events.subscribe({
    'garage:initMarkers': (dataStr: string) => {
        try {
            garageMarkers = JSON.parse(dataStr);
            updateBlips();
        } catch (e) {}
    }
});

mp.events.subscribeToDefault({
    'garage:addMarker': (id: number, position: Vector3Mp, type: string, noBlip?: boolean) => {
        // Prevent duplicate markers with the same ID
        garageMarkers = garageMarkers.filter(m => m.id !== id);
        garageMarkers.push({ id, position, type, noBlip });
        updateBlips();
    },
    'garage:removeMarker': (id: number) => {
        garageMarkers = garageMarkers.filter(m => m.id !== id);
        updateBlips();
    }
});

mp.events.add('render', () => {
    if (!mp.game.graphics.hasStreamedTextureDictLoaded(textureDict)) {
        mp.game.graphics.requestStreamedTextureDict(textureDict, true);
        return;
    }

    const playerPos: Vector3Mp = mp.players.local.position;
    const playerDimension: number = mp.players.local.dimension;

    // Garages are usually only in dimension 0 for entrance
    if (playerDimension !== 0) return;

    garageMarkers.forEach((marker) => {
        const pos = marker.position;
        const isBoat = marker.type === 'boat' || marker.type === 'boat_politie';
        const zOff = isBoat ? 1.5 : -0.2;
        
        const dist: number = mp.game.system.vdist(
            playerPos.x, playerPos.y, playerPos.z,
            pos.x, pos.y, pos.z
        );

        if (dist > drawDistance) return;

        mp.game.graphics.drawMarker(
            9,
            pos.x, pos.y, pos.z + zOff,
            0.0, 0.0, 0.0,
            0.0, 90.0, 0.0,
            0.5, 0.5, 0.5,
            255, 255, 255, 255,
            false, false, 2, true,
            textureDict,
            textureName,
            false
        );
    });
});

export {};
