import playerInventory from 'player/inventory';
import jucator from 'helpers/players';
import Branch from '../branch';
import { clothes } from './data';
import { addCulegatorSkill } from './addskill';


class Mere extends Branch {
  constructor() {
    super('Mere', 40, clothes);
  }

  startWork(player: Player) {
    super.startWork(player);
    player.mp.call("startMereJob"); // activează marker-ele
  }

  finishWork(player: Player) {
    player.mp.call("stopMereJob"); // dezactivează marker-ele
    super.finishWork(player);
  }
}

// === Acesta este în afara clasei! ===
mp.events.add("tryCollectMere", async (playerMp: PlayerMp, index: number) => {
  const player = jucator.get(playerMp.id);
  if (!player) return;

  player.mp.call("startMereCollection");

  setTimeout(async () => {
    const amount = Math.floor(Math.random() * 3) + 1;
    const item = { name: 'mere', amount };

    try {
      await playerInventory.checkEnoughSlots(player, [item]);
      await playerInventory.addItem(player, item);
      await addCulegatorSkill(player);
      player.mp.call("AnuntNotification", [`Ai cules ${amount}x mere`, 'success']);
    } catch (err) {
      player.mp.call("AnuntNotification", ['Inventarul este plin!', 'danger']);
    }

    player.mp.call("mereCollected", [index]);
  }, 5000);
});

export default new Mere();
