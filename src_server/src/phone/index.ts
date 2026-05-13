import rpc from 'rage-rpc';
import './calls';
import './number';
import './contacts';
import './messages';

mp.events.subscribe({
    'Phone-HasPhone': (player: Player) => {
        if (!player) return false;
        
        // Check main inventory grid
        const inventory = player.inventory || [];
        const inInventory = inventory.some(item => item && item.name === 'telefon');
        if (inInventory) return true;
        
        // Check equipment slots (quick slots, hands, etc.)
        if (player.equipment) {
            const inEquipment = Object.values(player.equipment).some((item: any) => item && item.name === 'telefon');
            if (inEquipment) return true;
        }
        
        return false;
    }
});
