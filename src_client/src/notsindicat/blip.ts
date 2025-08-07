let alertaWaypoint: BlipMp | null = null;
let alertaInterval: NodeJS.Timeout | null = null;

mp.events.add('client:alertaSindicatAccept', (x: number, y: number, z: number) => {
  // Curățare anterioară
  if (alertaWaypoint) alertaWaypoint.destroy();
  if (alertaInterval) clearInterval(alertaInterval);

  const position = new mp.Vector3(x, y, z);

  // 🔵 Waypoint GPS (rămâne până ajungi)
  alertaWaypoint = mp.blips.new(1, position, {
    scale: 1,
    color: 1,
    name: 'Alertă Sindicat',
    shortRange: false
  });
  alertaWaypoint.setRoute(true);
  alertaWaypoint.setRouteColour(1);

  // 👣 Când te apropii, dispare
  alertaInterval = setInterval(() => {
    const pos = mp.players.local.position;
    const dist = mp.game.system.vdist(pos.x, pos.y, pos.z, position.x, position.y, position.z);

    if (dist < 60) {
      if (alertaWaypoint) alertaWaypoint.destroy();
      alertaWaypoint = null;

      clearInterval(alertaInterval!);
      alertaInterval = null;
    }
  }, 1000);
});
