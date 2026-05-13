import rpc from 'rage-rpc';
import Vehicle from '../models/Vehicle';
import vehiclesJson from '../data/vehicles.json';
import vehicleCreator from '../vehicle/creator';
import blips from 'helpers/blips';
import hud from 'helpers/hud';
import { SilentError } from 'utils/errors';
import entities from './entities';

class GarageController {
	constructor() {
		this.subscribeToEvents();
	}

	loadForPlayer(player: Player) {
		const markers = entities.items
			.filter(item => {
				if (!item) return false;
				
				// Visibility filters for factions
				const isPolitieMarker = item.type === 'politie' || item.type === 'heli_politie' || item.type === 'boat_politie';
				const isUMUMarker = item.type === 'umu' || item.type === 'heli_umu';
				
				if (isPolitieMarker && player.faction !== 'politie') return false;
				if (isUMUMarker && player.faction !== 'umu') return false;
				
				return true;
			})
			.map(item => ({
				id: item.index,
				position: item.position,
				type: item.type,
				noBlip: !!item.noBlip
			}));
		
		player.callEvent('garage:initMarkers', [JSON.stringify(markers)]);
	}

	showMenu = async (player: Player) => {
		const garage = entities.getItem(player);

		if (!garage) {
            return hud.showNotification(player, 'error', 'Nu ai putut fi localizat intr-un garaj!');
        }

		// Security check for faction garages
		const isPolitieMarker = garage.type === 'politie' || garage.type === 'heli_politie' || garage.type === 'boat_politie';
		const isUMUMarker = garage.type === 'umu' || garage.type === 'heli_umu';
		
		if (isPolitieMarker && player.faction !== 'politie') return hud.showNotification(player, 'error', 'Nu ai acces la acest garaj!');
		if (isUMUMarker && player.faction !== 'umu') return hud.showNotification(player, 'error', 'Nu ai acces la acest garaj!');

		try {
			if (!player.dbId) return;

			// Find ALL garages at this spot to get the combined name
			const nearbyGarages = entities.getGaragesAt(garage.position, 5.0).filter(g => g.type === garage.type);
			const typeLabel = garage.type === 'civil' ? 'civil' : garage.type.toUpperCase();
			const indices = nearbyGarages.map(e => e.index).sort((a, b) => a - b).join('/');
			const subTitle = `${typeLabel.toUpperCase()} ${indices}`;

			// Driver seat in RAGE MP is 0
			const inVehicle = !!(player.mp.vehicle && player.mp.seat === 0);
			
			// Find all spawned personal vehicles to check status and fuel
			const spawnedVehicles = mp.vehicles.toArray().filter(v => v.getVariable('owner') === player.dbId);
			const spawnedMap = new Map();
			spawnedVehicles.forEach(v => {
				const vehId = (v as any).dbId || v.getVariable('id');
				if (vehId) spawnedMap.set(vehId.toString(), v);
			});

			// Find nearby personal vehicle for parking check
			let nearbyVehicleId = null;
			if (!inVehicle) {
				const nearby = spawnedVehicles.find(v => v.dist(player.mp.position) < 15.0);
				if (nearby) nearbyVehicleId = (nearby as any).dbId || nearby.getVariable('id')?.toString();
			} else {
				nearbyVehicleId = (player.mp.vehicle as any).dbId || player.mp.vehicle.getVariable('id')?.toString();
			}

			// Define faction vehicles
			const factionVehicles: any[] = [];
			const factionVehData: { [key: string]: { model: string, label: string }[] } = {
				'politie': [
					{ model: 'police', label: 'Politie Interceptor' },
					{ model: 'police2', label: 'Politie Buffalo' },
					{ model: 'police3', label: 'Politie Cruiser' },
					{ model: 'police4', label: 'Politie Unmarked' },
					{ model: 'riot', label: 'Politie Riot' },
				],
				'heli_politie': [
					{ model: 'polmav', label: 'Maverick Politie' }
				],
				'boat_politie': [
					{ model: 'predator', label: 'Barca Politie' }
				],
				'umu': [
					{ model: 'ambulance', label: 'Ambulanta' }
				],
				'heli_umu': [
					{ model: 'polmav', label: 'Elicopter UMU' }
				]
			};

			if (factionVehData[garage.type]) {
				factionVehData[garage.type].forEach((v, index) => {
					factionVehicles.push({
						id: `faction_${v.model}_${index}`,
						name: v.label,
						category: 'FACTION',
						km: 0,
						fuel: 100,
						tax: '0',
						expiry: 'Permanent',
						stage: 'MAX',
						isVip: true,
						isOut: false,
						img: `/assets/images/vehicule/${v.model.toLowerCase()}.webp`,
						description: 'Vehicul de serviciu pus la dispozitie de Empire State.',
						isFaction: true,
						modelKey: v.model.toLowerCase(),
						model: v.model
					});
				});
			}

			// Fetch cars for this character
			const vehicles = await Vehicle.find({ owner: player.dbId });

			const mappedVehicles = vehicles
				.filter(v => {
					// Filtering personal vehicles by garage type
					const modelKey = v.name.toLowerCase();
					const vehInfo = (vehiclesJson as any)[modelKey];
					
					// Only show vehicles that exist in vehicles.json
					if (!vehInfo) return false;
					
					const modelType = vehInfo.type;

					if (garage.type === 'boat' || garage.type === 'boat_politie') return modelType === 'barca';
					if (garage.type === 'heli' || garage.type === 'heli_politie' || garage.type === 'heli_umu') return modelType === 'elicopter';
					if (garage.type === 'plane') return modelType === 'avion';

					// If civil garage, only show cars/bikes (clasaa, clasab, clasac, clasad)
					const isCarOrBike = ['clasaa', 'clasab', 'clasac', 'clasad'].includes(modelType);
					if (['civil', 'politie', 'umu', 'truck'].includes(garage.type)) {
						return isCarOrBike;
					}

					return true;
				})
				.map(v => {
					const modelKey = v.name.toLowerCase();
					const vehInfo = (vehiclesJson as any)[modelKey];
					const dbIdStr = v._id.toString();
					const liveVeh = spawnedMap.get(dbIdStr);
					const isOut = !!liveVeh;
					
					// Fuel logic: like gas station
					let fuelVal = v.fuel || 100;
					if (liveVeh) {
						const fuel = liveVeh.getVariable('fuel');
						const fuelLevel = fuel?.current || 0;
						const fuelMax = fuel?.max || 100;
						fuelVal = Math.floor((fuelLevel / (fuelMax || 100)) * 100);
					}

					return {
						id: dbIdStr,
						name: vehInfo.name,
						category: vehInfo.type.toUpperCase(),
						km: Math.round(v.mileage || 0),
						fuel: Math.round(fuelVal),
						fuelType: vehInfo.fuel,
						trunkWeight: vehInfo.trunk,
						gloveboxWeight: vehInfo.torpedou,
						tax: '150',
						expiry: 'Permanent',
						stage: 'Stock',
						isVip: false,
						isOut,
						modelKey,
						img: `/assets/images/vehicule/${modelKey}.webp`,
						description: `Combustibil: ${vehInfo.fuel} | Portbagaj: ${vehInfo.trunk}kg | Torpedou: ${vehInfo.torpedou}kg`
					};
				});

			// Uniform pattern: interface name + data object
			player.callEvent('Garage-ShowMenu', {
				vehicles: [...factionVehicles, ...mappedVehicles],
				title: 'GARAJ',
				type: garage.type,
				subTitle: subTitle,
				inVehicle,
				nearbyVehicleId
			});
		} catch (err) {
			console.error('Garage error:', err);
			hud.showNotification(player, 'error', 'Eroare la incarcarea garajului');
		}
	};

