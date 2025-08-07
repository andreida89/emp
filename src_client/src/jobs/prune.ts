const pruneMarkers = [
  { x: 369.91, y: 6531.70, z: 28.38 },
  { x: 362.36, y: 6531.30, z: 28.36 },
  { x: 354.37, y: 6530.79, z: 28.35 },
  { x: 346.49, y: 6531.47, z: 28.67 },
  { x: 339.12, y: 6531.15, z: 28.57 },
  { x: 329.98, y: 6530.82, z: 28.58 },
  { x: 322.28, y: 6531.25, z: 29.12 },
  { x: 379.08, y: 6517.73, z: 28.33 },
  { x: 370.42, y: 6517.92, z: 28.38 },
  { x: 364.33, y: 6517.73, z: 28.31 },
  { x: 356.20, y: 6517.26, z: 28.13 },
  { x: 348.05, y: 6517.59, z: 28.75 },
  { x: 339.99, y: 6517.22, z: 28.95 },
  { x: 330.97, y: 6517.73, z: 28.95 },
  { x: 322.86, y: 6517.52, z: 29.12 },
  { x: 322.48, y: 6505.51, z: 29.16 },
  { x: 331.75, y: 6505.70, z: 28.48 },
  { x: 340.89, y: 6505.66, z: 28.73 },
  { x: 348.62, y: 6505.27, z: 28.78 },
  { x: 356.24, y: 6505.01, z: 28.45 },
  { x: 363.91, y: 6505.91, z: 28.55 },
  { x: 370.60, y: 6505.95, z: 28.40 },
  { x: 378.82, y: 6505.90, z: 27.94 },
  { x: 283.29, y: 6506.79, z: 30.09 },
  { x: 274.07, y: 6507.42, z: 30.40 },
  { x: 264.47, y: 6506.18, z: 30.66 },
  { x: 257.16, y: 6504.18, z: 30.84 },
  { x: 248.00, y: 6503.25, z: 31.03 },
  { x: 237.59, y: 6502.06, z: 31.19 },
  { x: 228.59, y: 6501.74, z: 31.31 },
  { x: 220.46, y: 6499.60, z: 31.38 },
  { x: 210.82, y: 6498.42, z: 31.45 },
  { x: 202.27, y: 6497.34, z: 31.48 },
  { x: 194.41, y: 6497.33, z: 31.52 },
  { x: 186.10, y: 6498.18, z: 31.54 },
  { x: 282.35, y: 6519.04, z: 30.13 },
  { x: 273.00, y: 6519.31, z: 30.43 },
  { x: 262.74, y: 6516.63, z: 30.70 },
  { x: 254.53, y: 6514.32, z: 30.90 },
  { x: 245.23, y: 6515.38, z: 31.08 },
  { x: 234.90, y: 6512.79, z: 31.23 },
  { x: 226.47, y: 6511.74, z: 31.32 },
  { x: 218.66, y: 6510.37, z: 31.39 },
  { x: 209.01, y: 6510.00, z: 31.47 },
  { x: 200.60, y: 6509.00, z: 31.51 },
  { x: 281.39, y: 6530.91, z: 30.16 },
  { x: 271.51, y: 6530.78, z: 30.47 },
  { x: 262.41, y: 6527.69, z: 30.72 },
  { x: 252.71, y: 6527.65, z: 30.94 },
  { x: 243.87, y: 6526.33, z: 31.10 },
  { x: 234.46, y: 6524.77, z: 31.23 },
  { x: 225.27, y: 6523.89, z: 31.34 }
];


const collectedPrune = new Set<number>();
const localMarkers: MarkerMp[] = [];

let jobActive = false;
let nearbyMarkerIndex: number | null = null;

// Pre-creăm marker-ele, dar le ascundem
pruneMarkers.forEach((marker, index) => {
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
mp.events.add("startPruneJob", () => {
  jobActive = true;
  localMarkers.forEach(m => m.visible = true);
});

// Dezactivează marker-ele la concediere
mp.events.add("stopPruneJob", () => {
  jobActive = false;
  localMarkers.forEach(m => m.visible = false);
  nearbyMarkerIndex = null;
});

mp.events.add("render", () => {
  if (!jobActive) return;

  const pos = mp.players.local.position;
  nearbyMarkerIndex = null;

  pruneMarkers.forEach((marker, index) => {
    if (collectedPrune.has(index)) return;

    const dist = mp.game.gameplay.getDistanceBetweenCoords(
      pos.x, pos.y, pos.z, marker.x, marker.y, marker.z, true
    );

    if (dist < 2.0) {
      nearbyMarkerIndex = index;
      mp.game.graphics.drawText(
        "Apasa ~g~E~s~ pentru a culege prune",
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
    mp.events.callRemote("tryCollectPrune", nearbyMarkerIndex);
  }
});

mp.events.add("startPruneCollection", () => {
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

mp.events.add("pruneCollected", (index: number) => {
  collectedPrune.add(index);
  localMarkers[index].visible = false;

setTimeout(() => {
  collectedPrune.delete(index);
  if (jobActive) {
    localMarkers[index].visible = true;
  }
}, 60 * 1000);

});
