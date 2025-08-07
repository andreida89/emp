const ziareMarkers = [
    { x: 1385.66, y: -592.97, z: 74.48 },
    { x: 1206.67, y: -463.57, z: 66.44 },
    { x: 1139.05, y: -342.26, z: 67.05 },
    { x: 1055.98, y: -448.87, z: 66.25 },
    { x: 1009.64, y: -572.29, z: 60.59 },
    { x: 960.18, y: -670.26, z: 58.44 },
    { x: 996.99, y: -729.70, z: 57.81 },
    { x: 1130.21, y: -776.87, z: 57.61 },
    { x: 1264.61, y: -703.09, z: 64.90 },
    { x: 1250.59, y: -621.14, z: 69.57 },
    { x: 1241.50, y: -566.40, z: 69.65 },
    { x: 1250.91, y: -515.41, z: 69.34 },
    { x: 1169.04, y: -291.70, z: 69.02 },
    { x: -1093.74, y: 427.28, z: 75.88 },
    { x: -1122.58, y: 485.63, z: 82.16 },
    { x: -1158.74, y: 481.31, z: 86.09 },
    { x: -1215.93, y: 458.43, z: 91.85 },
    { x: -1277.42, y: 497.20, z: 97.89 },
    { x: -1308.29, y: 449.35, z: 100.97 },
    { x: -1372.08, y: 443.84, z: 105.86 },
    { x: -1452.39, y: 545.64, z: 120.80 },
    { x: -1366.81, y: 611.02, z: 133.91 },
    { x: -1291.54, y: 649.76, z: 141.50 },
    { x: -1197.21, y: 693.44, z: 147.42 },
    { x: -1118.14, y: 762.12, z: 164.29 }, 
    { x: -999.04, y: 816.25, z: 173.05 }
];

let activeMarkers = [];
let activeBlips = [];
let delivered = new Set();
let jobActive = false;

function cleanupZiareJob() {
    activeMarkers.forEach(m => { try { m && m.destroy(); } catch(e){} });
    activeBlips.forEach(b => { try { b && b.destroy(); } catch(e){} });
    activeMarkers = [];
    activeBlips = [];
    delivered.clear();
    jobActive = false;
}

mp.events.add('ziareJob:startDelivery', () => {
    cleanupZiareJob();

    jobActive = true;
    ziareMarkers.forEach((m, idx) => {
        const marker = mp.markers.new(1, new mp.Vector3(m.x, m.y, m.z - 1), 2, { color: [255,255,0,180], visible: true, dimension: 0 });
        const blip = mp.blips.new(1, new mp.Vector3(m.x, m.y, m.z), { color: 5, name: `Livrare Ziare #${idx+1}`, shortRange: false });
        marker.index = idx;
        activeMarkers.push(marker);
        activeBlips.push(blip);
    });
});

mp.events.add('ziareJob:stop', cleanupZiareJob);
mp.events.add('ziareJob:dismiss', cleanupZiareJob);

mp.events.add('ziare:giveWeapon', () => {
    mp.events.callRemote('ziare:giveWeapon');
});

function getDirectionFromRotation(rot) {
    const degToRad = Math.PI / 180.0;
    const z = rot.z * degToRad;
    const x = rot.x * degToRad;
    const num = Math.abs(Math.cos(x));
    return {
        x: -Math.sin(z) * num,
        y: Math.cos(z) * num,
        z: Math.sin(x)
    };
}

mp.events.add('playerWeaponShot', (targetPosition) => {
    if (!jobActive) return;

    // Fallback la coordonate reale dacă nu sunt valide sau sunt 0,0,0
    if (
        !targetPosition ||
        typeof targetPosition.x !== 'number' ||
        typeof targetPosition.y !== 'number' ||
        typeof targetPosition.z !== 'number' ||
        (targetPosition.x === 0 && targetPosition.y === 0 && targetPosition.z === 0)
    ) {
        const camCoords = mp.game.cam.getGameplayCoord();
        const rot = mp.game.cam.getGameplayCamRot(2);
        const dir = getDirectionFromRotation(rot);

        targetPosition = new mp.Vector3(
            camCoords.x + dir.x * 10,
            camCoords.y + dir.y * 10,
            camCoords.z + dir.z * 10
        );
    }

    let found = false;
    activeMarkers.forEach((marker, idx) => {
        if (delivered.has(idx)) return;

        const dist = mp.game.gameplay.getDistanceBetweenCoords(
            targetPosition.x, targetPosition.y, targetPosition.z,
            marker.position.x, marker.position.y, marker.position.z, true
        );
        if (dist < 3) {
            marker.destroy();
            activeBlips[idx].destroy();
            delivered.add(idx);

            mp.events.callRemote('ziare:finishDelivery', idx);
            mp.events.callRemote('ziare:giveWeapon');
            mp.gui.chat.push(`Ai livrat ziarul #${idx + 1}!`);
            found = true;
        }
    });

    if (!found) {
        mp.gui.chat.push('Nu ai livrat ziarul la nicio casa!');
    }

if (delivered.size === ziareMarkers.length) {
    mp.gui.chat.push('Ai terminat toate livrarile! Du-te la magazie sa iei alte ziare!');
    jobActive = false;
    mp.events.callRemote('ziare:removeWeapon');
    mp.events.callRemote('ziare:requestRefillPoint'); // <-- ADĂUGĂ ASTA
}


});

