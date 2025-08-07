import { isNumber } from 'lodash';
import hud from 'helpers/hud';
import InventoryStorage from 'basic/inventory';
import inventoryHelper from 'basic/inventory/helper';
import vehicleLock from 'vehicle/lock';
import equipment from '../equipment';
import hunger from '../hunger';
import thirst from '../thirst';
import alcohol from '../alcohol';
import drugs from '../drugs';
import health from '../health';
import playerStorage from './storage';
import { giveWeaponComponent } from 'basic/atasamente';
import factions from 'factions';
import moment from 'moment';
import factionsApi from 'factions/api';

class PlayerInventory {
	private storage: InventoryStorage;

	constructor(storage: InventoryStorage) {
		this.storage = storage;

		mp.events.subscribe({
			'Inventory-Drop': this.dropItem.bind(this),
			'Inventory-UnequipItem': this.unequipItem.bind(this),
			'Inventory-Use': this.useItem.bind(this),
			'Inventory-UseQuick': this.useQuickItem.bind(this),
			'Inventory-ToQuick': this.setToQuick.bind(this),
			'Inventory-RemoveAllAttachments': this.removeAllAttachments.bind(this),
'Inventory-EquipQuickSlot': async (player: Player, slot: string) => {
    if (!player.equipment) player.equipment = {};

    const quickItem = player.equipment[slot];
    if (!quickItem) {
        hud.showNotification(player, 'error', 'Nu ai niciun obiect pe acest slot rapid!', true);
        return player.equipment;
    }

    const items = player.inventory;
    const currentHand = player.equipment['hands'];

    // === Dacă există o altă armă pe hands (cell: -1), ȘTERGE-0 doar de pe cell -1 ===
    if (currentHand && currentHand.name !== quickItem.name) {
        // Șterge doar itemul de pe cell -1 (adică îl scoți din inventar ca "în mână")
        const idx = items.findIndex(i => i.cell === -1 && i.name === currentHand.name);
        if (idx !== -1) {
            items.splice(idx, 1); // Șterge DOAR referința de pe -1
        }
        await equipment.unequip(player, currentHand);
    }

    // Setează noul quick item ca fiind pe hands (cell: -1)
    quickItem.cell = -1;
    await equipment.equip(player, quickItem);
    player.equipment['hands'] = quickItem;

    // Salvează modificarea inventarului
    await playerStorage.updateInDb(player.dbId, items);

    // Returnează pentru update pe client
    return {
        equipment: player.equipment,
        inventory: items
    };
}


		});
	}

	checkEnoughSlots(player: Player, items: Omit<InventoryItem, 'cell'>[]) {
		const freeSlots =
			this.storage.getMaxWeight(player) - this.storage.getCurrentWeight(player.inventory);
		const cell = this.storage.getFreeCell(player, player.inventory);

		if (!isNumber(cell) || freeSlots < this.storage.getCurrentWeight(items as any)) {
			hud.showNotification(player, 'error', 'Spatiu insuficient in inventar', true);
			throw new SilentError('not enough slots');
		}
	}

