import redis from './utils/redis';
import jucator from 'helpers/players';
import { eventLocations, activeEvent } from './eventManager';

let eventJoinAllowed = true;

mp.events.addCommand('event', async (player: PlayerMp, fullText: string, eventType: string) => {
  if (player.adminLvl < 2) return player.call('AnuntNotification', [`Nu ai acces la aceasta comanda!`, 'danger']);

  const eventData = eventLocations[eventType];
  if (!eventData) return player.call('AnuntNotification', [`Eveniment necunoscut!`, 'danger']);

  activeEvent = {
    type: eventData.name,
    position: new mp.Vector3(eventData.position.x, eventData.position.y, eventData.position.z),
    teams: eventData.teams
  };

  eventJoinAllowed = true;
  await mp.redis.del('event:participants');

	// Send to all players
	mp.players.forEach((p) => {
		p.call('AnuntNotification2', [`Un eveniment de tip ${eventData.name} a fost inceput! Foloseste /gotoevent pentru a intra.`, 'galben']);
	});

});


mp.events.addCommand('gotoevent', async (player: PlayerMp) => {
  const logicPlayer = jucator.get(player.id);
  if (!activeEvent) return player.call('AnuntNotification', [`Nu exista un eveniment activ!`, 'danger']);
  if (!eventJoinAllowed) return player.call('AnuntNotification', [`Intrarile la eveniment sunt oprite!`, 'danger']);
  if (!logicPlayer?.fixId) return player.call('AnuntNotification', [`Nu ai ID fix!`, 'danger']);

  player.position = activeEvent.position;
  player.dimension = 2;

  await mp.redis.sadd('event:participants', String(logicPlayer.fixId));

	player.call('AnuntNotification2', [`Ai intrat in eveniment.`, 'galben']);
});


mp.events.addCommand('stopgotoevent', (player: PlayerMp) => {
  if (player.adminLvl < 2) return player.call('AnuntNotification', [`Nu ai acces la aceasta comanda!`, 'danger']);
  if (!activeEvent) return player.call('AnuntNotification', [`Nu exista un eveniment activ!`, 'danger']);

  eventJoinAllowed = false;

	// Send to all players
	mp.players.forEach((p) => {
		p.call('AnuntNotification2', [`Intrarile la eveniment au fost oprite, echipele sunt complete.`, 'galben']);
	});

});


mp.events.add('playerQuit', async (player: PlayerMp) => {
  const logicPlayer = jucator.get(player.id);
  if (!logicPlayer?.fixId) return;

  await mp.redis.srem('event:participants', String(logicPlayer.fixId));
});


mp.events.addCommand('stopevent', async (player: PlayerMp) => {
  if (player.adminLvl < 2) return player.call('AnuntNotification', [`Nu ai acces la aceasta comanda!`, 'danger']);
  if (!activeEvent) return player.call('AnuntNotification', [`Nu exista un eveniment activ!`, 'danger']);

  const participantIds = await mp.redis.smembers('event:participants');

  mp.players.forEachFast((mpPlayer) => {
    const logicPlayer = jucator.get(mpPlayer.id);
    if (!logicPlayer?.fixId) return;

    const matched = participantIds.includes(String(logicPlayer.fixId));
    if (matched) {
      mpPlayer.dimension = 0;

      if (mpPlayer.oldClothes) {
        try {
          const c = mpPlayer.oldClothes;
          mpPlayer.setProp(0, c.hats.drawable, c.hats.texture);
          mpPlayer.setProp(1, c.glasses.drawable, c.glasses.texture);
          mpPlayer.setProp(2, c.ears.drawable, c.ears.texture);
          mpPlayer.setProp(6, c.watches.drawable, c.watches.texture);
          mpPlayer.setProp(7, c.bracelets.drawable, c.bracelets.texture);
          mpPlayer.setClothes(1, c.masks.drawable, c.masks.texture, c.masks.palette);
          mpPlayer.setClothes(3, c.torso.drawable, c.torso.texture, c.torso.palette);
          mpPlayer.setClothes(4, c.pants.drawable, c.pants.texture, c.pants.palette);
          mpPlayer.setClothes(5, c.bag.drawable, c.bag.texture, c.bag.palette);
          mpPlayer.setClothes(6, c.shoes.drawable, c.shoes.texture, c.shoes.palette);
          mpPlayer.setClothes(8, c.undershirts.drawable, c.undershirts.texture, c.undershirts.palette);
          mpPlayer.setClothes(9, c.tasks.drawable, c.tasks.texture, c.tasks.palette);
          mpPlayer.setClothes(7, c.accessories.drawable, c.accessories.texture, c.accessories.palette);
          mpPlayer.setClothes(11, c.tops.drawable, c.tops.texture, c.tops.palette);


          delete mpPlayer.oldClothes;
        } catch (err) {
          console.log(`Eroare la restaurarea hainelor pentru fixId ${logicPlayer.fixId}`, err);
        }
      }
    }
  });

  await mp.redis.del('event:participants');
  activeEvent = null;

  mp.players.forEach((p) => {
    p.call('AnuntNotification2', [`Evenimentul s-a incheiat, ne vedem la urmatorul!`, 'galben']);
  });
});