	private subscribeToEvents() {
		mp.events.subscribeToDefault({
			'Garage-ShowMenu': this.showMenu.bind(this)
		});

		mp.events.subscribe({
			'garage:requestMarkers': (player: Player) => {
				const markers = entities.items
					.filter(item => {
						if (!item) return false;
						
						// Visibility filters for factions
						const isPolitieMarker = item.type === 'politie' || item.type === 'heli_politie' || item.type === 'boat_politie';
						const isUMUMarker = item.type === 'umu' || item.type === 'heli_umu';
						
						if (isPolitieMarker && player.faction !== 'politie') return false;
						if (isUMUMarker && player.faction !== 'umu') return false;
						
						return true;
					})
					.map(item => ({
						id: item.index,
						position: item.position,
						type: item.type,
						noBlip: !!item.noBlip
					}));
				
				player.callEvent('garage:initMarkers', [JSON.stringify(markers)]);
			}
		});

		rpc.register('Garage-Withdraw', async (id: string, info: any) => {
            const playerMp = info.player as PlayerMp;
            const player = mp.players.get(playerMp);
            if (!player) return;

			try {
                const garage = entities.getItem(player);
                if (!garage) throw new SilentError('Nu esti intr-un garaj!');

                let vehicle;
                let vehicleName = '';

                if (id.startsWith('faction_')) {
                    // Handle faction vehicle
                    const vehicles = info.vehicles || []; // This might not be passed by RPC, so we need to find it differently or store it
                    // Actually, the client sends the ID. I can parse it or the client can send the model.
                    // Let's assume the ID format is faction_model_index
                    const parts = id.split('_');
                    const modelName = parts[1];
                    
                    const spawnPos = {
                        x: player.mp.position.x + 2,
                        y: player.mp.position.y,
                        z: player.mp.position.z
                    };

                    vehicle = mp.vehicles.new(mp.joaat(modelName), new mp.Vector3(spawnPos.x, spawnPos.y, spawnPos.z), {
                        heading: player.mp.heading,
                        numberPlate: player.faction?.toUpperCase().slice(0, 8) || 'EMPIRE',
                        dimension: player.mp.dimension
                    });

                    // Set standard variables
                    vehicle.setVariable('owner', player.dbId);
                    vehicle.setVariable('faction', player.faction);
                    vehicle.setVariable('fuel', { current: 100, max: 100 });
                    
                    vehicleName = modelName.toUpperCase();
                } else {
                    // Handle personal vehicle
                    const data = await Vehicle.findById(id);
                    if (!data) throw new SilentError('Vehiculul nu a fost gasit!');

                    // If already out, destroy it first so we can "withdraw" (respawn) it
                    const existing = mp.vehicles.toArray().find(v => v.getVariable('id') === id);
                    if (existing) {
                        existing.destroy();
                    }

                    // Spawn vehicle at player position
                    const spawnPos = {
                        x: player.mp.position.x + 2,
                        y: player.mp.position.y,
                        z: player.mp.position.z
                    };

                    vehicle = vehicleCreator.spawnForPlayer(player, spawnPos, data as any);
                    
                    // Set variables for client sync and parking detection
                    vehicle.setVariable('owner', player.dbId);
                    vehicle.setVariable('id', id);
                    
                    vehicleName = data.name;
                }

                hud.showNotification(player, 'success', `Ai scos ${vehicleName} din garaj!`);
                player.callEvent('Browser-HidePage');
            } catch (err: any) {
                if (err instanceof SilentError) return Promise.reject(err.message);
                console.error(err);
                return Promise.reject('Nu s-a putut scoate vehiculul');
            }
		});

        rpc.register('Garage-Locate', async (id: string, info: any) => {
            const playerMp = info.player as PlayerMp;
            const player = mp.players.get(playerMp);
            if (!player) return;

            const vehicle = mp.vehicles.getById(id);
            if (!vehicle) {
                return Promise.reject('Masina nu este scoasa din garaj!');
            }
            blips.setWaypoint(player.mp, vehicle.position);
            hud.showNotification(player, 'info', 'Locatia masinii a fost marcata pe GPS');
        });

        rpc.register('Garage-Insurance', async (id: string, info: any) => {
            const playerMp = info.player as PlayerMp;
            const player = mp.players.get(playerMp);
            if (!player) return;

            hud.showNotification(player, 'success', 'Asigurarea a fost platita!');
        });

		rpc.register('Garage-Park', async (id: string, info: any) => {
            const playerMp = info.player as PlayerMp;
            const player = mp.players.get(playerMp);
            if (!player) return;

            try {
				let vehicle;
				
				if (id && id.startsWith('faction_')) {
					// Park faction vehicle - find nearby faction vehicle owned by player
					vehicle = mp.vehicles.toArray().find(v => 
						v.getVariable('owner') === player.dbId && 
						v.getVariable('faction') && 
						v.dist(player.mp.position) < 15
					);
				} else {
					// Park personal vehicle
					vehicle = mp.vehicles.toArray().find(v => v.getVariable('id') === id);
				}

				if (!vehicle) {
					// Fallback: if player is in a vehicle and they own it
					if (player.mp.vehicle && player.mp.vehicle.getVariable('owner') === player.dbId) {
						vehicle = player.mp.vehicle;
					} else {
						throw new SilentError('Vehiculul nu este scos din garaj sau este prea departe!');
					}
				}

				if (vehicle.getVariable('owner') !== player.dbId) {
					throw new SilentError('Nu detii acest vehicul!');
				}

				// Check distance
				if (vehicle.dist(player.mp.position) > 15) {
					throw new SilentError('Vehiculul este prea departe!');
				}

				vehicle.destroy();
				hud.showNotification(player, 'success', 'Ai parcat vehiculul in garaj!');
				player.callEvent('Browser-HidePage');
			} catch (err: any) {
				if (err instanceof SilentError) return Promise.reject(err.message);
                console.error(err);
                return Promise.reject('Nu s-a putut parca vehiculul');
			}
        });
	}

}

const garageCtrl = new GarageController();
export default garageCtrl;
