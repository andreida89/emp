const salataMarkers = [
  { x: 543.12, y: 6518.41, z: 29.94 },  
  { x: 545.26, y: 6511.15, z: 29.89 },
  { x: 543.00, y: 6503.31, z: 29.94 },
  { x: 540.93, y: 6495.42, z: 30.09 },
  { x: 543.55, y: 6485.72, z: 30.63 },

  { x: 541.20, y: 6475.02, z: 30.72 },
  { x: 543.41, y: 6465.52, z: 30.70 },
  { x: 545.39, y: 6458.62, z: 30.63 },
  { x: 534.80, y: 6518.78, z: 30.18 },
  { x: 532.81, y: 6511.05, z: 30.13 },
  { x: 534.92, y: 6504.29, z: 30.18 },
  { x: 536.87, y: 6494.49, z: 30.23 },
  { x: 534.76, y: 6485.30, z: 30.76 },
  { x: 532.58, y: 6474.02, z: 30.73 },
  { x: 534.88, y: 6466.54, z: 30.80 },
  { x: 536.92, y: 6458.71, z: 30.83 },
  { x: 524.07, y: 6518.68, z: 29.44 },
  { x: 526.28, y: 6512.11, z: 29.59 },
  { x: 528.30, y: 6504.48, z: 29.78 },
  { x: 526.34, y: 6493.87, z: 30.15 },
  { x: 524.29, y: 6484.34, z: 30.66 },
  { x: 526.38, y: 6475.17, z: 30.67 },
  { x: 528.54, y: 6467.22, z: 30.74 },
  { x: 524.34, y: 6458.91, z: 30.73 },
  { x: 515.69, y: 6518.55, z: 29.69 },
  { x: 517.94, y: 6511.58, z: 29.58 },
  { x: 520.01, y: 6503.14, z: 29.58 },
  { x: 517.89, y: 6494.28, z: 30.30 },
  { x: 516.22, y: 6486.22, z: 30.74 },
  { x: 518.00, y: 6477.33, z: 30.70 },
  { x: 519.80, y: 6468.81, z: 30.71 },
  { x: 515.92, y: 6461.09, z: 30.72 },
  { x: 507.31, y: 6518.57, z: 29.86 },
  { x: 509.48, y: 6506.95, z: 29.75 },
  { x: 511.68, y: 6499.32, z: 29.94 },
  { x: 509.54, y: 6490.46, z: 30.68 },
  { x: 507.34, y: 6480.98, z: 30.80 },
  { x: 509.71, y: 6470.29, z: 30.75 },
  { x: 511.69, y: 6459.59, z: 30.66 },
  { x: 498.82, y: 6518.76, z: 30.35 },
  { x: 501.06, y: 6508.11, z: 30.08 },
  { x: 503.08, y: 6500.53, z: 30.02 },
  { x: 501.05, y: 6492.85, z: 30.65 },
  { x: 498.99, y: 6483.02, z: 30.82 },
  { x: 501.12, y: 6471.90, z: 30.81 },
  { x: 503.26, y: 6461.56, z: 30.89 },
];


const collectedSalata = new Set<number>();
const localMarkers: MarkerMp[] = [];

let jobActive = false;
let nearbyMarkerIndex: number | null = null;

// Pre-creăm marker-ele, dar le ascundem
salataMarkers.forEach((marker, index) => {
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
mp.events.add("startSalataJob", () => {
  jobActive = true;
  localMarkers.forEach(m => m.visible = true);
});

// Dezactivează marker-ele la concediere
mp.events.add("stopSalataJob", () => {
  jobActive = false;
  localMarkers.forEach(m => m.visible = false);
  nearbyMarkerIndex = null;
});

mp.events.add("render", () => {
  if (!jobActive) return;

  const pos = mp.players.local.position;
  nearbyMarkerIndex = null;

  salataMarkers.forEach((marker, index) => {
    if (collectedSalata.has(index)) return;

    const dist = mp.game.gameplay.getDistanceBetweenCoords(
      pos.x, pos.y, pos.z, marker.x, marker.y, marker.z, true
    );

    if (dist < 2.0) {
      nearbyMarkerIndex = index;
      mp.game.graphics.drawText(
        "Apasa ~g~E~s~ pentru a culege salata",
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
    mp.events.callRemote("tryCollectSalata", nearbyMarkerIndex);
  }
});

mp.events.add("startSalataCollection", () => {
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

mp.events.add("salataCollected", (index: number) => {
  collectedSalata.add(index);
  localMarkers[index].visible = false;

setTimeout(() => {
  collectedSalata.delete(index);
  if (jobActive) {
    localMarkers[index].visible = true;
  }
}, 60 * 1000);

});
