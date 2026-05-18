interface PlayerMp {
	colshape?: number;
	colshapes: number[];
	attachments: number[];
	admin_duty?: boolean;
}

interface Player {
	readonly mp: PlayerMp;
	performing: boolean;
	cache: { [name: string]: any };
	dbId: string;
	fixId: number;
	adminLvl: number;
	admin_duty: boolean;
	dead: boolean;
	deathExpiresAt?: number;
	permisboral?: boolean;
	permisbpractic?: boolean;
	examVehicle?: VehicleMp;
	db?: any;

	account?: string;
	waypoint?: Vector3Mp;
	target?: PlayerMp | VehicleMp;
	actionTimeout?: number;

	readonly level: number;
	gender: 'male' | 'female';
	money?: PlayerMoney;
	hunger?: number;
	registerAt?: string;
	loginAt?: string;
	bankAccount?: string;
	experience: number;
	inventory?: InventoryItem[];
	equipment?: { [name: string]: InventoryItem };
	faction?: string;
	licenses?: { [name: string]: string };
	houses?: number[];
	businesses?: number[];
	vehicles: string[];
	vehicleSlots: number;
	paydayTime?: number;
	bonusTime?: number;
	skills?: { [name: string]: number };
	tasks?: {
		[name: string]: number;
	};
	arrest?: { time: number; reason: string };
	job?: { name: string; branch: string };
	phone?: {
		number?: string;
		contacts: {
			firstName: string;
			lastName: string;
			phone: string;
		}[];
		blacklist: string[];
		messages: {
			phone: string;
			text: string;
			type: 'incoming' | 'outgoing';
			date: number;
			read: boolean;
		}[];
		interlocutor?: PlayerMp;
	};

	callEvent: (name: string, args?: any, pending?: boolean) => Promise<any>;
	updateState: (data: { type: string; payload?: any }) => Promise<any>;
	getName: (separator?: boolean) => string;
	tp: (position: PositionEx, rotation?: number, dimension?: number) => void;
	entityIsNearby: (target: EntityMp, range?: number) => boolean;
	isDriver: () => boolean;
	hasLicense: (name: string) => boolean;
	isEnoughVehicleSlots: () => boolean;
	togglePrivateDimension: () => void;
}

type PlayerMoney = {
	cash: number;
	bank: number;
	points: number;
};
