import logger from 'utils/logger';
import FactionModel from 'models/Faction';
import coords from 'data/factions/coords.json';
import Faction from './faction';
//import gangZones from './gangs/zones';
import './api';
import './leader';
import './actions';

class Factions {
	public items: { [name: string]: Faction };

	constructor() {
		this.items = {};

		mp.events.subscribe({
			'Factions-StartWork': this.startWork.bind(this),
			'Factions-FinishWork': this.finishWork.bind(this),
			'Factions-StartWorkPolitie': this.startWorkPolitie.bind(this),
			'Factions-FinishWorkPolitie': this.finishWorkPolitie.bind(this),
			'Factions-StartWorkUMU': this.startWorkUMU.bind(this),
			'Factions-FinishWorkUMU': this.finishWorkUMU.bind(this),
			'Factions-StartWorkSindicat': this.startWorkSindicat.bind(this),
			'Factions-FinishWorkSindicat': this.finishWorkSindicat.bind(this)
		});
	}

	async load() {
		const cursor = await FactionModel.find().lean().cursor();

		const FactionBuilder = (await import('./builder')).default;

		cursor.on('data', (data: any) => {
			let faction = this.getFaction(data.name);
			if (!faction) {
				// If it's a dynamic faction (clan, mafia, gang) that wasn't registered statically
				if (['clan', 'mafia', 'gang'].includes(data.type)) {
					const builder = new FactionBuilder(data.name, data.type === 'gang');
					faction = builder.build();
				} else {
					return;
				}
			}
			faction.load(data);
		});

		cursor.on('close', () => {
			// gangZones.load();

			logger.success(`Factions loaded: ${Object.keys(this.items).length}`);
		});
	}

getFaction(name: string) {
	if (!name) return null;

	if (this.items[name]) return this.items[name];
	
	const lower = name.toLowerCase();

	return Object.values(this.items).find(
		f => f?.name && f.name.toLowerCase() === lower
	);
}

	addFaction(faction: Faction) {
		this.items[faction.name] = faction;
	}

	getCoords(faction: string) {
		return coords[faction];
	}

	isGovMember(player: Player) {
		const faction = this.getFaction(player.faction);

		return faction && faction.government;
	}

loadForPlayer(player: Player, faction?: Faction) {
  const playerId = player.dbId?.toString(); // siguranță
  //console.log(`[DEBUG] loadForPlayer: player.dbId = ${playerId}`);

  const playerFaction =
    faction ??
    Object.values(this.items).find((item) => {
      const keys = Array.from(item.members.getAll().keys());
      const found = keys.includes(playerId);
      //console.log(`[DEBUG] Check faction=${item.name}, has playerId? ${found}`);
      return found;
    });

  if (!playerFaction) {
    //console.log(`[DEBUG] ${player.mp.name} nu este membru în nicio facțiune`);
    return;
  }

  const inFaction = !faction || playerFaction.inFaction(player);

  player.faction = inFaction && playerFaction.name;
  player.mp.setVariable('faction', player.faction);
  player.mp.setOwnVariable('govMember', this.isGovMember(player));

  //console.log(`[DEBUG] ${player.mp.name} este în facțiunea ${player.faction}`);

  playerFaction.setPointsVisible(player, inFaction);
}


	finishWork(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.finishWork(player);
		player.mp.setVariable('inService', false);
	}
	finishWorkPolitie(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.finishWork(player);
		player.mp.setVariable('inServicePolitie', false);
	}
	finishWorkUMU(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.finishWork(player);
		player.mp.setVariable('inServiceUMU', false);
	}
	finishWorkSindicat(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.finishWork(player);
		player.mp.setVariable('inServiceSindicat', false);
	}
	private startWork(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.startWork(player);
		player.mp.setVariable('inService', true);
	}
	private startWorkPolitie(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.startWork(player);
		player.mp.setVariable('inServicePolitie', true);
	}
	private startWorkUMU(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.startWork(player);
		player.mp.setVariable('inServiceUMU', true);
	}
	private startWorkSindicat(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.startWork(player);
		player.mp.setVariable('inServiceSindicat', true);
	}
}

export { Faction };
export default new Factions();
