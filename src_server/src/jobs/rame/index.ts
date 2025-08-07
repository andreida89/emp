import playerInventory from 'player/inventory';
import jucator from 'helpers/players';

const culesrameBlip = new mp.Vector3(-2409.11, 2435.39, 4.86);

mp.blips.new(1, culesrameBlip, {
  name: "Cules de Rame",
  color: 75,
  shortRange: true,
});

mp.events.add("tryCollectRame", async (playerMp: PlayerMp, index: number) => {
  const player = jucator.get(playerMp.id);
  if (!player) return;

  player.mp.call("startRameCollection");

  setTimeout(async () => {
    const amount = Math.floor(Math.random() * 5) + 1;
    const item = { name: 'rame', amount }; // Fixed here

    try {
      await playerInventory.checkEnoughSlots(player, [item]);
      await playerInventory.addItem(player, item);
      player.mp.call("AnuntNotification", [`Ai cules ${amount}x rame`, 'success']);
    } catch (err) {
      player.mp.call("AnuntNotification", ['Inventarul este plin!', 'danger']);
    }

    player.mp.call("rameCollected", [index]);
  }, 5000);
});


