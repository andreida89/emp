const mereMarkers = [
  { x: 2359.91, y: 4723.32, z: 34.53 },
  { x: 2390.46, y: 4690.48, z: 33.93 },
  { x: 2424.71, y: 4657.89, z: 33.44 },
  { x: 2444.76, y: 4672.51, z: 33.33 },
  { x: 2435.28, y: 4678.30, z: 33.37 },
  { x: 2421.06, y: 4673.92, z: 33.81 },
  { x: 2408.23, y: 4676.25, z: 33.98 },
  { x: 2422.47, y: 4685.16, z: 33.75 },
  { x: 2424.01, y: 4696.64, z: 33.09 },
  { x: 2414.43, y: 4706.05, z: 33.01 },
  { x: 2405.21, y: 4704.04, z: 33.35 },
  { x: 2408.23, y: 4676.25, z: 33.98 },
  { x: 2402.92, y: 4687.85, z: 33.68 },
  { x: 2403.04, y: 4716.04, z: 33.14 },
  { x: 2382.88, y: 4700.14, z: 33.93 },
  { x: 2383.71, y: 4711.94, z: 33.74 },
  { x: 2387.19, y: 4723.15, z: 33.68 },
  { x: 2387.28, y: 4734.78, z: 33.24 },
  { x: 2375.84, y: 4735.59, z: 33.64 },
  { x: 2368.10, y: 4714.98, z: 34.28 },
  { x: 2365.62, y: 4728.52, z: 34.15 },
  { x: 2367.35, y: 4749.43, z: 33.92 },
  { x: 2351.74, y: 4734.49, z: 34.79 },
  { x: 2353.35, y: 4758.30, z: 34.40 },
  { x: 2344.83, y: 4756.23, z: 34.78 },
  { x: 2340.30, y: 4740.27, z: 35.07 },
  { x: 2325.69, y: 4746.36, z: 35.96 },
  { x: 2326.88, y: 4760.49, z: 35.87 },
  { x: 2328.86, y: 4770.84, z: 35.99 },
];

const collectedMere = new Set<number>();
const localMarkers: MarkerMp[] = [];

let jobActive = false;
let nearbyMarkerIndex: number | null = null;

// Pre-creăm marker-ele, dar le ascundem
mereMarkers.forEach((marker, index) => {
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
mp.events.add("startMereJob", () => {
  jobActive = true;
  localMarkers.forEach(m => m.visible = true);
});

// Dezactivează marker-ele la concediere
mp.events.add("stopMereJob", () => {
  jobActive = false;
  localMarkers.forEach(m => m.visible = false);
  nearbyMarkerIndex = null;
});

mp.events.add("render", () => {
  if (!jobActive) return;

  const pos = mp.players.local.position;
  nearbyMarkerIndex = null;

  mereMarkers.forEach((marker, index) => {
    if (collectedMere.has(index)) return;

    const dist = mp.game.gameplay.getDistanceBetweenCoords(
      pos.x, pos.y, pos.z, marker.x, marker.y, marker.z, true
    );

    if (dist < 2.0) {
      nearbyMarkerIndex = index;
      mp.game.graphics.drawText(
        "Apasa ~g~E~s~ pentru a culege mere",
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
    mp.events.callRemote("tryCollectMere", nearbyMarkerIndex);
  }
});

mp.events.add("startMereCollection", () => {
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

mp.events.add("mereCollected", (index: number) => {
  collectedMere.add(index);
  localMarkers[index].visible = false;

setTimeout(() => {
  collectedMere.delete(index);
  if (jobActive) {
    localMarkers[index].visible = true;
  }
}, 60 * 1000);

});
