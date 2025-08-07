// ===================== SERVER-SIDE (jobs/salata.ts) =====================
import playerInventory from 'player/inventory';
import jucator from 'helpers/players';
import Branch from '../branch';
import { clothes } from './data';
import { addCulegatorSkill } from './addskill';


class Salata extends Branch {
  constructor() {
    super('Salata', 40, clothes);
  }

  startWork(player: Player) {
    super.startWork(player);
    player.mp.call("startSalataJob"); // activează marker-ele
  }

  finishWork(player: Player) {
    player.mp.call("stopSalataJob"); // dezactivează marker-ele
    super.finishWork(player);
  }
}

// === Acesta este în afara clasei! ===
mp.events.add("tryCollectSalata", async (playerMp: PlayerMp, index: number) => {
  const player = jucator.get(playerMp.id);
  if (!player) return;

  player.mp.call("startSalataCollection");

  setTimeout(async () => {
    const amount = Math.floor(Math.random() * 3) + 1;
    const item = { name: 'salata', amount };

    try {
      await playerInventory.checkEnoughSlots(player, [item]);
      await playerInventory.addItem(player, item);
      await addCulegatorSkill(player);
      player.mp.call("AnuntNotification", [`Ai cules ${amount}x salata`, 'success']);
    } catch (err) {
      player.mp.call("AnuntNotification", ['Inventarul este plin!', 'danger']);
    }

    player.mp.call("salataCollected", [index]);
  }, 5000);
});

export default new Salata();
