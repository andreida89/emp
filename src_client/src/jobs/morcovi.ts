const morcoviMarkers = [
  { x: 244.85, y: 6597.94, z: 30.10 },
  { x: 244.76, y: 6604.89, z: 29.95 },
  { x: 244.87, y: 6614.23, z: 29.75 },
  { x: 244.98, y: 6626.70, z: 29.84 },
  { x: 248.99, y: 6597.00, z: 30.12 },
  { x: 249.05, y: 6605.95, z: 29.98 },
  { x: 249.09, y: 6617.61, z: 29.74 },
  { x: 249.04, y: 6626.83, z: 29.87 },
  { x: 253.26, y: 6596.67, z: 30.17 },
  { x: 253.18, y: 6606.65, z: 30.10 },
  { x: 253.36, y: 6617.89, z: 29.71 },
  { x: 253.30, y: 6627.51, z: 29.78 },
  { x: 257.43, y: 6596.45, z: 30.21 },
  { x: 257.58, y: 6609.45, z: 30.07 },
  { x: 257.48, y: 6623.53, z: 29.83 },
  { x: 261.67, y: 6596.81, z: 30.22 },
  { x: 261.64, y: 6611.01, z: 29.95 },
  { x: 261.75, y: 6627.06, z: 29.73 },
  { x: 265.91, y: 6596.52, z: 30.26 },
  { x: 265.86, y: 6610.92, z: 30.01 },
  { x: 265.94, y: 6626.58, z: 29.76 },
  { x: 270.02, y: 6596.37, z: 30.29 },
  { x: 270.01, y: 6610.39, z: 30.05 },
  { x: 270.14, y: 6625.96, z: 29.77 },
  { x: 274.24, y: 6596.25, z: 30.30 },
  { x: 274.28, y: 6608.83, z: 30.07 },
  { x: 274.25, y: 6626.85, z: 29.69 },
  { x: 278.44, y: 6596.65, z: 30.25 },
  { x: 278.41, y: 6609.41, z: 30.10 },
  { x: 278.61, y: 6626.55, z: 29.68 },
  { x: 282.62, y: 6596.32, z: 30.25 },
  { x: 282.65, y: 6607.84, z: 30.14 },
  { x: 282.70, y: 6626.36, z: 29.61 },
  { x: 286.86, y: 6596.76, z: 30.27 },
  { x: 286.76, y: 6609.40, z: 30.25 },
  { x: 286.97, y: 6626.96, z: 29.47 },
  { x: 290.99, y: 6596.72, z: 30.27 },
  { x: 291.09, y: 6609.64, z: 30.06 },
  { x: 291.17, y: 6626.87, z: 29.38 },
  { x: 291.11, y: 6665.20, z: 29.46 },
  { x: 291.09, y: 6654.38, z: 29.64 },
  { x: 291.01, y: 6635.30, z: 29.35 },
  { x: 287.03, y: 6634.56, z: 29.42 },
  { x: 287.02, y: 6648.41, z: 29.71 },
  { x: 287.10, y: 6664.79, z: 29.54 },
  { x: 282.76, y: 6665.15, z: 29.71 },
  { x: 282.68, y: 6651.90, z: 29.73 },
  { x: 282.60, y: 6635.14, z: 29.43 },
  { x: 278.56, y: 6634.56, z: 29.41 },
  { x: 278.57, y: 6647.58, z: 29.72 },
  { x: 278.63, y: 6665.07, z: 29.91 },
  { x: 274.32, y: 6665.06, z: 30.03 },
  { x: 274.34, y: 6653.45, z: 29.80 },
  { x: 274.22, y: 6634.84, z: 29.50 },
  { x: 270.19, y: 6634.66, z: 29.51 },
  { x: 270.30, y: 6645.93, z: 29.76 },
  { x: 270.16, y: 6664.80, z: 30.03 },
  { x: 265.88, y: 6665.08, z: 30.05 },
  { x: 265.84, y: 6652.62, z: 29.90 },
  { x: 265.82, y: 6635.27, z: 29.58 },
  { x: 261.75, y: 6634.55, z: 29.61 },
  { x: 261.81, y: 6647.99, z: 29.89 },
  { x: 261.80, y: 6665.10, z: 30.06 },
  { x: 257.49, y: 6665.40, z: 30.09 },
  { x: 257.45, y: 6652.20, z: 30.07 },
  { x: 257.37, y: 6635.17, z: 29.75 },
  { x: 253.35, y: 6634.62, z: 29.78 },
  { x: 253.43, y: 6648.17, z: 30.07 },
  { x: 253.43, y: 6664.46, z: 30.11 },
  { x: 249.03, y: 6665.37, z: 30.11 },
  { x: 249.06, y: 6653.44, z: 29.97 },
  { x: 248.97, y: 6635.48, z: 29.81 },
  { x: 244.96, y: 6634.77, z: 29.81 },
  { x: 245.00, y: 6649.70, z: 29.84 },
  { x: 244.96, y: 6664.91, z: 30.12 },
  { x: 240.66, y: 6664.43, z: 30.16 },
  { x: 240.65, y: 6650.58, z: 29.74 },
  { x: 240.51, y: 6634.61, z: 29.94 }
];


