import { last } from 'lodash';
import CharModel from 'models/Character';
import Inventory, { StorageData } from 'basic/inventory';
import backpack from './backpack';
import money from 'helpers/money';

class PlayerInventoryStorage extends Inventory {
	constructor() {
		super('player');

		mp.events.subscribe({
			'Inventory-ShowPlayerMenu': this.showMenu.bind(this),
			'Inventory-SelfMove': this.moveItem.bind(this),
			'Inventory-SelfSeparate': this.separateItem.bind(this),
			'Inventory-PlayerTransfer': this.transferItem.bind(this)
		});
	}


	getMaxCells(player: Player) {
		return 6 + backpack.getPlayerBackpack(player).cells;
	}
	
	getMaxWeight(player: Player) {
		return 5 + backpack.getPlayerBackpack(player).slots;
	}
	
	

	showMenu(player: Player, storage?: StorageData) {
		const data: any[] = [
			player.inventory,
			this.getCurrentWeight(player.inventory),
			this.getMaxWeight(player),
			this.getMaxCells(player)
		];

		if (storage) {
			const { type, slots, ...props } = storage;

			data.push({
				...props,
				name: type,
				weight: {
					current: this.getCurrentWeight(storage.items),
					max: slots
				}
			});
		} else {
			data.push(player.equipment);
		}

		player.callEvent('Inventory-ShowMenu', data);
	}

	setCapacity(player: Player, cells: number, maxWeight: number) {
		player.callEvent('Inventory-SetCapacity', [cells, maxWeight]);
	}

	async updateInDb(id: string, data: InventoryItem[]) {
		await CharModel.findByIdAndUpdate(id, { $set: { inventory: JSON.parse(JSON.stringify(data)) } });

		// Sync statie & smartwatch status with UI
		const player = mp.players.getByDbId(id);
		if (player) {
			this.syncHasStatie(player);
			this.syncHasSmartwatch(player);
		}
	}

	syncHasStatie(player: Player) {
		if (!player.inventory) return;
		const hasStatie = player.inventory.some((i: any) => i.name === 'statie' || i.name === 'statieradio');
		if (player.updateState) {
			player.updateState({ type: 'SET_HAS_STATIE', payload: hasStatie });
		}
	}

	syncHasSmartwatch(player: Player) {
		if (!player.inventory) return;
		const hasSmartwatch = player.inventory.some((i: any) => i.name === 'smartwatch');
		if (player.updateState) {
			player.updateState({ type: 'SET_HAS_SMARTWATCH', payload: hasSmartwatch });
		}
		player.mp.setVariable('hasSmartwatch', hasSmartwatch);
	}

	private async moveItem(player: Player, cell: number, targetCell: number) {
	    console.log('[DEBUG][moveItem] player:', player && player.dbId, '| cell:', cell, '| targetCell:', targetCell);

		await this.move(player, player.inventory, cell, targetCell);

		await this.updateInDb(player.dbId, player.inventory);

		return JSON.parse(JSON.stringify(player.inventory));
	}

	private async separateItem(player: Player, cell: number, amount: number) {
		await this.separate(player, player.inventory, cell, amount);
		await this.updateInDb(player.dbId, player.inventory);

		money.syncCashWithHUD(player);

		return JSON.parse(JSON.stringify(last(player.inventory)));
	}

	private async transferItem(
		player: Player,
		inside: boolean,
		cell: number,
		targetCell: number
	) {
		const target = mp.players.get(player.target as PlayerMp);

		await this.transfer(
			player,
			player.inventory,
			target.inventory,
			inside,
			cell,
			targetCell
		);
		await this.updateInDb(target.dbId, target.inventory);
		await this.updateInDb(player.dbId, player.inventory);

		money.syncCashWithHUD(player);
		money.syncCashWithHUD(target);

		return {
			item: this.getItemOfCell(inside ? target.inventory : player.inventory, targetCell),
			weight: [
				this.getCurrentWeight(target.inventory),
				this.getCurrentWeight(player.inventory)
			]
		};
	}
}

export default new PlayerInventoryStorage();