	async clear(player: Player) {
		const items: InventoryItem[] = [];

		Object.entries(player.equipment).forEach(([slot, item]) => {
			if (slot === 'hands' || slot === 'ammo' || equipment.isQuickSlot(slot)) {
				equipment.unequip(player, item);
				items.push(item);
			}
		});
		player.inventory = player.inventory.filter((item) => {
			return (
				items.findIndex(({ name, cell }) => item.cell === cell && item.name === name) < 0
			);
		});

		await this.storage.updateInDb(player.dbId, player.inventory);
	}

async removeAllAttachments(player: Player, cell: number) {
    // 1. Găsește arma după cell
    const weaponItem = player.inventory.find(i => i.cell === cell);
    if (!weaponItem) {
        hud.showNotification(player, 'error', 'Arma nu a fost găsită în inventar!', true);
        // Returnează inventarul neschimbat ca să nu se desincronizeze UI-ul!
        return player.inventory;
    }
    const attachments = weaponItem.data?.attachments;
    if (!attachments || !attachments.length) {
        hud.showNotification(player, 'error', 'Această armă nu are atasamente.', true);
        return player.inventory;
    }

    // 2. Găsește și adaugă fiecare atasament în inventar
    for (const model of attachments) {
        const itemKey = inventoryHelper.findAttachmentKeyByModelAndWeapon(model, weaponItem.name);
        if (itemKey) {
            await this.addItem(player, { name: itemKey, amount: 1 });
        } else {
            console.log(`[DEBUG][ATASAMENT] Nu am găsit item pentru modelul: ${model}`);
        }
    }

    // 3. Golește array-ul de attachments
    weaponItem.data.attachments = [];
    await this.storage.updateInDb(player.dbId, player.inventory);

    // 4. Scoate vizual atasamentele dacă arma e în hands
    if (weaponItem.data?.slot === 'hands') {
        const weaponHash = mp.joaat('weapon_' + weaponItem.name);
        if ((player.mp as any).removeAllWeaponComponents) {
            (player.mp as any).removeAllWeaponComponents(weaponHash);
        }
        await equipment.equip(player, weaponItem);
    }

    hud.showNotification(player, 'success', 'Toate atasamentele au fost scoase de pe armă și adăugate în inventar.', true);

    // === RETURN INVENTARUL COMPLET ===
    return player.inventory;
}






//	async addItem(player: Player, item: Omit<InventoryItem, 'cell'>) {
//		await this.storage.add(player, player.inventory, item);
//		await this.storage.updateInDb(player.dbId, player.inventory);
//	}

async addItem(player: Player, item: Omit<InventoryItem, 'cell'>) {
	const existing = player.inventory.find(
		(i) => i.name === item.name && i.data === undefined // optional: compari și `data` dacă ai
	);

	if (existing) {
		existing.amount += item.amount;
	} else {
		await this.storage.add(player, player.inventory, item);
	}

	await this.storage.updateInDb(player.dbId, player.inventory);
}

