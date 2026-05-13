import weapons from 'basic/weapons';
import inventoryHelper from 'basic/inventory/helper';
import backpack from './inventory/backpack';
import clothes from './clothes';
import armor from './armor';
// import { giveWeaponComponent } from 'basic/atasamente'; // nu mai e nevoie de import direct

const slots = {
	armor: 'armor',
	weapon: 'hands',
	backpack: 'backpack',
	atasament: 'atasament'
};

class PlayerEquipment {
	isEquipped(player: Player, item: InventoryItem) {
		const slot = item.data?.slot;
		return !!player.equipment[slot];
	}

	isQuickSlot(slot: string) {
		return slot && slot.split('_')[0] === 'quick';
	}

	getEquipment(player: Player, type: string, name?: string) {
		const item = player.equipment[type];
		return name && item?.name !== name ? null : item;
	}

	init(player: Player) {
		if (player.equipment) return;

		player.equipment = {};
		clothes.clear(player);
		player.inventory.forEach((item) => {
			const slot = item.data?.slot;
			const quickSlot = item.data?.quickSlot;

			// Dacă piesa avea un fast slot asignat, refacem legătura în obiectul de echipament
			if (quickSlot && this.isQuickSlot(quickSlot)) {
				this.setToSlot(player, quickSlot, item);
			}

			if (this.isQuickSlot(slot)) {
				this.setToSlot(player, slot, item);
			} else if (slot) {
				this.equip(player, item);
			}
		});
	}

	async equip(player: Player, item: InventoryItem) {
		const data = inventoryHelper.getItemData(item?.name);
		if (!data) return;

		const slot = this.getSlotForItem(item);
		if (!slot || player.equipment[slot]) return;

		await this.setItem(player, data.type, item);
		this.setToSlot(player, slot, item);

		// EXTRA LOGIC FOR WEAPON AMMO UI:
		if (data.type === 'weapon') {
			const ammoType = data.ammo; 
			const ammoAmount = item.data?.ammo || 0;
			if (ammoType && ammoAmount > 0) {
				const fakeAmmoItem = { name: ammoType, amount: ammoAmount, data: { slot: 'ammo' }, cell: -1 };
				this.setToSlot(player, 'ammo', fakeAmmoItem as any);
			} else {
				this.setToSlot(player, 'ammo', undefined);
			}
		}

		return slot;
	}

	async unequip(player: Player, item: InventoryItem) {
		const data = inventoryHelper.getItemData(item?.name);
		if (!data || !this.isEquipped(player, item)) return;

		const { slot } = item.data;

		if (!this.isQuickSlot(slot)) {
			switch (data.type) {
				case 'weapon':
					weapons.removeWeapon(player);
					this.setToSlot(player, 'ammo', undefined);
					break;
				case 'clothes':
					clothes.hide(player, item.name as any);
					break;
				case 'armor':
					armor.remove(player);
					break;
				case 'backpack':
					await backpack.remove(player, item);
					break;
				default:
					break;
			}
		}

		delete item.data.slot;
		this.setToSlot(player, slot);
	}

	setToSlot(player: Player, slot: string, item?: InventoryItem) {
		if (item) {
			item.cell = -1;
			// Păstrează informația despre quick slot la relog/echipare pe hands
			let previousQuickSlot = undefined;
			if (this.isQuickSlot(slot)) {
				previousQuickSlot = slot;
			} else if (item.data?.quickSlot) {
				previousQuickSlot = item.data.quickSlot;
			} else if (this.isQuickSlot(item.data?.slot)) {
				previousQuickSlot = item.data.slot;
			}

			item.data = { ...item.data, slot };
			if (previousQuickSlot) {
				item.data.quickSlot = previousQuickSlot;
			}

			player.equipment[slot] = item;

			// Dacă îl punem în mâini, dar el era pe un quick slot, actualizăm referința în memorie și pe acel slot rapid (dacă nu e deja)
			if (slot === 'hands' && previousQuickSlot && previousQuickSlot !== slot) {
				player.equipment[previousQuickSlot] = item;
			}
		} else {
			delete player.equipment[slot];
		}

		if (slot === 'hands') player.mp.setOwnVariable('inHand', item?.name);
		else if (this.isQuickSlot(slot)) {
			player.mp.setOwnVariable(slot, !!item);
		}
	}

	private getSlotForItem(item: InventoryItem) {
		const data = inventoryHelper.getItemData(item.name);
		if (data?.type === 'ammo') return undefined;
		const slot: string = slots[data?.type] ?? data?.equipment;

		return slot;
	}

	private async setItem(player: Player, type: string, item: InventoryItem) {
		const data = inventoryHelper.getItemData(item?.name);

		switch (type) {
			case 'clothes':
				clothes.set(player, item.name as any, item.data as any);
				break;
			case 'backpack':
				backpack.use(player, item);
				break;
			case 'armor':
				armor.set(player, item);
				break;
			case 'weapon':
				weapons.giveWeapon(player, item.name, item);
				break;
			// La 'atasament' nu mai faci nimic aici!
			default:
				break;
		}
	}
}

export default new PlayerEquipment();
