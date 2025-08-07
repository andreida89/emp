import hud from 'helpers/hud';
import animations from 'helpers/animations';
import Branch from '../branch';
import Vehicle from '../vehicle';
import { clothes, vehiclePositions, ziareMarkers } from './data';

class Ziare extends Branch {
    private vehicle: Vehicle;

    constructor() {
        super('Ziare', 75, clothes);
        this.vehicle = new Vehicle(['bmx'], vehiclePositions.Ziare, [255, 255, 255, 0]);

        // Magazia de cargo (unde iei ziare)
        this.points.createForOrder(
            { x: -721.35, y: -425.54, z: 35.04 },
            1.2,
            this.getCargo.bind(this)
        );
    }

    startWork(player: Player) {
        super.startWork(player);

        const worker = this.workers.get(player);
        const vehicle = this.vehicle.spawn(player, worker);

        setTimeout(() => {
            if (mp.players.exists(player.mp) && mp.vehicles.exists(vehicle)) {
                player.mp.putIntoVehicle(vehicle, 0);
                player.jobvehicle = vehicle;
            }
        }, 100);

        this.showCargoPoint(player);
    }

    finishWork(player: Player) {
        this.points.hide(player);
        this.vehicle.destroy(this.workers.get(player));
        super.finishWork(player);
    if (player.mp) {
        player.mp.removeWeapon(0xF7F1E25E); // REMOVE WEAPON ZIAR!
        player.mp.call('ziareJob:stop');
    }
    }

    protected async onEnterPoint(player: Player) {
        if (player.mp.vehicle) return;
        const worker = this.workers.get(player);

        if (worker.cargo) {
            await this.completeOrder(player);
            worker.cargo -= 1;
            animations.setScenario(player, 'drop_package', true);
        }

        if (!worker.cargo) this.showCargoPoint(player);
        else this.createOrder(player);
    }

    private showCargoPoint(player: Player) {
        this.points.show(player);
        hud.showNotification(player, 'info', 'Mergi la tipografie pentru alte ziare');
    }

    private getCargo(player: Player) {
        if (player.mp.vehicle) return;
        const worker = this.workers.get(player);

        worker.cargo = ziareMarkers.length;
        this.points.hide(player);

        player.mp.call('ziare:giveWeapon');
        player.mp.call('ziareJob:startDelivery'); // trimiți eventul pentru client să pornească markerele
        // poți loga dacă vrei debug: console.log('[ZIARE] Trimis startDelivery la client');
    }
}

export default Ziare;
