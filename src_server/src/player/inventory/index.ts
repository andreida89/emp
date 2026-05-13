import { isNumber } from 'lodash';
import hud from 'helpers/hud';
import money from 'helpers/money';
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
			'Inventory-LoadAmmo': this.loadAmmo.bind(this),
			'Inventory-RemoveAllAttachments': this.removeAllAttachments.bind(this),
			'Inventory-EquipQuickSlot': async (player: Player, slot: string) => {
				if (!player.equipment) player.equipment = {};

				const quickItem = player.equipment[slot];
				if (!quickItem) {
					hud.showNotification(player, 'error', 'Nu ai niciun obiect pe acest slot rapid!', true);
					return { equipment: JSON.parse(JSON.stringify(player.equipment)), inventory: JSON.parse(JSON.stringify(player.inventory)) };
				}

				const data = inventoryHelper.getItemData(quickItem.name);
				if (!data) return { equipment: JSON.parse(JSON.stringify(player.equipment)), inventory: JSON.parse(JSON.stringify(player.inventory)) };

				const items = player.inventory;

				// Dacă e consumabil (mâncare, apă, droguri etc.) folosim useItem
				if (['food', 'water', 'mancare', 'alcohol', 'drugs', 'health', 'medicine'].includes(data.type)) {
					const useData = await this.useItem(player, -1, quickItem);
					if (!useData.item || useData.item.amount <= 0) {
						equipment.setToSlot(player, slot, undefined); // Ștergem din slot-ul rapid dacă s-a terminat
					}
					await playerStorage.updateInDb(player.dbId, player.inventory);
					return { equipment: JSON.parse(JSON.stringify(player.equipment)), inventory: JSON.parse(JSON.stringify(player.inventory)) };
				}

				if (data.type === 'ammo') {
					hud.showNotification(player, 'error', 'Foloseste INCARCA din inventar pentru munitie.', true);
					return { equipment: JSON.parse(JSON.stringify(player.equipment)), inventory: JSON.parse(JSON.stringify(player.inventory)) };
				}

				// Dacă e un item echipabil (ex: armă)
				const targetSlot = data.type === 'weapon' ? 'hands' : data.equipment || data.type;
				const currentEquipped = player.equipment[targetSlot];

				// Verificăm dacă exact acest item este deja echipat (toggle off)
				if (currentEquipped && currentEquipped.name === quickItem.name) {
					await equipment.unequip(player, currentEquipped);

					// Punem weaponul înapoi în quick slot, nu in grid!
					quickItem.cell = -1;
					quickItem.data = { ...quickItem.data, slot: slot };
					player.equipment[slot] = quickItem;
				} else {
					// Toggle on (echipare)
					let wasQuickSlot = null;
					if (currentEquipped) {
						for (const [qSlot, eqItem] of Object.entries(player.equipment)) {
							if (equipment.isQuickSlot(qSlot) && eqItem?.name === currentEquipped.name) {
								wasQuickSlot = qSlot;
								break;
							}
						}

						// Scoatem arma/echipamentul anterior pentru a face loc
						await equipment.unequip(player, currentEquipped);

						if (wasQuickSlot) {
							currentEquipped.data = { ...currentEquipped.data, slot: wasQuickSlot };
						} else {
							const freeCell = this.storage.getFreeCell(player, items);
							if (freeCell !== null && freeCell !== undefined) {
								currentEquipped.cell = freeCell as number;
							}
						}
					}

					try {
						quickItem.cell = -1;
						await equipment.equip(player, quickItem);
						// După echipare, item-ul primește data.slot = 'hands' (sau altul). Noi forțăm să rămână și referința în quick slot pentru UI.
						player.equipment[slot] = quickItem;
					} catch (err: any) {
						// Afișăm eroarea primită (ex: "Arma ta are un calibru diferit")
						const errorMsg = err.msg || err.message || 'Eroare la echipare';
						hud.showNotification(player, 'error', errorMsg, true);

						// Re-echipăm obiectul anterior dacă exista, pentru a nu rămâne și fără cel de dinainte
						if (currentEquipped) {
							await equipment.equip(player, currentEquipped);
							if (wasQuickSlot) player.equipment[wasQuickSlot] = currentEquipped;
							else currentEquipped.cell = -1; // a fost re-echipat, nu îi trebuie cell in grid
						}

						quickItem.data = { ...quickItem.data, slot: slot };
						player.equipment[slot] = quickItem; // Păstrăm obiectul refuzat înapoi la fast slot
					}
				}

				await playerStorage.updateInDb(player.dbId, items);

				return {
					equipment: JSON.parse(JSON.stringify(player.equipment)),
					inventory: JSON.parse(JSON.stringify(items))
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
			return JSON.parse(JSON.stringify(player.inventory));
		}
		const attachments = weaponItem.data?.attachments;
		if (!attachments || !attachments.length) {
			hud.showNotification(player, 'error', 'Această armă nu are atasamente.', true);
			return JSON.parse(JSON.stringify(player.inventory));
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
		return JSON.parse(JSON.stringify(player.inventory));
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
		if (item.name === 'ron') money.syncCashWithHUD(player);
	}

	private async loadAmmo(player: Player, [cell, amount]: [number, number]) {
		const items = player.inventory;
		const ammoItem = this.storage.getItemOfCell(items, cell);
		if (!ammoItem) return mp.events.reject('Munitia nu exista');

		const ammoData = inventoryHelper.getItemData(ammoItem.name);
		if (!ammoData || ammoData.type !== 'ammo') return mp.events.reject('Acest item nu este munitie');

		if (ammoItem.amount < amount) amount = ammoItem.amount;

		// find equipped weapon
		let equippedWeaponItem = equipment.getEquipment(player, 'hands');

		if (!equippedWeaponItem && player.equipment) {
			for (const [qSlot, eqItem] of Object.entries(player.equipment)) {
				if (equipment.isQuickSlot(qSlot) && eqItem && inventoryHelper.getItemData(eqItem.name)?.type === 'weapon') {
					equippedWeaponItem = eqItem;
					break;
				}
			}
		}

		if (!equippedWeaponItem) {
			return mp.events.reject('Nu ai nicio arma in mana pentru a o incarca.');
		}

		const weaponData = inventoryHelper.getItemData(equippedWeaponItem.name);
		if (!weaponData || weaponData.type !== 'weapon') {
			return mp.events.reject('Acest obiect nu este o arma.');
		}

		if (weaponData.ammo !== ammoItem.name) {
			return mp.events.reject(`Aceasta arma foloseste ${weaponData.ammo}, nu ${ammoItem.name}.`);
		}

		if (!equippedWeaponItem.data) equippedWeaponItem.data = {};
		if (!equippedWeaponItem.data.ammo) equippedWeaponItem.data.ammo = 0;

		equippedWeaponItem.data.ammo += amount;
		ammoItem.amount -= amount;

		let removedItem = false;
		if (ammoItem.amount <= 0) {
			inventoryHelper.removeItem(items, ammoItem);
			removedItem = true;
		}

		const weaponHash = mp.joaat('weapon_' + equippedWeaponItem.name);
		player.mp.setWeaponAmmo(weaponHash, equippedWeaponItem.data.ammo);
		player.callEvent('Weapons-GiveAmmo', equippedWeaponItem.data.ammo);

		const fakeAmmoItem = player.equipment['ammo'];
		if (fakeAmmoItem && fakeAmmoItem.name === ammoItem.name) {
			fakeAmmoItem.amount = equippedWeaponItem.data.ammo;
		} else {
			equipment.setToSlot(player, 'ammo', {
				name: ammoItem.name,
				amount: equippedWeaponItem.data.ammo,
				data: { slot: 'ammo' },
				cell: -1
			} as any);
		}

		await this.storage.updateInDb(player.dbId, items);

		hud.showNotification(player, 'success', `Ai incarcat ${amount} gloante in arma.`, true);

		return {
			inventory: JSON.parse(JSON.stringify(items)),
			item: removedItem ? null : JSON.parse(JSON.stringify(ammoItem)),
			equipment: JSON.parse(JSON.stringify(player.equipment)),
			weight: this.storage.getCurrentWeight(items)
		};
	}

	private async useItem(player: Player, cell: number, target?: InventoryItem) {
		const items = player.inventory;

		const item = target ?? this.storage.getItemOfCell(items, cell);
		const data = inventoryHelper.getItemData(item?.name);

		if (!item || item.amount <= 0 || !data || player.mp.getOwnVariable('isPlayingAnim')) {
			throw new SilentError('wrong item');
		}

		if (data.type === 'ammo') {
			return this.loadAmmo(player, [item.cell, item.amount]);
		}

		if (data.type === 'weapon') {
			const weaponSlot = equipment.getSlotForItem(item);
			if (weaponSlot && player.equipment[weaponSlot]) {
				return mp.events.reject('Ai deja o arma in maini. Desechipeaza-o intai (apasa cifra 0 sau scoate-o din meniu).');
			}
		} else if (['clothes', 'armor', 'backpack'].includes(data.type)) {
			const targetSlot = equipment.getSlotForItem(item);
			if (targetSlot && player.equipment[targetSlot]) {
				const existingItem = player.equipment[targetSlot];
				await this.unequipItem(player, targetSlot, undefined);
			}
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
					const [firstName, ...lastNameParts] = fullName.trim().split(' ');
					const lastName = lastNameParts.join(' ');

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
						const pos = p.position;
						if (!pos || p.dimension !== player.mp.dimension) return;

						const dist = player.mp.dist(pos);

						if (dist <= 4 || p.id === player.mp.id) {
							p.call('ShowSindicat', [docData]);
							found = true;
						}
					});

					if (!found) {
						hud.showNotification(player, 'error', 'Nimeni in apropiere pentru a arata legitimatia.', true);
					}

					break;
				}

				case 'primarie': {
					const fullName = player.getName?.() ?? 'Necunoscut';
					const [firstName, ...lastNameParts] = fullName.trim().split(' ');
					const lastName = lastNameParts.join(' ');

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
						const pos = p.position;
						if (!pos || p.dimension !== player.mp.dimension) return;

						const dist = player.mp.dist(pos);

						if (dist <= 4 || p.id === player.mp.id) {
							p.call('ShowPrimarie', [docData]);
							found = true;
						}
					});

					if (!found) {
						hud.showNotification(player, 'error', 'Nimeni in apropiere pentru a arata legitimatia.', true);
					}

					break;
				}

				case 'buletin': {
					player.callEvent('Browser-HidePage');

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

						const dist = player.mp.dist(pos);

						if (dist <= 1.5 || p.id === player.mp.id) {
							p.call('ShowBuletin', [docData]);
							found = true;
						}
					});

					if (!found) {
						hud.showNotification(player, 'error', 'Nimeni in apropiere pentru a arata legitimatia.', true);
					}

					break;
				}

				case 'umu': {
					const fullName = player.getName?.() ?? 'Necunoscut';
					const [firstName, ...lastNameParts] = fullName.trim().split(' ');
					const lastName = lastNameParts.join(' ');

					const registerAt = player.mp.getVariable?.('createdAt') ?? 'Necunoscut';

					const faction = factions.getFaction(player.faction);


					if (!faction || faction.name.toLowerCase() !== 'umu') {
						player.notify("~r~Nu poti folosi acest document.");
						return;
					}

					const rank = factionsApi.getPlayerRank(player);
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

						const dist = player.mp.dist(pos);

						if (dist <= 4 || p.id === player.mp.id) {
							p.call('ShowUMU', [docData]);
							found = true;
						}
					});

					if (!found) {
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

					if (!faction || faction.name.toLowerCase() !== 'politie') {
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

						const dist = player.mp.dist(pos);
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
						//console.log('[DEBUG][ATASAMENT] Nu ai nicio armă echipată');
						// Returnează itemul ca să rămână în inventar
						return {
							item, // <-- păstrezi itemul!
							weight: this.storage.getCurrentWeight(items),
							equipment: slot
						};
					}

					if (!data.compatibleWeapons.includes(equippedWeapon)) {
						//console.log(`[DEBUG][ATASAMENT] Atasamentul '${item.name}' nu este compatibil cu arma '${equippedWeapon}'`);
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
						//console.log('[DEBUG][ATASAMENT] Această componentă este deja montată pe armă!');
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

					//console.log('[DEBUG][ATASAMENT] Atasamentul a fost adăugat și salvat pe armă:', equippedWeaponItem);

					// Numai acum itemul dispare din inventar!
					return {
						item: null,
						weight: this.storage.getCurrentWeight(items),
						equipment: JSON.parse(JSON.stringify(player.equipment))
					};
				}

				default:
					if (item.name === 'lockpick') await vehicleLock.pick(player, item);
					break;
			}

			// Clean up item if it was consumed
			if (item.amount <= 0 && ['food', 'water', 'mancare', 'alcohol', 'drugs', 'medicine'].includes(data.type)) {
				inventoryHelper.removeItem(items, item);
			}
		}

		return {
			inventory: JSON.parse(JSON.stringify(items)),
			item: item.amount > 0 ? item : null,
			weight: this.storage.getCurrentWeight(items),
			equipment: JSON.parse(JSON.stringify(player.equipment)),
			slot
		};
	}

	private async useQuickItem(player: Player, slot: string) {
		const item = equipment.getEquipment(player, slot);
		if (!item) return;

		const data = await this.useItem(player, -1, item);
		if (data.slot || !data.item) equipment.setToSlot(player, slot);

		await this.storage.updateInDb(player.dbId, player.inventory);
	}

	private async setToQuick(player: Player, cell: number | string, slot: string) {
		let item: InventoryItem | undefined;

		if (slot === 'ammo') throw new SilentError("Nu poți pune munitia aici direct.");
		if (cell === 'ammo') throw new SilentError("Nu poți muta munitia asa.");

		if (typeof cell === 'string' && equipment.isQuickSlot(cell)) {
			// Mutare dintr-un slot rapid în altul
			item = equipment.getEquipment(player, cell);
			if (!item) throw new SilentError("item doesn't exist");

			// Golește slotul vechi temporar
			equipment.setToSlot(player, cell, undefined);
		} else if (typeof cell === 'number') {
			item = this.storage.getItemOfCell(player.inventory, cell);
			if (!item) throw new SilentError("item doesn't exists");
		} else {
			throw new SilentError("invalid cell");
		}

		// Verificăm să nu mai fie același tip de obiect pe alt fast slot
		for (const [qSlot, eqItem] of Object.entries(player.equipment)) {
			if (equipment.isQuickSlot(qSlot) && eqItem?.name === item.name && qSlot !== slot) {
				// Pune la loc pe vechiul slot dacă era mutare din alt slot rapid
				if (typeof cell === 'string' && equipment.isQuickSlot(cell)) {
					equipment.setToSlot(player, cell, item);
				}
				throw mp.events.reject("Acest obiect este deja pe alt slot rapid!");
			}
		}

		// Mutare din inventar direct. Setăm cell pe null și golim slotul respectiv
		if (typeof cell === 'number') {
			item.cell = -1; // Scoatem din grid
		}

		const data = inventoryHelper.getItemData(item.name);
		if (data?.type === 'ammo') {
			hud.showNotification(player, 'error', 'Foloseste INCARCA din inventar pentru munitie!', true);
			throw new SilentError("Nu poți pune munitia pe un slot rapid.");
		}

		equipment.setToSlot(player, slot, item);
		await this.storage.updateInDb(player.dbId, player.inventory);

		return {
			equipment: JSON.parse(JSON.stringify(player.equipment)),
			inventory: JSON.parse(JSON.stringify(player.inventory))
		};
	}

	private async dropItem(player: Player, cell: number | string) {
		if (cell === 'ammo') throw new SilentError("Nu poți arunca munitia direct de pe slotul armei.");

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
		if (item.name === 'ron') money.syncCashWithHUD(player);

		mp.pickups.create(player.mp.position, player.mp.dimension, item);

		// === RETURN pentru update instant pe client ===
		return {
			equipment: JSON.parse(JSON.stringify(player.equipment)),
			inventory: JSON.parse(JSON.stringify(player.inventory)),
			weight: this.storage.getCurrentWeight(player.inventory)
		};
	}

	private async unequipItem(player: Player, slot: string, cell?: number) {
		if (slot === 'ammo') throw new SilentError("Munitia se va dez-echipa cand scoti arma.");

		const item = equipment.getEquipment(player, slot);
		if (!item) throw new SilentError("this slot doesn't equip");

		// Verificăm dacă item-ul venea dintr-un quick slot
		let wasQuickSlot = null;
		if (slot === 'hands' && player.equipment) {
			for (const [qSlot, eqItem] of Object.entries(player.equipment)) {
				if (equipment.isQuickSlot(qSlot) && eqItem?.name === item.name) {
					wasQuickSlot = qSlot;
					break;
				}
			}
		} else if (equipment.isQuickSlot(slot)) {
			wasQuickSlot = slot;
		}

		if (wasQuickSlot) {
			if ((cell === undefined || cell === null) && slot === 'hands') {
				// Când apasă '0', vrea doar să o scoată din mână. Rămâne în quick slot!
				await equipment.unequip(player, item);
				item.data = { ...item.data, slot: wasQuickSlot };
				await this.storage.updateInDb(player.dbId, player.inventory);

				return {
					equipment: JSON.parse(JSON.stringify(player.equipment)),
					inventory: JSON.parse(JSON.stringify(player.inventory)),
					weight: this.storage.getCurrentWeight(player.inventory)
				};
			}
		}

		const targetCell =
			isNumber(cell) && !this.storage.getItemOfCell(player.inventory, cell)
				? cell
				: this.storage.getFreeCell(player, player.inventory);

		if (!targetCell) throw new SilentError('not enough slots');
		if (slot === 'backpack' && cell > 5) throw new SilentError('is backpack cell');

		// ACUM executăm unequip complet, care va tăia `item.data.slot` și din `equipment` obj
		await equipment.unequip(player, item);
		item.cell = targetCell;

		// Curățăm manual tot ce înseamnă fastSlot, garantat!
		if (!item.data) item.data = {};
		item.data = { ...item.data };
		delete item.data.quickSlot;
		delete item.data.slot;

		// Dacă era vreun reziduu vizual (quick slot direct mutat), îl ucidem.
		if (wasQuickSlot) {
			delete player.equipment[wasQuickSlot];
		}

		await this.storage.updateInDb(player.dbId, player.inventory);

		// Aici returnezi totul pentru update vizual instant pe client!
		return {
			equipment: JSON.parse(JSON.stringify(player.equipment)),
			inventory: JSON.parse(JSON.stringify(player.inventory)),
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
		if (itemName === 'ron') money.syncCashWithHUD(player);
	}

}

export default new PlayerInventory(playerStorage);
