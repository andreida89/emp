import inventory from 'basic/inventory/helper';
import equipment from 'player/equipment';
import './sync';

class Weapons {
	constructor() {
		mp.events.subscribe({
			'Weapons-SaveAmmo': this.saveAmmo.bind(this)
		});
	}

giveWeapon(player: Player, name: string, item?: InventoryItem) {
    const ammoType = this.getAmmoOfWeapon(name);

    let ammo = equipment.getEquipment(player, 'ammo');
    if (ammo?.name !== ammoType) ammo = null;

    const weapon = mp.joaat(`weapon_${name}`);
    const ammoAmount = ammo?.amount ?? 0;
(player.mp as any).removeAllWeaponComponents(weapon);

    player.mp.giveWeapon(weapon, ammoAmount);
    player.callEvent('Weapons-GiveWeapon', [weapon, ammoAmount]);

    // === APLICĂ ATASAMENTELE DACĂ EXISTĂ PE ITEM ===
    if (item && item.data?.attachments?.length) {
        for (const model of item.data.attachments) {
            const componentHash = mp.joaat(model);
            (player.mp as any).giveWeaponComponent(weapon, componentHash);
        }
        console.log(`[DEBUG][WEAPON] Aplic atasamentele ${item.data.attachments.join(',')} pe weapon_${name}`);
    }
}


	giveAmmo(player: Player, item: InventoryItem) {
		const weapon = equipment.getEquipment(player, 'hands');

		if (weapon && this.getAmmoOfWeapon(weapon.name) !== item.name) {
			return mp.events.reject('Arma ta are un calibru diferit');
		}

		this.setAmmo(player, item.amount);
	}

	removeWeapon(player: Player) {
		player.mp.removeAllWeapons();
		player.callEvent('Weapons-RemoveWeapon');
	}

	removeAmmo(player: Player) {
		this.setAmmo(player, 0);
	}

	private getAmmoOfWeapon(weapon: string) {
		return inventory.getItemData(weapon)?.ammo as string;
	}

	private setAmmo(player: Player, amount: number) {
		if (!player.mp.weapon) return;

		player.mp.setWeaponAmmo(player.mp.weapon, amount);
		player.callEvent('Weapons-GiveAmmo', amount);
	}

	private saveAmmo(player: Player) {
		const ammo = equipment.getEquipment(player, 'ammo');
		if (!ammo) return;

		const amount = player.mp.weaponAmmo;

		if (amount > 0) ammo.amount = amount;
		else {
			equipment.unequip(player, ammo);
			inventory.removeItem(player.inventory, ammo);
		}
	}
}

export default new Weapons();
