import Job from '../job';
import Ziare from './ziare';
import playerInventory from 'player/inventory';
import jucator from 'helpers/players';

const branchZiare = new Ziare();

class ZiareJob extends Job {
    constructor() {
        super(
            'Ziare',
            [120, 340, 420],
            { x: -910.78, y: -450.44, z: 39.61 },
            { name: 'Job Livrator de Ziare', model: 478, color: 29 }
        );
    }

    async startWork(player: Player, level: number) {
        if (player.level < 2) return mp.events.reject('Este necesar nivelul 2 in joc');
        if (!player.hasLicense('car')) return mp.events.reject('Acest job necesita Permis categoria B');
        await super.startWork(player, level);
    }

    protected getBranchOfLevel(level: number) {
        return branchZiare;
    }
}

const job = new ZiareJob();
job.addBranch(branchZiare);

// Dă arma de ziare când primește event de la client!
mp.events.add('ziare:giveWeapon', (playerMp: PlayerMp) => {
    if (!mp.players.exists(playerMp)) return;
    playerMp.giveWeapon(0xF7F1E25E, 10);
});
mp.events.add('ziare:removeWeapon', (playerMp: PlayerMp) => {
    if (!mp.players.exists(playerMp)) return;
    playerMp.removeWeapon(0xF7F1E25E); // HASH WEAPON ziare (ex: snowball)
});

// Recompensă la fiecare livrare
mp.events.add('ziare:finishDelivery', async (playerMp: PlayerMp, index: number) => {
    const player = jucator.get(playerMp.id);
    if (!player) return;
    await playerInventory.addItem(player, { name: 'ron', amount: 50 });
    player.mp.call("AnuntNotification", [`Ai livrat ziarul si ai primit 50 RON`, 'success']);
});

// Oprește job-ul la demisie sau stop din meniu (triggerează cleanup la client)
mp.events.add('ziare:job:stop', (playerMp: PlayerMp) => {
    if (mp.players.exists(playerMp)) playerMp.call('ziareJob:stop');
});
mp.events.add('ziare:job:dismiss', (playerMp: PlayerMp) => {
    if (mp.players.exists(playerMp)) playerMp.call('ziareJob:stop');
});
mp.events.add('ziare:requestRefillPoint', (playerMp: PlayerMp) => {
    const player = jucator.get(playerMp.id);
    if (!player) return;
    // Reactivăm markerul la magazie!
    branchZiare.showCargoPoint(player);
});

export default job;
