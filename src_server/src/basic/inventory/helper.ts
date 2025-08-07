import { remove } from 'lodash';
import items from 'data/inventory.json';

type ItemData = {
	type: string;
	name: string;
	weight: number;
	stack: number;
	model: string;
	equipment?: string;
} & { [key: string]: any };

class InventoryHelper {
	getItemData(name: string) {
		return items[name] as ItemData;
	}

	getWeightOfItem(item: InventoryItem) {
		return item.amount * (this.getItemData(item.name)?.weight ?? 0);
	}

	findItem(storage: InventoryItem[], name: string) {
		return storage.find((item) => item.name === name);
	}

	removeItem(storage: InventoryItem[], item: InventoryItem) {
		remove(storage, (data) => data.cell === item.cell && data.name === item.name);
	}

	changeItemAmount(storage: InventoryItem[], item: InventoryItem, amount: number) {
		if (item.amount + amount < 0) throw new SilentError('not enough');

		item.amount += amount;
		if (item.amount <= 0) this.removeItem(storage, item);
	}
findAttachmentKeyByModelAndWeapon(model: string, weaponName: string) {
    for (const [key, value] of Object.entries(items)) {
        if (
            (value as any).type === "atasament" &&
            (value as any).model === model &&
            Array.isArray((value as any).compatibleWeapons) &&
            (value as any).compatibleWeapons.includes(weaponName)
        ) {
            return key;
        }
    }
    return null;
}
// Dacă ai mai multe modele de cască, pune-le într-un array:
hasAnyHelmetEquipped(storage: InventoryItem[]): boolean {
    const helmetStyles = [39, 40, 123]; // adaugă toate style-urile pentru căști
    const hat = storage.find(
        (item) => item.name === 'hats' && item.cell === 43 && helmetStyles.includes(item.data?.style)
    );
    return !!hat;
}


}

export default new InventoryHelper();