const collectedMorcovi = new Set<number>();
const localMarkers: MarkerMp[] = [];

let jobActive = false;
let nearbyMarkerIndex: number | null = null;

// Pre-cream marker-ele, dar le ascundem
morcoviMarkers.forEach((marker, index) => {
  const markerEntity = mp.markers.new(
    21,
    new mp.Vector3(marker.x, marker.y, marker.z + 0.2),
    0.3,
    {
      direction: new mp.Vector3(0, 0, 0),
      color: [0, 255, 0, 100],
      visible: false, // <-- ascuns inițial
      dimension: 0,
    }
  );

  localMarkers[index] = markerEntity;
});

// Activează marker-ele la angajare
mp.events.add("startMorcoviJob", () => {
  jobActive = true;
  localMarkers.forEach(m => m.visible = true);
});

// Dezactivează marker-ele la concediere
mp.events.add("stopMorcoviJob", () => {
  jobActive = false;
  localMarkers.forEach(m => m.visible = false);
  nearbyMarkerIndex = null;
});

mp.events.add("render", () => {
  if (!jobActive) return;

  const pos = mp.players.local.position;
  nearbyMarkerIndex = null;

  morcoviMarkers.forEach((marker, index) => {
    if (collectedMorcovi.has(index)) return;

    const dist = mp.game.gameplay.getDistanceBetweenCoords(
      pos.x, pos.y, pos.z, marker.x, marker.y, marker.z, true
    );

    if (dist < 2.0) {
      nearbyMarkerIndex = index;
      mp.game.graphics.drawText(
        "Apasa ~g~E~s~ pentru a culege morcovi",
        [0.5, 0.9],
        {
          font: 4,
          color: [255, 255, 255, 255],
          scale: [0.5, 0.5],
          outline: true,
        }
      );
    }
  });
});

mp.keys.bind(0x45, false, () => {
  if (!jobActive) return;
  if (nearbyMarkerIndex !== null && !mp.players.local.isPositionFrozen) {
    mp.events.callRemote("tryCollectMorcovi", nearbyMarkerIndex);
  }
});

mp.events.add("startMorcoviCollection", () => {
  const player = mp.players.local;
  const dict = "amb@world_human_gardener_plant@male@enter";
  const anim = "enter";

  mp.game.streaming.requestAnimDict(dict);

  const interval = setInterval(() => {
    if (mp.game.streaming.hasAnimDictLoaded(dict)) {
      clearInterval(interval);

      player.freezePosition(true);

      player.taskPlayAnim(
        dict,
        anim,
        8.0,
        -8,
        -1,
        1,
        0,
        false,
        false,
        false
      );

      setTimeout(() => {
        player.clearTasks();
        player.freezePosition(false);
      }, 5000);
    }
  }, 100);
});

mp.events.add("morcoviCollected", (index: number) => {
  collectedMorcovi.add(index);
  localMarkers[index].visible = false;

setTimeout(() => {
  collectedMorcovi.delete(index);
  if (jobActive) {
    localMarkers[index].visible = true;
  }
}, 60 * 1000);

});
