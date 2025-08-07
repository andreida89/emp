import logger from 'utils/logger';
import FactionModel from 'models/Faction';
import coords from 'data/factions/coords.json';
import Faction from './faction';
import gangZones from './gangs/zones';
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
			'Factions-StartWorkPolice': this.startWorkPolice.bind(this),
			'Factions-FinishWorkPolice': this.finishWorkPolice.bind(this),
			'Factions-StartWorkSmurd': this.startWorkSmurd.bind(this),
			'Factions-FinishWorkSmurd': this.finishWorkSmurd.bind(this),
			'Factions-StartWorkSindicat': this.startWorkSindicat.bind(this),
			'Factions-FinishWorkSindicat': this.finishWorkSindicat.bind(this)
		});
	}

	async load() {
		const cursor = await FactionModel.find().lean().cursor();

		cursor.on('data', (data: FactionModel) => {
			const faction = this.getFaction(data.name);
			if (faction) faction.load(data);
		});

		cursor.on('close', () => {
			gangZones.load();

			logger.success(`Factions loaded: ${Object.keys(this.items).length}`);
		});
	}

	getFaction(name: string) {
		return this.items[name];
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
  console.log(`[DEBUG] loadForPlayer: player.dbId = ${playerId}`);

  const playerFaction =
    faction ??
    Object.values(this.items).find((item) => {
      const keys = Array.from(item.members.getAll().keys());
      const found = keys.includes(playerId);
      console.log(`[DEBUG] Check faction=${item.name}, has playerId? ${found}`);
      return found;
    });

  if (!playerFaction) {
    console.log(`[DEBUG] ${player.mp.name} nu este membru în nicio facțiune`);
    return;
  }

  const inFaction = !faction || playerFaction.inFaction(player);

  player.faction = inFaction && playerFaction.name;
  player.mp.setVariable('faction', player.faction);
  player.mp.setOwnVariable('govMember', this.isGovMember(player));

  console.log(`[DEBUG] ${player.mp.name} este în facțiunea ${player.faction}`);

  playerFaction.setPointsVisible(player, inFaction);
}


	finishWork(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.finishWork(player);
		player.mp.setVariable('inService', false);
	}
	finishWorkPolice(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.finishWork(player);
		player.mp.setVariable('inServicePolice', false);
	}
	finishWorkSmurd(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.finishWork(player);
		player.mp.setVariable('inServiceSmurd', false);
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
	private startWorkPolice(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.startWork(player);
		player.mp.setVariable('inServicePolice', true);
	}
	private startWorkSmurd(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.startWork(player);
		player.mp.setVariable('inServiceSmurd', true);
	}
	private startWorkSindicat(player: Player) {
		const faction = this.getFaction(player.faction);
		if (faction) faction.startWork(player);
		player.mp.setVariable('inServiceSindicat', true);
	}
}

export { Faction };
export default new Factions();
