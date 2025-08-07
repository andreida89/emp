import army from 'factions/army';
import materials from '../materials/vehicle';
import MaterialsLoading from '../materials/loading';
import { Strategy } from './index';

class SupplyLoading extends MaterialsLoading {
	private supply: Strategy;

	constructor(position: PositionEx, supply: Strategy) {
		super(position);

		this.supply = supply;
	}

	protected async checkCanBeLoaded(player: Player) {
		let err: string;

		if (!player.isDriver()) err = 'Trebuie sa fiti la volanul vehiculului';
		else if (!army.inFaction(player)) err = 'Nu sunteti in serviciul armatei';
		else if (this.supply.materialsLeft <= 0) err = 'Nu mai sunt materiale';

		return err && mp.events.reject(err);
	}

	protected async loadIteration(player: Player) {
		await materials.loadToVehicle(player.mp.vehicle, 500);
		this.supply.changeMaterials(-500);
	}
}

export default SupplyLoading;
