import money from './money';
import playerInventory from 'player/inventory';
import hud from './hud';

export async function pay(
	player: Player,
	type: PaymentType,
	amount: number,
	note?: string
): Promise<boolean> {
	if (type === 'cash') {
		try {
			await playerInventory.removeItemAmount(player, 'ron', amount);
			return true;
		} catch (e) {
			hud.showNotification(player, 'error', 'Nu ai suficienti bani cash (RON)', true);
			return false;
		}
	} else {
		await money.change(player, type, -amount, note);
		return true;
	}
}

