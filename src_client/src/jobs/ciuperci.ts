const mushroomMarkers = [
  { x: 1278.96, y: 1694.42, z: 84.61 },
  { x: 1286.48, y: 1695.38, z: 85.72 },
  { x: 1295.12, y: 1700.89, z: 86.61 },
  { x: 1309.27, y: 1701.57, z: 88.28 },
  { x: 1322.79, y: 1702.34, z: 89.53 },
  { x: 1341.25, y: 1704.46, z: 90.70 },
  { x: 1346.97, y: 1708.76, z: 90.58 },
  { x: 1404.93, y: 1673.52, z: 97.48 },
  { x: 1422.23, y: 1658.68, z: 99.83 },
  { x: 1428.79, y: 1670.42, z: 99.55 },
  { x: 1424.04, y: 1710.50, z: 98.97 },
  { x: 1407.96, y: 1714.60, z: 96.69 },
  { x: 1373.68, y: 1723.98, z: 92.58 },
  { x: 1362.65, y: 1724.34, z: 91.16 },
  { x: 1326.77, y: 1725.70, z: 88.73 },
  { x: 1310.06, y: 1730.41, z: 87.97 },
  { x: 1289.75, y: 1726.09, z: 85.67 },
  { x: 1285.39, y: 1736.22, z: 85.12 },
  { x: 1279.05, y: 1730.41, z: 84.06 },
];

const collectedMushrooms = new Set<number>();
const localMarkers: MarkerMp[] = [];

mushroomMarkers.forEach((marker, index) => {
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

  mushroomMarkers.forEach((marker, index) => {
    if (collectedMushrooms.has(index)) return;

    const dist = mp.game.gameplay.getDistanceBetweenCoords(
      pos.x, pos.y, pos.z, marker.x, marker.y, marker.z, true
    );

    if (dist < 2.0) {
      nearbyMarkerIndex = index;
      mp.game.graphics.drawText(
        "Apasa ~g~E~s~ pentru a culege ciuperci",
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
    mp.events.callRemote("tryCollectMushroom", nearbyMarkerIndex);
  }
});

mp.events.add("startMushroomCollection", () => {
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


mp.events.add("mushroomCollected", (index: number) => {
  collectedMushrooms.add(index);
  localMarkers[index].destroy();

  setTimeout(() => {
    const pos = mushroomMarkers[index];
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
    collectedMushrooms.delete(index);
  }, 60 * 1000);
});
