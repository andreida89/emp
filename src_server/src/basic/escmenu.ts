import rpc from 'rage-rpc';
import User from '../models/User';
import Character from '../models/Character';
import Vehicle from '../models/Vehicle';
import factions from '../factions';
import jucator from '../helpers/players';

rpc.register('EscMenu-GetUserData', async (data: any, info: rpc.PlayerMeta) => {
    const playerMp = info.player as PlayerMp;
    const player = jucator.get(playerMp.id);
    if (!player || !player.account || !player.dbId) return null;

    try {
        const user = await User.findById(player.account).lean();
        const char = await Character.findById(player.dbId).lean();
        if (!user || !char) return null;

        const nume = char.firstName + ' ' + char.lastName;
        let jucateMin = char.playedTime || 0;
        let playedHours = Math.floor(jucateMin / 60);
        
        let factiune = 'Niciuna';
        let rank = 'Membru';
        let factionMembersOnline = 0;
        
        if (player.faction) {
           const fact = factions.getFaction(player.faction);
           if (fact) {
               factiune = fact.name.toUpperCase();
               const member = fact.members?.getMember(player);
               if (member) {
                   const rankData = fact.ranks?.getRank(member.rank);
                   if (rankData) {
                       rank = rankData.permissions?.leader ? 'Lider' : rankData.name;
                   }
               }
               // Get how many online in this faction
               factionMembersOnline = mp.players.toArray().filter((p: any) => jucator.get(p.id)?.faction === player.faction).length;
           } else {
               factiune = player.faction.toUpperCase();
           }
        }

        const job = player.job && player.job.name ? player.job.name : 'Somer';
        const cashItem = player.inventory?.find(i => i.name === 'ron');
        const cash = cashItem ? cashItem.amount : 0;
        const bank = char.money?.bank || 0;
        
        const donate = user.donate || 0;
        const varsta = char.age || 25; // fallback
        const telefon = char.phone?.number || 'Fara Numar';
        const level = player.level || 1;
        
        const vehs = await Vehicle.find({ owner: char._id }).lean();
        const vehiclesData = vehs.map(v => ({ id: v.uid || 0, model: v.name, plate: v.numberPlate }));

        const playersOnline = mp.players.toArray().map((p: any) => {
            const pDoc = jucator.get(p.id);
            return {
                id: pDoc?.fixId || p.id,
                name: p.name || 'Necunoscut'
            };
        });

        return {
            id: player.fixId || char.uid,
            firstName: char.firstName,
            lastName: char.lastName,
            nume,
            oreJucate: playedHours,
            job,
            factiune,
            factionMembersOnline,
            rank,
            cash: cash.toLocaleString('ro-RO'),
            bank: bank.toLocaleString('ro-RO'),
            donate,
            varsta,
            telefon,
            level,
            vehicles: vehiclesData,
            players: playersOnline
        };
    } catch(err) { 
        console.error("EscMenu-GetUserData Server Error:", err); 
        return null; 
    }
});

rpc.register('EscMenu-QuitGame', async (data: any, info: rpc.PlayerMeta) => {
    const playerMp = info.player as PlayerMp;
    playerMp.kick('Ai iesit din joc.');
});
