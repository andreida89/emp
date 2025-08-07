const rameMarkers = [
  { x: -2423.67, y: 2448.43, z: 1.71 },
  { x: -2435.54, y: 2448.26, z: 1.25 },
  { x: -2434.87, y: 2440.09, z: 1.82 },   
  { x: -2445.81, y: 2446.66, z: 1.83 },
  { x: -2453.14, y: 2455.88, z: 1.10 },
  { x: -2459.66, y: 2447.25, z: 1.95 },
  { x: -2472.75, y: 2440.59, z: 1.67 },
  { x: -2483.49, y: 2440.88, z: 1.24 },
  { x: -2498.14, y: 2444.23, z: 1.27 },
  { x: -2514.12, y: 2446.35, z: 1.24 },
  { x: -2524.20, y: 2452.63, z: 1.23 },
  { x: -2526.93, y: 2462.22, z: 1.19 },
  { x: -2518.56, y: 2469.67, z: 1.19 },
  { x: -2501.28, y: 2465.58, z: 1.51 },
  { x: -2492.31, y: 2461.84, z: 3.20 },
  { x: -2484.07, y: 2466.84, z: 3.15 },
  { x: -2470.49, y: 2468.97, z: 2.89 },
  { x: -2456.21, y: 2479.46, z: 2.64 },
  { x: -2443.11, y: 2491.27, z: 2.98 },
  { x: -2429.24, y: 2494.52, z: 2.75 },
  { x: -2422.55, y: 2512.27, z: 2.72 },
  { x: -2400.09, y: 2509.14, z: 1.62},
];

const collectedRame = new Set<number>();
const localMarkers: MarkerMp[] = [];

rameMarkers.forEach((marker, index) => {
  const markerEntity = mp.markers.new(
    21,
    new mp.Vector3(marker.x, marker.y, marker.z + 0.2),
    0.3,
    {
      direction: new mp.Vector3(0, 0, 0),
      color: [0, 255, 0, 100],
      visible: true,
      dimension: 0,
    }
  );

  localMarkers[index] = markerEntity;
});

let nearbyMarkerIndex: number | null = null;

mp.events.add("render", () => {
  const pos = mp.players.local.position;
  nearbyMarkerIndex = null;

  rameMarkers.forEach((marker, index) => {
    if (collectedRame.has(index)) return;

    const dist = mp.game.gameplay.getDistanceBetweenCoords(
      pos.x, pos.y, pos.z, marker.x, marker.y, marker.z, true
    );

    if (dist < 2.0) {
      nearbyMarkerIndex = index;
      mp.game.graphics.drawText(
        "Apasa ~g~E~s~ pentru a culege rame",
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
  if (nearbyMarkerIndex !== null && !mp.players.local.isPositionFrozen) {
    mp.events.callRemote("tryCollectRame", nearbyMarkerIndex);
  }
});

mp.events.add("startRameCollection", () => {
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
        1, // flag = looped
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
  }, 100); // verifică la fiecare 100ms dacă s-a încărcat dict-ul
});


mp.events.add("rameCollected", (index: number) => {
  collectedRame.add(index);
  localMarkers[index].destroy();

  setTimeout(() => {
    const pos = rameMarkers[index];
    const newMarker = mp.markers.new(
      21,
      new mp.Vector3(pos.x, pos.y, pos.z + 0.2),
      0.3,
      {
        direction: new mp.Vector3(0, 0, 0),
        color: [0, 255, 0, 100],
        visible: true,
        dimension: 0,
      }
    );
    localMarkers[index] = newMarker;
    collectedRame.delete(index);
  }, 60 * 1000);
});
