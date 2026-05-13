import money from 'helpers/money';
import offers from 'helpers/offers';
import playerLicenses from 'player/licenses';
import umu from 'factions/umu';

const licenses = {
	physical: {
		name: 'Sanatate fizica',
		price: 6000
	},
	mental: {
		name: 'Sanatate mentala',
		price: 6000
	}
};

class UmuLicenses {
	constructor() {
		mp.events.subscribe({
			'UmuLicenses-OfferLicense': this.offerToBuy.bind(this)
		});
	}

	private offerToBuy(player: Player, type: keyof typeof licenses) {
		if (!umu.isAlreadyAtWork(player)) return;

		const license = licenses[type];
		const customer = mp.players.get(player.target as PlayerMp);

		if (!license || !customer) return;

		offers.create(player, customer, {
			onAccept: this.onConfirmOffer.bind(this, customer, type)
		});
		offers.showWithExpires(
			customer,
			player.mp.id,
			`Propune sa cumparati certificatul medical "${license.name}" pentru ${license.price} RON`
		);
	}

	private async onConfirmOffer(customer: Player, type: keyof typeof licenses) {
		const license = licenses[type];
		if (!license) throw new SilentError('wrong license type');

		const { price } = license;
		await money.change(customer, 'cash', -price, 'buy umu license');
		await umu.money.changeBalance(price);

		await playerLicenses.give(customer, `med_${type}`);
	}
}

const umuLicenses = new UmuLicenses();
