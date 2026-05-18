import money from 'helpers/money';
import playerInventory from 'player/inventory'; // asigură-te că ai importul
import hud from 'helpers/hud';
import Service from '../service';

const fructelegumeprices = {
	salata: 30,
	morcovi: 40,
	cartofi: 50,
	mere: 45,
	prune: 55,
	afine: 65
};

class FructelegumeSale extends Service {
	constructor() {
		super('fructelegume_sale', { name: 'Piata', model: 356, color: 36 });
	}

	protected subscribeToEvents() {}

	onKeyPress(player: Player) {
		if (player.mp.vehicle) return;
		this.sellFructelegume(player);
	}

	private async sellFructelegume(player: Player) {
		let price = 0;
		player.inventory = player.inventory.filter((item) => {
			if (fructelegumeprices[item.name]) {
				price += Math.floor(fructelegumeprices[item.name] * item.amount);
				return false;
			}
			return true;
		});

		if (price <= 0) return;
		//await money.change(player, 'cash', price, 'fructelegume sale');
		await playerInventory.addItem(player, { name: 'ron', amount: price });
		//hud.showNotification(player, 'success', `Ati vandut produsele pentru ${price} RON`, true);
		player.mp.call("AnuntNotification2", [`Ai vandut produsele pentru ${price} RON`, 'verde']);
	}
}

const fructelegumeService = new FructelegumeSale();
