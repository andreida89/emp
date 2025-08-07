import { weightedRandomMushroom } from './data';
import playerInventory from 'player/inventory';
import jucator from 'helpers/players';

const culesciuperciBlip = new mp.Vector3(1267.16, 1701.67, 82.92);

mp.blips.new(1, culesciuperciBlip, {
  name: "Culegator de Ciuperci",
  color: 75,
  shortRange: true,
});


mp.events.add("tryCollectMushroom", async (playerMp: PlayerMp, index: number) => {
  const player = jucator.get(playerMp.id);
  if (!player) return;

  player.mp.call("startMushroomCollection");

  setTimeout(async () => {
    const amount = Math.floor(Math.random() * 5) + 1;
    const mushroom = weightedRandomMushroom();
    const item = { name: mushroom, amount };

    try {
      await playerInventory.checkEnoughSlots(player, [item]);
      await playerInventory.addItem(player, item);
      player.mp.call("AnuntNotification", [`Ai cules ${amount}x ${mushroom}`, 'success']);
    } catch (err) {
      player.mp.call("AnuntNotification", ['Inventarul este plin!', 'danger']);
    }

    player.mp.call("mushroomCollected", [index]);
  }, 5000);
});

