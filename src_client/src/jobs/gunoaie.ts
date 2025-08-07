// src_client/src/gunoaie.ts

const gunoaieMarkers = [
  { x: 407.19, y: -1014.89, z: 29.45 },
  { x: 410.87, y: -934.84, z: 29.42 },
  { x: 408.99, y: -1119.70, z: 29.53 },
  { x: 314.13, y: -1119.62, z: 29.46 },
  { x: 230.88, y: -1069.49, z: 29.16 },
  { x: 191.05, y: -1012.22, z: 29.34 },
  { x: 189.74, y: -840.80, z: 30.96 },
  { x: 99.82, y: -774.71, z: 31.52 },
  { x: -9.20, y: -937.88, z: 29.30 },
  { x: -66.66, y: -1085.36, z: 26.87 },
  { x: 43.75, y: -1102.81, z: 29.17 },
  { x: 99.41, y: -1322.72, z: 29.29 },
  { x: 244.47, y: -1471.34, z: 29.26 },
  { x: 187.45, y: -1576.10, z: 29.29 },
  { x: 448.73, y: -1456.60, z: 29.30 },
  { x: -16.72, y: -1573.28, z: 29.30 },
  { x: -831.34, y: -1134.63, z: 7.94 },
  { x: -1131.89, y: -1299.00, z: 5.20 },
  { x: -1316.29, y: -1283.29, z: 4.87 },
  { x: -1340.16, y: -1015.74, z: 7.94 },
  { x: -867.30, y: -810.46, z: 19.32 }
];

const collectedGunoaie = new Set<number>();
let nearbyMarkerIndex: number | null = null;

// Prompt E când ești aproape de un gunoi NEcolectat
mp.events.add("render", () => {
  const pos = mp.players.local.position;
  nearbyMarkerIndex = null;

  gunoaieMarkers.forEach((marker, index) => {
    if (collectedGunoaie.has(index)) return;

    const dist = mp.game.gameplay.getDistanceBetweenCoords(
      pos.x, pos.y, pos.z, marker.x, marker.y, marker.z, true
    );

    if (dist < 2.0) {
      nearbyMarkerIndex = index;
      mp.game.graphics.drawText(
        "Apasa ~g~E~s~ pentru a cauta in gunoi",
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

// Apăsare E = încercare colectare
mp.keys.bind(0x45, false, () => {
  if (
    nearbyMarkerIndex !== null &&
    !mp.players.local.isPositionFrozen &&
    !collectedGunoaie.has(nearbyMarkerIndex)
  ) {
    mp.events.callRemote("tryCollectGunoaie", nearbyMarkerIndex);
  }
});

// Animatie cules gunoi + freeze player
mp.events.add("startGunoaieCollection", () => {
  const player = mp.players.local;
  const dict = "amb@prop_human_bum_bin@base";
  const anim = "base";

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
        1, // looped
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


// Primire cooldown pe gunoiul respectiv
mp.events.add("gunoiCollected", (index: number) => {
  collectedGunoaie.add(index);

  setTimeout(() => {
    collectedGunoaie.delete(index);
  }, 60 * 10000);
});
