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
		const weapon = mp.joaat(`weapon_${name}`);
		const ammoAmount = item && item.data && typeof item.data.ammo === 'number' ? item.data.ammo : 0;
		
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
		player.mp.setVariable('currentWeaponComponents', null);
		(player.mp as any).__weaponComponents = {};
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
		const weapon = equipment.getEquipment(player, 'hands');
		if (!weapon) return;

		const amount = player.mp.weaponAmmo;

		if (!weapon.data) weapon.data = {};
		weapon.data.ammo = amount;

		const fakeAmmo = player.equipment['ammo'];
		if (fakeAmmo) fakeAmmo.amount = amount;
	}
}

export default new Weapons();
