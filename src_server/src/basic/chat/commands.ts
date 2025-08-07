import { random } from 'lodash';
import factions from 'factions';
import factionsApi from 'factions/api';

export enum COMMANDS {
	SAY = 0,
	NRP = 1,
	DO = 2,
	TRY = 3,
	TODO = 4,
	SCREAM = 5,
	WHISPER = 6,
	FACTION = 7,
	FACTION_NRP = 8,
	ORG = 9,
	ORG_NRP = 10,
	NEWS = 11,
	DEPARTMENT = 12,
	MEGAFON = 13
}

export const colors = {
	white: 'FFFFFF',
	lilac: 'b077d9',
	green: '1ED65F',
	yellow: 'EEEE04',
	orange: 'FF7600',
	blue: '0880cf',
	red: 'e70000',
	black: '000000'
};

class ChatCommands {
	isFactionCommand(id: number) {
		return id >= COMMANDS.FACTION;
	}

	// 🟢 Returnează badge-ul în funcție de adminLvl
private getAdminBadge(player: any): string {
	const lvl = player?.mp?.getVariable?.('adminLvl') || 0;

	switch (lvl) {
		case 1:
			return `[badge:lightgreen]HELPER IN TESTE[/badge]`;
		case 2:
			return `[badge:green]HELPER[/badge]`;
		case 3:
			return `[badge:cyan]MODERATOR[/badge]`;
		case 4:
			return `[badge:cyan]MODERATOR AVANSAT[/badge]`;
		case 5:
			return `[badge:blue]ADMIN[/badge]`;
		case 6:
			return `[badge:purple]MANAGER[/badge]`;
		case 7:
			return `[badge:yellow]COFONDATOR[/badge]`;
		case 8:
			return `[badge:red]FONDATOR[/badge]`;
		default:
			return '';
	}
}


prepareString(str: string, players: Player[]) {
	let prepared = str;

	players.forEach((player) => {
		const id = player.mp.id;
		const name = player.getName();
		const fixId = player.fixId;
		const faction = factions.getFaction(player.faction);
		const factionName = faction?.name?.toUpperCase() || '';
		const rankName = factionsApi.getPlayerRank(player) || '';
		//console.log(`[DEBUG] Chat prepareString: fixId=${fixId}, id=${id}, name=${name}`);

		// Badge de facțiune (doar pentru EMS și LSPD)
		let factionBadge = '';
		if (factionName === 'LSPD') {
			factionBadge = `[badge:blue]POLITIE[/badge]`;
		} else if (factionName === 'EMS') {
			factionBadge = `[badge:red]SMURD[/badge]`;
		}

		const adminBadge = this.getAdminBadge(player);

		const finalBadge = `${adminBadge}${factionBadge}`;

		// Înlocuiește toate valorile
		prepared = prepared
			.replace('[id]', `${id}`)
			.replace('[fixId]', `${fixId}`)
			.replace('[name]', `${name}`)
			.replace('[[faction]]', factionName)
			.replace('[rank]', rankName)
			.replace('[badge]', finalBadge); // chiar dacă e "", îl înlocuiește
	});

	return prepared;
}



	getTemplate(text: string, command: number) {
	const currentHour = new Date().getHours(); // ora serverului (0-23)
    const isNight = (currentHour >= 19 || currentHour < 5); // între 19:00 și 04:59
		switch (command) {
        case COMMANDS.SAY:
            const nameColor = isNight ? colors.orange : colors.black;
            return `[badge][badge:black][fixId][/badge] !{${nameColor}}[name]!{${colors.white}}: ${text}`;

			case COMMANDS.DO:
				return `[badge:purple]Actiune[/badge]([name]) !{${colors.lilac}}${text}`;

			case COMMANDS.TRY:
				return `[badge:purple]Try[/badge]!{${colors.lilac}}[id] ${text} (${random(0, 1) ? 'Reusit' : 'Esuat'})`;

			case COMMANDS.NRP:
				return `[badge]!{${colors.white}}[id]: (( ${text} ))`;

			case COMMANDS.SCREAM:
				return `[badge]!{${colors.white}}[id] a strigat: ${text}`;

			case COMMANDS.WHISPER: {
				const [, ...msg] = text.split(' ');
				return `[badge]!{${colors.white}}[id] a soptit: ${msg.join(' ')}`;
			}

			case COMMANDS.TODO: {
				const [msg, action] = text.split('*');
				return `[badge:purple]ToDo[/badge]${msg}, !{${colors.lilac}} - a spus [name], ${action}`;
			}

			case COMMANDS.NEWS:
				return `[badge:green]ANUNT[/badge]!{${colors.green}}${text}`;

			case COMMANDS.DEPARTMENT:
				return `[badge:orange]Departament[/badge]!{${colors.orange}}[D][[faction]] [rank] [name]: ${text}`;

			case COMMANDS.MEGAFON:
				return `[badge:yellow]MEGAFON[/badge]!{${colors.yellow}}[Megafon] [rank] [name]: ${text}`;

			case COMMANDS.FACTION:
				return `!{${colors.blue}} [name]: ${text}`;

			case COMMANDS.FACTION_NRP:
				return `!{${colors.blue}} [name]: (( ${text} ))`;

			case COMMANDS.ORG:
				return `!{${colors.blue}}[Organizatie] [rank] [name]: ${text}`;

			case COMMANDS.ORG_NRP:
				return `!{${colors.blue}}[Organizatie] [rank] [name]: (( ${text} ))`;

			default:
				return `!{${colors.white}}[id]: ${text}`;
		}
	}
}

export default new ChatCommands();
