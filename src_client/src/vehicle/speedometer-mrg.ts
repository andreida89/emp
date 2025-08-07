import controls from './controls';
import cruise from './cruise-control';
import vehicleCtrl from './index';

const player = mp.players.local;

type State = {
	velocity: number;
	maxspeed: number;
	rpm: number;
};

type StateIcons = {
	engine: {
		health: number;
		active: boolean;
	};
	fuel: {
		current: number;
		max: number;
	};
	locked: boolean;
	seatbelt: boolean;
	lung: number;
	scurt: number;
	dooro: number;
	brake: number;
	rightl: boolean;
	leftl: boolean;
	cruise: boolean;
};

class Speedometer {
	private updateInterval: NodeJS.Timeout;
	private updateInterv: NodeJS.Timeout;
	private leftl: boolean = false;
	private rightl: boolean = false;

	

	show() {
		mp.keys.bind(0x25, true, (player) => {
			this.toggleIndicator("right");
		});

		mp.keys.bind(0x27, true, (player) => {
			this.toggleIndicator("left");
		});
		if (this.updateInterval) clearInterval(this.updateInterval);
		if (this.updateInterv) clearInterval(this.updateInterv);

		this.updateInterval = setInterval(this.update.bind(this), 1000);
		this.updateInterv = setInterval(this.updateIcons.bind(this), 1000);
	}

	private getFullState(vehicle: VehicleMp): State {
		return {
			velocity: Math.round(vehicle.getSpeed() * 3.6),
			//velocity: Math.ceil(vehicle.getSpeed() * (vehicle.getSpeed() / 20) * 2),
			maxspeed: mp.game.vehicle.getVehicleModelMaxSpeed(player.vehicle.model),
			//rpm: Math.round(vehicle.rpm * 100)/100,
			rpm: vehicle.rpm,
		};
	}

	private getFullIcons(vehicle: VehicleMp): StateIcons {
		const health = (vehicle.getEngineHealth() * 100) / vehicle.getVariable('maxHealth');
		const lightState = vehicle.getLightsState(1, 1);
		let scurt = 1;
		let lung = 1;
		
		if (lightState.lightsOn && lightState.highbeamsOn) {
			lung = 2;
		}
		if (lightState.lightsOn && !lightState.highbeamsOn) {
			scurt = 2;
		}
		let dooro = 0;
		if (vehicle.isDoorFullyOpen(1) || vehicle.isDoorFullyOpen(2) || vehicle.isDoorFullyOpen(3) || vehicle.isDoorFullyOpen(4)) {
			dooro = 2;
		}
		let seatbelt = 2;
		if (controls.seatbelt) {
			seatbelt = 1;
		}

		let brake = 0;
		if (vehicle.brake) {
			brake = 2;
		}

		//const toggleIndicator = (value) => !value;



		return {
			engine: {
				active: !!vehicle.getIsEngineRunning(),
				health: health >= 0 ? health : 0
			},
			fuel: vehicle.getVariable('fuel'),
			locked: vehicle.getDoorLockStatus() > 1,
			seatbelt: seatbelt,
			lung: lung,
			scurt: scurt,
			dooro: dooro,
			brake: brake,
			rightl: this.leftl,
			leftl: this.rightl,
			cruise: cruise.isActivated
		};
	}

	private toggleIndicator(value: string) {
		if (value == "left") {
			this.leftl = !this.leftl;
		} else {
			this.rightl = !this.rightl;
		}
	}

	private update() {
		const { vehicle } = player;

		if (!mp.browsers.hud) return;

		if (!vehicleCtrl.isDriver(vehicle) || vehicle?.getClass() === 13) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;

			mp.events.callBrowser('Speedometer-UpdateState', { inVehicle: false }, false);
		} else {
			mp.events.callBrowser(
				'Speedometer-UpdateState',
				{
					...this.getFullState(vehicle),
					inVehicle: true
				},
				false
			);
		}
	}

	private updateIcons() {
		const { vehicle } = player;

		if (!mp.browsers.hud) return;
		if (!vehicleCtrl.isDriver(vehicle) || vehicle?.getClass() === 13) {
			clearInterval(this.updateInterv);
			this.updateInterv = null;

			mp.events.callBrowser('Speedometer-UpdateIcons', { inVehicle: false }, false);
		} else {
			mp.events.callBrowser(
				'Speedometer-UpdateIcons',
				{
					...this.getFullIcons(vehicle),
					inVehicle: true
				},
				false
			);
		}
	}
}

export default new Speedometer();