	private async useItem(player: Player, cell: number, target?: InventoryItem) {
		const items = player.inventory;

		const item = target ?? this.storage.getItemOfCell(items, cell);
		const data = inventoryHelper.getItemData(item?.name);

		if (!item || item.amount <= 0 || !data || player.mp.getOwnVariable('isPlayingAnim')) {
			throw new SilentError('wrong item');
		}

		const slot = await equipment.equip(player, item);

		if (!slot) {
			switch (data.type) {
				case 'food':
					hunger.eat(player, item);
					break;
				case 'water':
					thirst.drink(player, item);
					break;
				case 'mancare':
					hunger.eat(player, item);
					break;
				case 'alcohol':
					alcohol.drink(player, item);
					break;


case 'sindicat': {
const fullName = player.getName?.() ?? 'Necunoscut';
console.log(`[DEBUG][Sindicat] fullName = '${fullName}'`);
// Presupunem formatul: "Prenume Nume"
const [firstName, ...lastNameParts] = fullName.trim().split(' ');
const lastName = lastNameParts.join(' ');
console.log(`[DEBUG][Sindicat] firstName = '${firstName}', lastName = '${lastName}'`);

	const registerAt = player.mp.getVariable?.('createdAt') ?? 'Necunoscut';

	const docData = {
		firstName: firstName ?? 'Necunoscut',
		lastName: lastName ?? '',
		registerAt
	};
	const faction = factions.getFaction(player.faction);


	if (!faction || faction.name.toLowerCase() !== 'sindicat') {
		player.notify("~r~Nu poti folosi acest document.");
		return;
	}

	let found = false;

	mp.players.forEach((p) => {
		//if (p.id === player.mp.id) return;

		const pos = p.position;
		if (!pos || p.dimension !== player.mp.dimension) return;

		const dist = Math.sqrt(
			Math.pow(player.mp.position.x - pos.x, 4) +
			Math.pow(player.mp.position.y - pos.y, 4) +
			Math.pow(player.mp.position.z - pos.z, 4)
		);

		//console.log(` - ${p.name ?? 'Necunoscut'} | dist: ${dist.toFixed(2)}m`);

		if (dist <= 4) {
			//console.log(`[Sindicat] -> Trimit catre ${p.name}`);
			p.call('ShowSindicat', [docData]);
			found = true;
		}
	});

	if (!found) {
		//console.log(`[Sindicat] Niciun jucator in apropiere.`);
		hud.showNotification(player, 'error', 'Nimeni in apropiere pentru a arata legitimatia.', true);
	}

	break;
}

case 'primarie': {
const fullName = player.getName?.() ?? 'Necunoscut';
console.log(`[DEBUG][Primarie] fullName = '${fullName}'`);
// Presupunem formatul: "Prenume Nume"
const [firstName, ...lastNameParts] = fullName.trim().split(' ');
const lastName = lastNameParts.join(' ');
console.log(`[DEBUG][Primarie] firstName = '${firstName}', lastName = '${lastName}'`);

	const registerAt = player.mp.getVariable?.('createdAt') ?? 'Necunoscut';

	const docData = {
		firstName: firstName ?? 'Necunoscut',
		lastName: lastName ?? '',
		registerAt
	};
	const faction = factions.getFaction(player.faction);


	if (!faction || faction.name.toLowerCase() !== 'primarie') {
		player.notify("~r~Nu poti folosi acest document.");
		return;
	}

	let found = false;

	mp.players.forEach((p) => {
		//if (p.id === player.mp.id) return;

		const pos = p.position;
		if (!pos || p.dimension !== player.mp.dimension) return;

		const dist = Math.sqrt(
			Math.pow(player.mp.position.x - pos.x, 4) +
			Math.pow(player.mp.position.y - pos.y, 4) +
			Math.pow(player.mp.position.z - pos.z, 4)
		);

		//console.log(` - ${p.name ?? 'Necunoscut'} | dist: ${dist.toFixed(2)}m`);

		if (dist <= 4) {
			//console.log(`[Primarie] -> Trimit catre ${p.name}`);
			p.call('ShowPrimarie', [docData]);
			found = true;
		}
	});

	if (!found) {
		//console.log(`[Primarie] Niciun jucator in apropiere.`);
		hud.showNotification(player, 'error', 'Nimeni in apropiere pentru a arata legitimatia.', true);
	}

	break;
}


case 'buletin': {
const fullName = player.getName?.() ?? 'Necunoscut';
const [firstName, ...lastNameParts] = fullName.trim().split(' ');
const lastName = lastNameParts.join(' ');

const registerAt = player.registerAt ? moment(player.registerAt).format('L') : 'Necunoscut';

const rawGender = player.gender ?? 'Necunoscut';
const gender =
	rawGender === 'male' ? 'Bărbat' :
	rawGender === 'female' ? 'Femeie' :
	'Necunoscut';

const docData = {
	firstName: firstName || 'Necunoscut',
	lastName: lastName || 'Necunoscut',
	gender,
	registerAt
};


	let found = false;

	mp.players.forEach((p) => {

		const pos = p.position;
		if (!pos || p.dimension !== player.mp.dimension) return;

		const dist = Math.sqrt(
			Math.pow(player.mp.position.x - pos.x, 4) +
			Math.pow(player.mp.position.y - pos.y, 4) +
			Math.pow(player.mp.position.z - pos.z, 4)
		);



		if (dist <= 4) {
			p.call('ShowBuletin', [docData]);
			found = true;
		}
	});

	if (!found) {
		hud.showNotification(player, 'error', 'Nimeni in apropiere pentru a arata legitimatia.', true);
	}

	break;
}


case 'smurd': {
const fullName = player.getName?.() ?? 'Necunoscut';
//console.log(`[DEBUG][SMURD] fullName = '${fullName}'`);
// Presupunem formatul: "Prenume Nume"
const [firstName, ...lastNameParts] = fullName.trim().split(' ');
const lastName = lastNameParts.join(' ');
//console.log(`[DEBUG][SMURD] firstName = '${firstName}', lastName = '${lastName}'`);

	const registerAt = player.mp.getVariable?.('createdAt') ?? 'Necunoscut';

	const faction = factions.getFaction(player.faction);


	if (!faction || faction.name.toLowerCase() !== 'ems') {
		player.notify("~r~Nu poti folosi acest document.");
		return;
	}

	const rank = factionsApi.getPlayerRank(player);
	//console.log('[DEBUG] factionsApi.getPlayerRank:', rankObj); // debug

	//const rank = rankObj?.name ?? 'Necunoscut';
	//console.log(rank);
	const docData = {
		firstName: firstName || 'Necunoscut',
		lastName: lastName || '',
		registerAt,
		rank
	};

	let found = false;

	mp.players.forEach((p) => {
		//if (p.id === player.mp.id) return;

		const pos = p.position;
		if (!pos || p.dimension !== player.mp.dimension) return;

		const dist = Math.sqrt(
			Math.pow(player.mp.position.x - pos.x, 4) +
			Math.pow(player.mp.position.y - pos.y, 4) +
			Math.pow(player.mp.position.z - pos.z, 4)
		);

		//console.log(` - ${p.name ?? 'Necunoscut'} | dist: ${dist.toFixed(2)}m`);

		if (dist <= 4) {
			//console.log(`[SMURD] -> Trimit catre ${p.name}`);
			p.call('ShowSmurd', [docData]);
			found = true;
		}
	});

	if (!found) {
		//console.log(`[SMURD] Niciun jucator in apropiere.`);
		hud.showNotification(player, 'error', 'Nimeni in apropiere pentru a arata legitimatia.', true);
	}

	break;
}

case 'politie': {
	const fullName = player.getName?.() ?? 'Necunoscut';
	const [firstName, ...lastNameParts] = fullName.trim().split(' ');
	const lastName = lastNameParts.join(' ');

	const registerAt = player.mp.getVariable?.('createdAt') ?? 'Necunoscut';

	const faction = factions.getFaction(player.faction);

	if (!faction || faction.name.toLowerCase() !== 'lspd') {
		player.notify("~r~Nu poti folosi acest document.");
		return;
	}

	const rank = factionsApi.getPlayerRank(player);
	//console.log('[DEBUG] factionsApi.getPlayerRank:', rankObj); // debug

	//const rank = rankObj?.name ?? 'Necunoscut';
	//console.log(rank);
	const docData = {
		firstName: firstName || 'Necunoscut',
		lastName: lastName || '',
		registerAt,
		rank
	};

	let found = false;

	mp.players.forEach((p) => {
		const pos = p.position;
		if (!pos || p.dimension !== player.mp.dimension) return;

		const dist = player.mp.position.subtract(pos).length();
		if (dist <= 4 || p.id === player.mp.id) {
			p.call('ShowPolitie', [docData]);
			found = true;
		}
	});

	if (!found) {
		hud.showNotification(player, 'error', 'Nimeni in apropiere pentru a arata legitimatia.', true);
	}

	break;
}





				case 'drugs':
					drugs.use(player, item);
					break;
				case 'medicine':
					await health.selfHeal(player, item);
					break;

case 'atasament': {
    // 1. Găsește arma echipată în hands
    const equippedWeaponItem = player.inventory.find(
        i => i.cell === -1 && i.data?.slot === 'hands'
    );
    const equippedWeapon = equippedWeaponItem?.name;
    if (!equippedWeapon) {
        console.log('[DEBUG][ATASAMENT] Nu ai nicio armă echipată');
        // Returnează itemul ca să rămână în inventar
        return {
            item, // <-- păstrezi itemul!
            weight: this.storage.getCurrentWeight(items),
            equipment: slot
        };
    }

    if (!data.compatibleWeapons.includes(equippedWeapon)) {
        console.log(`[DEBUG][ATASAMENT] Atasamentul '${item.name}' nu este compatibil cu arma '${equippedWeapon}'`);
        // Returnează itemul ca să rămână în inventar
        return {
            item,
            weight: this.storage.getCurrentWeight(items),
            equipment: slot
        };
    }

    if (!equippedWeaponItem.data.attachments)
        equippedWeaponItem.data.attachments = [];

    if (equippedWeaponItem.data.attachments.includes(data.model)) {
        console.log('[DEBUG][ATASAMENT] Această componentă este deja montată pe armă!');
        // Returnează itemul ca să rămână în inventar
        return {
            item,
            weight: this.storage.getCurrentWeight(items),
            equipment: slot
        };
    }

    // Scoate componenta din inventar
    inventoryHelper.removeItem(items, item);
    await this.storage.updateInDb(player.dbId, items);

    // Adaugă componenta la arma din inventar
    equippedWeaponItem.data.attachments.push(data.model);

    // Aplica componenta vizual (optional)
    const weaponHash = mp.joaat('weapon_' + equippedWeapon);
    const componentHash = mp.joaat(data.model);
    (player.mp as any).giveWeaponComponent(weaponHash, componentHash);

    await equipment.equip(player, equippedWeaponItem);

    console.log('[DEBUG][ATASAMENT] Atasamentul a fost adăugat și salvat pe armă:', equippedWeaponItem);

    // Numai acum itemul dispare din inventar!
    return {
        item: undefined,
        weight: this.storage.getCurrentWeight(items),
        equipment: slot
    };
}






					
					
					

					

				default:
					if (item.name === 'lockpick') await vehicleLock.pick(player, item);
					break;
			}
		}

		return {
			item: item.amount > 0 ? item : inventoryHelper.removeItem(items, item),
			weight: this.storage.getCurrentWeight(items),
			equipment: slot
		};
	}

