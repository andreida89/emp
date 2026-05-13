import hud from 'helpers/hud';
import animations from 'helpers/animations';
import inventory from 'basic/inventory/helper';
import actions from 'player/actions';
import state from './state';
import VehicleModel from 'models/Vehicle';

type Fuel = {
	current: number;
	max: number;
};

class VehicleFuel {
	constructor() {
		this.runDecreaseInterval();
	}

useJerrycan(player: Player, vehicle: VehicleMp) {
	if (!vehicle || player.mp.vehicle) {
		return hud.showNotification(player, 'error', 'Stai langa vehicul.');
	}

	actions.checkActionTimeout(player);

	const jerrycan = inventory.findItem(player.inventory, 'canistraplina');
	if (!jerrycan) {
		return hud.showNotification(player, 'error', 'Nu ai canistra cu combustibil.');
	}
	inventory.changeItemAmount(player.inventory, jerrycan, -1);

	const fuel: Fuel = vehicle.getVariable('fuel');
	if (!fuel) {
		return hud.showNotification(player, 'error', 'Vehiculul nu are rezervor valid.');
	}

	const amount = 20;
	const total = Math.round(fuel.current + amount);
	const newValue = total < fuel.max ? total : fuel.max;

	vehicle.setVariable('fuel', {
		...fuel,
		current: newValue
	});

	if (vehicle.dbId) {
		console.log(`[FUEL][JERRYCAN][DB] Salvez în DB vehicul ${vehicle.name} [dbId=${vehicle.dbId}] fuel=${newValue}`);
		VehicleModel.updateOne({ _id: vehicle.dbId }, { fuel: newValue }).exec();
	}

	// Animație alimentare
	const duration = 5000;
	animations.setScenario(player, 'fuel', true);
	actions.setActionTimeout(player, duration);

	setTimeout(() => {
		hud.showNotification(player, 'success', 'Ai folosit canistra și ai alimentat vehiculul!', true);
	}, duration);
}


async fillUp(player: Player, amount: number, vehicleInput?: VehicleMp) {
	if (!player || amount <= 0) return;

	const vehicle = vehicleInput || player.mp.vehicle;
	if (!vehicle) return;

	const fuel: Fuel = vehicle.getVariable('fuel');
	if (!fuel) return;

	// Închide meniul
	player.callEvent('Gas-CloseMenu');

	// Coboară din mașină
	if (player.mp.vehicle && player.mp.vehicle === vehicle) player.mp.removeFromVehicle();

	// === Actualizează imediat combustibilul ===
	const total = Math.round(fuel.current + amount);
	const newValue = total < fuel.max ? total : fuel.max;

	vehicle.setVariable('fuel', {
		...fuel,
		current: newValue
	});

	if (vehicle.dbId) {
		console.log(`[FUEL][FILLUP][DB] Salvez în DB vehicul ${vehicle.name} [dbId=${vehicle.dbId}] fuel=${newValue}`);
		await VehicleModel.updateOne({ _id: vehicle.dbId }, { fuel: newValue }).exec();
	}

	// === Pornește animația după salvare ===
	const duration = 7000;
	animations.setScenario(player, 'fuel', true);
	actions.setActionTimeout(player, duration);

	setTimeout(() => {
		// ✅ Notificare după animație
		hud.showNotification(player, 'success', 'Ai alimentat cu succes!', true);
	}, duration);
}




private decrease(vehicle: VehicleMp) {
    if (!vehicle?.engine) {
        console.log(`[FUEL][SKIP] Vehicul ${vehicle?.name} [id=${vehicle?.id}] nu are engine activ.`);
        return;
    }

    const fuel: Fuel = vehicle.getVariable('fuel');
    if (!fuel) {
        console.log(`[FUEL][SKIP] Vehicul ${vehicle.name} [id=${vehicle.id}] nu are variabilă 'fuel'.`);
        return;
    }

    if (fuel.current > 0) {
        const reduced = fuel.current - 1;

        console.log(`[FUEL][SCAD] Vehicul ${vehicle.name} [id=${vehicle.id}] fuel ${fuel.current} -> ${reduced <= 0 ? 0 : reduced} / ${fuel.max}`);

        vehicle.setVariable('fuel', { ...fuel, current: reduced <= 0 ? 0 : reduced });

        // Salvează în DB dacă vehiculul e persistent
        if (vehicle.dbId) {
            console.log(`[FUEL][DB] Update DB pentru vehicul [dbId=${vehicle.dbId}] fuel=${reduced <= 0 ? 0 : reduced}`);
            VehicleModel.updateOne({ _id: vehicle.dbId }, { fuel: reduced <= 0 ? 0 : reduced }).exec();
        }

        // La fuel 0, oprește motorul logic și fizic!
        if (reduced <= 0) {
            console.log(`[FUEL][STOP] Vehicul ${vehicle.name} [id=${vehicle.id}] rămâne fără combustibil, opresc engine!`);
            state.setEngineStatus(vehicle, false);
            vehicle.engine = false;

            // Trimit event la client pentru a opri motorul efectiv
            if (vehicle.getOccupant && vehicle.getOccupant(0)) {
                console.log(`[FUEL][CLIENT] Trimit 'ForceEngineOff' pentru vehicul [id=${vehicle.id}]`);
                vehicle.getOccupant(0).call('ForceEngineOff', [vehicle.id]);
            }
        }
    } else {
        console.log(`[FUEL][ZERO] Vehicul ${vehicle.name} [id=${vehicle.id}] are deja fuel 0.`);
    }
}


	private runDecreaseInterval() {
		setInterval(() => mp.vehicles.forEach(this.decrease), 60 * 1000);
	}
}

export default new VehicleFuel();
