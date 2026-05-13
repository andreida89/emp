import CharModel from 'models/Character';
import jucator from 'helpers/players';

mp.events.add('server:saveHudSettings', async (player: PlayerMp, json: string) => {
    try {
        const pd = jucator.get(player.id);
        if (!pd || !pd.dbId) return;

        const data = JSON.parse(json);
        
        pd.hudSettings = {
            visibility: data.visibility,
            styles: data.styles
        };
        
        await CharModel.findByIdAndUpdate(pd.dbId, {
            $set: {
                hudSettings: pd.hudSettings
            }
        });
        
        // Dacă e necesar sa trimitem notificari putem face asta:
        // player.notify('~g~Setari HUD salvate cu succes!');

    } catch (e) {
        console.error('Error in server:saveHudSettings', e);
    }
});