	private async useQuickItem(player: Player, slot: string) {
		const item = equipment.getEquipment(player, slot);
		if (!item) return;

		const data = await this.useItem(player, -1, item);
		if (data.equipment || !data.item) equipment.setToSlot(player, slot);
	}

	private setToQuick(player: Player, cell: number, slot: string) {
		const item = this.storage.getItemOfCell(player.inventory, cell);
		if (!item) throw new SilentError("item doesn't exists");

		equipment.setToSlot(player, slot, item);

		return item;
	}


private async dropItem(player: Player, cell: number | string) {
    const item = isNumber(cell)
        ? this.storage.getItemOfCell(player.inventory, cell)
        : equipment.getEquipment(player, cell);

    if (!item || item.amount <= 0 || player.mp.vehicle) {
        throw new SilentError('item does not exists');
    }

    // Curățare din quick slots dacă arunci din hands
    if (typeof cell === 'string' && cell === 'hands' && player.equipment) {
        for (const [quickSlot, eqItem] of Object.entries(player.equipment)) {
            if (equipment.isQuickSlot(quickSlot) && eqItem?.name === item.name) {
                player.equipment[quickSlot] = undefined;
            }
        }
    }
    if (isNumber(cell) && cell === -1) {
        for (const [slot, eqItem] of Object.entries(player.equipment)) {
            if (equipment.isQuickSlot(slot) && eqItem?.name === item.name) {
                player.equipment[slot] = undefined;
            }
        }
    }

    await equipment.unequip(player, item);
    inventoryHelper.removeItem(player.inventory, item);
    await this.storage.updateInDb(player.dbId, player.inventory);

    mp.pickups.create(player.mp.position, player.mp.dimension, item);

    // === RETURN pentru update instant pe client ===
    return {
        equipment: player.equipment,
        inventory: player.inventory,
        weight: this.storage.getCurrentWeight(player.inventory)
    };
}



private async unequipItem(player: Player, slot: string, cell?: number) {
    const item = equipment.getEquipment(player, slot);
    if (!item) throw new SilentError("this slot doesn't equip");

    // Șterge din quick sloturi dacă e nevoie (cum ai deja)
    if (slot === 'hands' && player.equipment) {
        for (const [quickSlot, eqItem] of Object.entries(player.equipment)) {
            if (equipment.isQuickSlot(quickSlot) && eqItem?.name === item.name) {
                player.equipment[quickSlot] = undefined;
            }
        }
    }

    const targetCell =
        isNumber(cell) && !this.storage.getItemOfCell(player.inventory, cell)
            ? cell
            : this.storage.getFreeCell(player, player.inventory);

    if (!targetCell) throw new SilentError('not enough slots');
    if (slot === 'backpack' && cell > 5) throw new SilentError('is backpack cell');

    await equipment.unequip(player, item);
    item.cell = targetCell;

    // Aici returnezi totul pentru update vizual instant pe client!
    return {
        equipment: player.equipment,
        inventory: player.inventory,
        weight: this.storage.getCurrentWeight(player.inventory)
    };
}



async removeItemAmount(player: Player, itemName: string, amount: number) {
  const item = player.inventory.find(i => i.name === itemName);

  if (!item || item.amount < amount) {
    throw new Error('Nu ai suficienti iteme in inventar');
  }

  item.amount -= amount;

  if (item.amount <= 0) {
    player.inventory = player.inventory.filter(i => i !== item);
  }

  await this.storage.updateInDb(player.dbId, player.inventory);
}

}

export default new PlayerInventory(playerStorage);