mp.events.addCommand('startevent', async (player: PlayerMp) => {
  if (player.adminLvl < 2) return player.call('AnuntNotification', [`Nu ai acces la aceasta comanda!`, 'danger']);
  if (!activeEvent) return player.call('AnuntNotification', [`Nu exista un eveniment activ!`, 'danger']);

  const participantIds = await mp.redis.smembers('event:participants');
  const total = participantIds.length;
  if (total < 2) return player.call('AnuntNotification', [`Prea putini jucatori pentru a incepe evenimentul!`, 'danger']);

  let mafiotiCount = 0;
  if (total <= 10) {
    const mafiaPreset = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];
    mafiotiCount = mafiaPreset[total - 1];
  } else {
    mafiotiCount = Math.floor(total * 0.3);
  }

  const shuffled = participantIds.sort(() => Math.random() - 0.5);
  const mafiotiIds = shuffled.slice(0, mafiotiCount);
  const diicotIds = shuffled.slice(mafiotiCount);

  mp.players.forEachFast(mpPlayer => {
    const logicPlayer = jucator.get(mpPlayer.id);
    if (!logicPlayer?.fixId) return;

    const fixIdStr = String(logicPlayer.fixId);
    const isDiicot = diicotIds.includes(fixIdStr);
    const teamPos = isDiicot ? activeEvent.teams.diicot : activeEvent.teams.mafioti;

    mpPlayer.dimension = 2;
    mpPlayer.position = new mp.Vector3(teamPos.x, teamPos.y, teamPos.z);

    if (isDiicot) {
      mpPlayer.oldClothes = {
        tops: mpPlayer.getClothes(11),
        pants: mpPlayer.getClothes(4),
        shoes: mpPlayer.getClothes(6),
        masks: mpPlayer.getClothes(1),
        accessories: mpPlayer.getClothes(7),
        tasks: mpPlayer.getClothes(9),
        torso: mpPlayer.getClothes(3),
        undershirts: mpPlayer.getClothes(8),
        bag: mpPlayer.getClothes(5),
        hats: mpPlayer.getProp(0),
        glasses: player.getProp(1),
        ears: player.getProp(2),
        watches: player.getProp(6),
        bracelets: player.getProp(7),
      };
      

      const diicotClothes = {
        male: {
          tops: [178, 0],
          pants: [77, 0],
          shoes: [55, 0],
          masks: [0, 0],
          accessories: [0, 0],
          tasks: [0, 0],
          torso: [15, 0],
          undershirts: [15, 0],
          bag: [0, 0],
          hats: [91, 0],
          glasses: [0, 0],
          ears: [0, 0],
          watches: [0, 0],
          bracelets: [0, 0],
        },
        female: {
          tops: [0, 0],
          pants: [35, 0],
          shoes: [25, 0],
          masks: [0, 0],
          accessories: [0, 0],
          tasks: [0, 0],
          torso: [65, 0],
          undershirts: [15, 0],
          bag: [0, 0],
          hats: [91, 0],
          glasses: [0, 0],
          ears: [0, 0],
          watches: [0, 0],
          bracelets: [0, 0],
        }
      };

      const gender = mpPlayer.gender === 0 ? 'female' : 'male';
      const c = diicotClothes[gender];

      setTimeout(() => {
        mpPlayer.setProp(0, c.hats[0], c.hats[1]);
        mpPlayer.setProp(1, c.glasses[0], c.glasses[1]);
        mpPlayer.setProp(2, c.ears[0], c.ears[1]);
        mpPlayer.setProp(6, c.watches[0], c.watches[1]);
        mpPlayer.setProp(7, c.bracelets[0], c.bracelets[1]);
        mpPlayer.setClothes(1, c.masks[0], c.masks[1], 0);
        mpPlayer.setClothes(3, c.torso[0], c.torso[1], 0);
        mpPlayer.setClothes(4, c.pants[0], c.pants[1], 0);
        mpPlayer.setClothes(5, c.bag[0], c.bag[1], 0);
        mpPlayer.setClothes(6, c.shoes[0], c.shoes[1], 0);
        mpPlayer.setClothes(8, c.undershirts[0], c.undershirts[1], 0);
        mpPlayer.setClothes(9, c.tasks[0], c.tasks[1], 0);
        mpPlayer.setClothes(7, c.accessories[0], c.accessories[1], 0);
        mpPlayer.setClothes(11, c.tops[0], c.tops[1], 0);

        const pos = mpPlayer.position;
        mpPlayer.position = new mp.Vector3(pos.x + 0.01, pos.y, pos.z);

        if (mpPlayer.getCustomization && mpPlayer.setCustomization) {
          mpPlayer.setCustomization(mpPlayer.getCustomization());
        }
      }, 1000);
    }

    mpPlayer.call('AnuntNotification', [`Ai fost ales in echipa ${isDiicot ? 'SCCO' : 'Mafioti'}!`, 'success']);
  });

  mp.players.forEach((p) => {
    p.call('AnuntNotification2', [`Evenimentul a inceput. Echipele au fost create!`, 'galben']);
  });
});
