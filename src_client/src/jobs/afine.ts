const afineMarkers = [
  { x: 1909.04, y: 5164.44, z: 45.19 },
  { x: 1899.89, y: 5183.69, z: 53.49 },
  { x: 1891.11, y: 5185.67, z: 50.45 },
  { x: 1880.43, y: 5195.50, z: 54.67 },
  { x: 1868.02, y: 5199.82, z: 54.16 },
  { x: 1866.54, y: 5182.37, z: 48.40 },
  { x: 1869.65, y: 5142.30, z: 50.06 },
  { x: 1859.55, y: 5158.11, z: 51.19 },
  { x: 1845.84, y: 5172.37, z: 56.05 },
  { x: 1847.16, y: 5190.51, z: 52.15 },
  { x: 1838.03, y: 5194.00, z: 59.30 },
  { x: 1870.15, y: 5217.11, z: 62.76 },
  { x: 1843.91, y: 5240.50, z: 77.15 },
  { x: 1813.95, y: 5239.24, z: 74.71 },
  { x: 1811.21, y: 5220.68, z: 72.55 },
  { x: 1815.45, y: 5253.67, z: 82.27 },
  { x: 1787.29, y: 5251.77, z: 88.24 },
  { x: 1777.39, y: 5263.79, z: 99.16 },
  { x: 1762.56, y: 5235.42, z: 97.59 },
  { x: 1740.92, y: 5242.91, z: 109.89 },
  { x: 1742.12, y: 5262.46, z: 109.79 },
  { x: 1981.36, y: 5257.76, z: 84.58 },
  { x: 1995.63, y: 5219.24, z: 59.22 },
  { x: 2002.28, y: 5199.58, z: 51.08 },
  { x: 2025.44, y: 5223.87, z: 60.60 },
  { x: 2038.27, y: 5217.46, z: 58.62 },
  { x: 2027.90, y: 5233.82, z: 69.16 },
  { x: 2053.98, y: 5281.40, z: 96.23 },
  { x: 2052.51, y: 5288.58, z: 102.51 },
  { x: 2047.56, y: 5295.87, z: 111.52 },
  { x: 2073.25, y: 5287.46, z: 94.90 },
  { x: 1835.78, y: 5128.79, z: 59.99 },
  { x: 1835.32, y: 5106.43, z: 58.86 },
  { x: 1804.43, y: 5120.33, z: 68.96 },
  { x: 1796.35, y: 5137.94, z: 75.66 },
  { x: 1783.87, y: 5154.71, z: 92.31 },
  { x: 1762.69, y: 5124.41, z: 94.26 },
  { x: 1756.65, y: 5138.12, z: 105.36 },
  { x: 1756.36, y: 5054.42, z: 67.82 }
];



const collectedAfine = new Set<number>();
const localMarkers: MarkerMp[] = [];

let jobActive = false;
let nearbyMarkerIndex: number | null = null;

// Pre-creăm marker-ele, dar le ascundem
afineMarkers.forEach((marker, index) => {
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
mp.events.add("startAfineJob", () => {
  jobActive = true;
  localMarkers.forEach(m => m.visible = true);
});

// Dezactivează marker-ele la concediere
mp.events.add("stopAfineJob", () => {
  jobActive = false;
  localMarkers.forEach(m => m.visible = false);
  nearbyMarkerIndex = null;
});

mp.events.add("render", () => {
  if (!jobActive) return;

  const pos = mp.players.local.position;
  nearbyMarkerIndex = null;

  afineMarkers.forEach((marker, index) => {
    if (collectedAfine.has(index)) return;

    const dist = mp.game.gameplay.getDistanceBetweenCoords(
      pos.x, pos.y, pos.z, marker.x, marker.y, marker.z, true
    );

    if (dist < 2.0) {
      nearbyMarkerIndex = index;
      mp.game.graphics.drawText(
        "Apasa ~g~E~s~ pentru a culege afine",
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
    mp.events.callRemote("tryCollectAfine", nearbyMarkerIndex);
  }
});

mp.events.add("startAfineCollection", () => {
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

mp.events.add("afineCollected", (index: number) => {
  collectedAfine.add(index);
  localMarkers[index].visible = false;

setTimeout(() => {
  collectedAfine.delete(index);
  if (jobActive) {
    localMarkers[index].visible = true;
  }
}, 60 * 1000);

});
