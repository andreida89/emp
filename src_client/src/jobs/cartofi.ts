const cartofiMarkers = [
  { x: 282.09, y: 6436.35, z: 32.02 },
  { x: 274.70, y: 6437.67, z: 31.92 },
  { x: 265.66, y: 6434.72, z: 31.80 },
  { x: 256.51, y: 6436.36, z: 31.69 },
  { x: 245.41, y: 6433.15, z: 31.60 },
  { x: 287.97, y: 6448.13, z: 31.94 },
  { x: 280.09, y: 6447.45, z: 31.93 },
  { x: 266.86, y: 6446.24, z: 31.83 },
  { x: 254.07, y: 6445.37, z: 31.67 },
  { x: 243.98, y: 6444.38, z: 31.57 },
  { x: 234.54, y: 6443.77, z: 31.49 },
  { x: 233.95, y: 6447.68, z: 31.63 },
  { x: 242.80, y: 6448.34, z: 31.52 },
  { x: 251.42, y: 6448.89, z: 31.60 },
  { x: 263.66, y: 6449.85, z: 31.69 },
  { x: 274.83, y: 6450.89, z: 31.76 },
  { x: 286.50, y: 6451.92, z: 31.71 },
  { x: 286.87, y: 6456.16, z: 31.50 },
  { x: 279.13, y: 6455.49, z: 31.55 },
  { x: 267.40, y: 6454.47, z: 31.59 },
  { x: 255.36, y: 6453.54, z: 31.55 },
  { x: 240.35, y: 6452.42, z: 31.48 },
  { x: 228.46, y: 6451.44, z: 31.51 },
  { x: 286.21, y: 6460.15, z: 31.17 },
  { x: 273.57, y: 6459.16, z: 31.37 },
  { x: 263.29, y: 6458.16, z: 31.45 },
  { x: 249.73, y: 6457.05, z: 31.43 },
  { x: 226.88, y: 6455.21, z: 31.55 },
  { x: 287.80, y: 6464.22, z: 30.92 },
  { x: 278.61, y: 6463.45, z: 31.10 },
  { x: 265.08, y: 6462.40, z: 31.28 },
  { x: 254.00, y: 6461.42, z: 31.35 },
  { x: 242.24, y: 6460.49, z: 31.39 },
  { x: 225.08, y: 6459.16, z: 31.56 },
  { x: 287.31, y: 6468.18, z: 30.62 },
  { x: 274.17, y: 6467.03, z: 30.97 },
  { x: 258.83, y: 6465.72, z: 31.11 },
  { x: 244.41, y: 6464.55, z: 31.32 },
  { x: 230.57, y: 6463.57, z: 31.43 },
  { x: 219.44, y: 6462.62, z: 31.60 },
  { x: 287.16, y: 6472.16, z: 30.44 },
  { x: 272.77, y: 6470.79, z: 30.78 },
  { x: 258.73, y: 6469.75, z: 31.04 },
  { x: 244.79, y: 6468.64, z: 31.22 },
  { x: 229.90, y: 6467.46, z: 31.39 },
  { x: 214.20, y: 6466.21, z: 31.63 },
  { x: 286.93, y: 6476.13, z: 30.30 },
  { x: 272.98, y: 6474.96, z: 30.67 },
  { x: 257.65, y: 6473.75, z: 30.97 },
  { x: 243.57, y: 6472.59, z: 31.17 },
  { x: 226.19, y: 6471.19, z: 31.41 },
  { x: 210.83, y: 6470.07, z: 31.72 },
  { x: 286.17, y: 6480.11, z: 30.11 },
  { x: 272.67, y: 6478.88, z: 30.42 },
  { x: 257.96, y: 6477.76, z: 30.75 },
  { x: 243.77, y: 6476.59, z: 31.01 },
  { x: 225.75, y: 6475.13, z: 31.32 },
  { x: 210.89, y: 6474.01, z: 31.66 }
];


const collectedCartofi = new Set<number>();
const localMarkers: MarkerMp[] = [];

let jobActive = false;
let nearbyMarkerIndex: number | null = null;

// Pre-cream marker-ele, dar le ascundem
cartofiMarkers.forEach((marker, index) => {
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
mp.events.add("startCartofiJob", () => {
  jobActive = true;
  localMarkers.forEach(m => m.visible = true);
});

// Dezactivează marker-ele la concediere
mp.events.add("stopCartofiJob", () => {
  jobActive = false;
  localMarkers.forEach(m => m.visible = false);
  nearbyMarkerIndex = null;
});

mp.events.add("render", () => {
  if (!jobActive) return;

  const pos = mp.players.local.position;
  nearbyMarkerIndex = null;

  cartofiMarkers.forEach((marker, index) => {
    if (collectedCartofi.has(index)) return;

    const dist = mp.game.gameplay.getDistanceBetweenCoords(
      pos.x, pos.y, pos.z, marker.x, marker.y, marker.z, true
    );

    if (dist < 2.0) {
      nearbyMarkerIndex = index;
      mp.game.graphics.drawText(
        "Apasa ~g~E~s~ pentru a culege cartofi",
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
    mp.events.callRemote("tryCollectCartofi", nearbyMarkerIndex);
  }
});

mp.events.add("startCartofiCollection", () => {
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

mp.events.add("cartofiCollected", (index: number) => {
  collectedCartofi.add(index);
  localMarkers[index].visible = false;

setTimeout(() => {
  collectedCartofi.delete(index);
  if (jobActive) {
    localMarkers[index].visible = true;
  }
}, 60 * 1000);

});
