// src_server/src/gunoaie/index.ts

import { randomGunoiOrNothing } from './data';
import playerInventory from 'player/inventory';
import jucator from 'helpers/players';

mp.events.add("tryCollectGunoaie", async (playerMp: PlayerMp, index: number) => {
  const player = jucator.get(playerMp.id);
  if (!player) return;

  player.mp.call("startGunoaieCollection");

  setTimeout(async () => {
const gunoi = randomGunoiOrNothing();
if (!gunoi) {
  player.mp.call("AnuntNotification", ["Ai fost muscat de un sobolan", "danger"]);
  
  // Scade 10% din viață
  const health = player.mp.health; // GTA health (max 100)
  player.mp.health = Math.max(1, health - 10); // Nu lasă să moară instant

  player.mp.call("gunoiCollected", [index]);
  return;
}


    const amount = 1;
    const item = { name: gunoi, amount };

    try {
      await playerInventory.checkEnoughSlots(player, [item]);
      await playerInventory.addItem(player, item);
      player.mp.call("AnuntNotification", [`Ai gasit ${amount}x ${gunoi}`, 'success']);
    } catch (err) {
      player.mp.call("AnuntNotification", ['Inventarul este plin!', 'danger']);
    }

    player.mp.call("gunoiCollected", [index]);
  }, 5000);
});
