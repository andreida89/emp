import Levels from '../levels';
import hud from 'helpers/hud';
import CharModel from 'models/Character';

const levels = new Levels('Culegatorfructe', [85, 385, 480]);

export async function addCulegatorSkill(player: Player, points = 1) {
  if (levels.hasMaxLevel(player)) return;

  const current = levels.getCurrentLevel(player);

  if (player.skills['Culegatorfructe']) player.skills['Culegatorfructe'] += points;
  else player.skills['Culegatorfructe'] = points;

  await CharModel.findByIdAndUpdate(player.dbId, { skills: player.skills });

  if (current < levels.getCurrentLevel(player)) {
    hud.showNotification(player, 'success', 'Ai atins un nou nivel la jobul de culegator de fructe!');
  }
}
