import mongoose from 'mongoose';
import autoIncrementId from './Counter';

const { Schema } = mongoose;

type Character = {
	uid: number;
	firstName: string;
	lastName: string;
	age: number;
	position?: PositionEx;
	money: PlayerMoney;
	playedTime: number;
	paydayTime: number;
	bonusTime: number;
	health: number;
	armorValue: number;
	hunger: number;
	thirst: number;
	inventory: InventoryItem[];
	vehicleSlots: number;
	experience: number;
	appearance?: { [name: string]: any };
	licenses: { [name: string]: string };
	tasks: { [name: string]: number };
	skills: { [name: string]: number };
	hudSettings?: {
		visibility: {
			showLogo: boolean;
			showIdUsers: boolean;
			showMoneyCash: boolean;
			showMissions: boolean;
			showSpeedometer: boolean;
			showHealthArmor: boolean;
			showFoodWater: boolean;
			showStamina: boolean;
			showMic: boolean;
			showLocation: boolean;
			showMinimap: boolean;
			showChat: boolean;
		};
		styles: {
			statusBarsVariant: number;
			speedometerVariant: number;
		};
	};
	dailyBonus: {
		day: number;
		pickedAt?: string;
	};
	bankAccount?: string;
	bankPin?: string;
	bankHistory: {
		name: string;
		amount: number;
		date: string;
	}[];
	phone: {
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
	};
	arrest?: { time: number; reason: string };
	deathExpiresAt?: number;
	createdAt: string;
} & mongoose.Document;

const characterSchema = new Schema({
	uid: {
		type: Number,
		unique: true
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	age: {
		type: Number,
		default: 25
	},
	health: {
		type: Number,
		default: 100
	},
	armorValue: { type: Number, default: 0 },
	hunger: {
		type: Number,
		default: 100
	},
	thirst: {
		type: Number,
		default: 100
	},
	bankAccount: String,
	bankPin: String,
	bankHistory: { type: Array, default: [] },
	appearance: Object,
	position: Object,
	money: {
		cash: {
			type: Number,
			default: 0
		},
		bank: {
			type: Number,
			default: 0
		}
	},
	dailyBonus: {
		day: {
			type: Number,
			default: 0
		},
		pickedAt: Date
	},
	playedTime: {
		type: Number,
		default: 0
	},
	bonusTime: {
		type: Number,
		default: 0
	},
	paydayTime: {
		type: Number,
		default: 0
	},
	experience: {
		type: Number,
		default: 0
	},
	skills: {
		type: Object,
		default: {}
	},
	hudSettings: {
		type: Object,
		default: {
			visibility: {
				showLogo: true,
				showIdUsers: true,
				showMoneyCash: true,
				showMissions: true,
				showSpeedometer: true,
				showHealthArmor: true,
				showFoodWater: true,
				showStamina: true,
				showMic: true,
				showLocation: true,
				showMinimap: true,
				showChat: true
			},
			styles: {
				statusBarsVariant: 1,
				speedometerVariant: 1
			}
		}
	},
	tasks: {
		type: Object,
		default: {}
	},
	phone: {
		number: String,
		contacts: Array,
		blacklist: Array,
		messages: { type: Array, default: [] }
	},
	inventory: {
		type: Array,
		default: []
	},
	licenses: {
		type: Object,
		default: {}
	},
	vehicleSlots: {
		type: Number,
		default: 1
	},
	arrest: {
		time: Number,
		reason: String
	},
	deathExpiresAt: {
		type: Number
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

// eslint-disable-next-line func-names
characterSchema.pre('save', function (next) {
	if (!this.isNew) {
		next();
		return;
	}

	autoIncrementId(this, 'uid', next);
});

const Character = mongoose.model<Character>('Character', characterSchema);

export default Character;
