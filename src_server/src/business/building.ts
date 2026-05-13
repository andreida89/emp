import entities, { Entity } from './entities';
import owning from './owning';
import businessCtrl from './index';

class BusinessBuilding {
	create(data: Entity) {
		const { position, interactionPoints } = data;

		const colshapes: ColshapeMp[] = [];

		colshapes.push(mp.colshapes.create(
			position,
			1.5,
			{
				onKeyPress: businessCtrl.showMenu
			},
			{ data: data.index }
		));

		const marker = mp.markers.new(29, new mp.Vector3(position.x, position.y, position.z - 0.3), 1, {
			color: [255, 255, 255, 150],
			visible: true,
			dimension: 0
		});

		const pointBlips: BlipMp[] = [];

		// Create blips for interaction points if they exist
		const isGasStation = data.type === 'Benzinarie' || data.type === 'gas';
		const isServiceAuto = data.type === 'Service auto' || data.type === 'Service' || data.type === 'lscustoms';

		let pointRadius = 0.8;
		if (isGasStation) pointRadius = 3.0;
		if (isServiceAuto) pointRadius = 5.0;

		if (interactionPoints && interactionPoints.length > 0) {
			interactionPoints.forEach((point) => {
				colshapes.push(mp.colshapes.create(
					point.position,
					pointRadius,
					{
						onKeyPress: (player: Player) => businessCtrl.showInteractionPointMenu(player, data, point)
					}
				));
			});
		}

		return {
			blip: this.createBlip(data),
			marker,
			pointBlips,
			colshapes
		};
	}

	createPointBlip(type: string, position: PositionEx) {
		const config = this.getBlipConfigByType(type);
		return mp.blips.create(position, {
			name: config.namePrefix,
			model: config.model,
			color: config.color !== undefined ? config.color : 0,
			scale: config.scale || 0.7
		});
	}

	toggleBlip(entity: Entity, player?: Player) {
		// Keep blip always visible for everyone as per request, just update its properties if needed
		// Re-creating blip to ensure it matches current state if needed
		if (entity.blip) {
			entity.blip.destroy();
		}
		entity.blip = this.createBlip(entity);

		if (owning.isOwner(player, entity.owner)) this.createBlipForPlayer(player, entity);
		// else if (player) mp.blips.delete(player, `Afacerea nr. ${entity.index}`);
	}

	createBlipForPlayer(player: Player, entity: Entity) {
		const config = this.getBlipConfig(entity);
		mp.blips.createForPlayer(
			player,
			entity.position,
			{
				model: config.model,
				name: 'Afacerea ta',
				color: 3,
				scale: (config.scale || 0.7) * 1.3
			},
			`Afacerea nr. ${entity.index}`
		);
	}

	addInteractionPoint(entity: Entity, point: { name: string; position: PositionEx }) {
		if (!entity.pointBlips) entity.pointBlips = [];
		if (!entity.colshapes) entity.colshapes = [];

		const isGasStation = entity.type === 'Benzinarie' || entity.type === 'gas';
		const isServiceAuto = entity.type === 'Service auto' || entity.type === 'Service' || entity.type === 'lscustoms';

		let pointRadius = 0.8;
		if (isGasStation) pointRadius = 3.0;
		if (isServiceAuto) pointRadius = 5.0;

		entity.colshapes.push(mp.colshapes.create(
			point.position,
			pointRadius,
			{
				onKeyPress: (player: Player) => businessCtrl.showInteractionPointMenu(player, entity, point)
			}
		));

	}

	private createBlip(entity: Entity) {
		const config = this.getBlipConfig(entity);
		return mp.blips.create(entity.position, {
			name: config.name,
			model: config.model,
			color: config.color !== undefined ? config.color : (entity.owner ? 0 : 2),
			scale: config.scale || 1
		});
	}

	private getBlipConfigByType(type: string) {
		const typeConfigs: { [key: string]: { model: number, color?: number, scale?: number, namePrefix: string, showName: boolean } } = {
			'Magazin 24/7': { model: 59, color: 47, scale: 0.7, namePrefix: 'Magazin 24/7', showName: false },
			'Magazin de Haine': { model: 73, color: 58, scale: 0.7, namePrefix: 'Magazin de haine', showName: false },
			'Benzinarie': { model: 361, color: 2, scale: 0.8, namePrefix: 'Benzinarie', showName: false },
			'Magazin de Unelte': { model: 566, color: 58, scale: 0.7, namePrefix: 'Magazin de unelte', showName: false },
			'Magazin de Electronice': { model: 521, color: 63, scale: 0.7, namePrefix: 'Magazin de electronice', showName: false },
			'Farmacie': { model: 51, color: 49, scale: 0.7, namePrefix: 'Farmacie', showName: false },
			'Fastfood': { model: 889, color: 74, scale: 0.7, namePrefix: 'Fastfood', showName: false },
			'Restaurant': { model: 739, color: 29, scale: 0.8, namePrefix: 'Restaurant', showName: true },
			'Club': { model: 121, color: 8, scale: 0.9, namePrefix: 'Club', showName: true },
			'Gunshop': { model: 110, color: 58, scale: 0.7, namePrefix: 'Gunshop', showName: false },
			'Bar': { model: 93, color: 32, scale: 0.8, namePrefix: 'Bar', showName: true },
			'Frizerie': { model: 71, color: 58, scale: 0.7, namePrefix: 'Frizerie', showName: false },
			'Spalatorie Auto': { model: 100, color: 77, scale: 0.7, namePrefix: 'Spalatorie auto', showName: false },
			'Tattoo Shop': { model: 75, color: 49, scale: 0.7, namePrefix: 'Tattoo shop', showName: false },
			'Service': { model: 446, color: 58, scale: 0.9, namePrefix: 'Service auto', showName: false },
			'Tuning': { model: 72, color: 58, scale: 0.9, namePrefix: 'Service tuning', showName: false }
		};

		return typeConfigs[type] || { model: 108, namePrefix: 'Afacere', showName: true, scale: 1 };
	}

	private getBlipConfig(entity: Entity) {
		const config = this.getBlipConfigByType(entity.type);
		
		if (config.showName) {
			return { model: config.model, color: config.color, name: `${config.namePrefix} [${entity.name}]` };
		} else {
			// To group blips under the same entry in the legend, they must have the same name.
			return { model: config.model, color: config.color, name: config.namePrefix };
		}
	}
}

export default new BusinessBuilding();
