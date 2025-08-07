import inventory from 'basic/inventory/helper';
import clothes from './clothes';
import equipment from './equipment';

class PlayerArmor {
    set(player: Player, item: InventoryItem) {
        let toAdd = 0;
        switch (item.name) {
            case "armor_small": toAdd = 25; break;
            case "armor_medium": toAdd = 50; break;
            case "armor_heavy": toAdd = 100 - (player.mp.armour ?? 0); break;
            default: toAdd = 0;
        }

        if (toAdd <= 0 || item.amount <= 0) return;

        let newArmor = (player.mp.armour ?? 0) + toAdd;
        if (newArmor > 100) newArmor = 100;

        player.mp.armour = newArmor;

        // Consumă vesta
        item.amount -= 1;
        if (item.amount <= 0) {
            const idx = player.inventory.indexOf(item);
            if (idx !== -1) player.inventory.splice(idx, 1);
        }

        // Opțional: salvează armura pentru persistenta la login
        player.armorValue = newArmor;
    }

    // Scoate complet armura (opțional, pentru comenzi admin etc)
    remove(player: Player) {
        player.mp.armour = 0;
    }
}

export default new PlayerArmor();