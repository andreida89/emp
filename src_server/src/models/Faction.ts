import mongoose from 'mongoose';

const { Schema } = mongoose;

type Faction = {
	name: string;
	money: number;
	materials: number;
	members: any[];
	ranks: any[];
	type: string;
	numid: number;
	visualname: string;
	inventory: InventoryItem[];
} & mongoose.Document;

const memberSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Character'
		},
		rank: {
			type: Schema.Types.ObjectId,
			required: true
		},
		vaultAccess: {
			type: Boolean,
			default: false
		}
	},
	{ _id: false }
);

const rankSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	salary: {
		type: Number,
		default: 0
	},
	permissions: {
		type: Object,
		default: {}
	}
});

const factionSchema = new Schema<Faction>({
	name: {
		type: String,
		required: true,
		unique: true
	},
	type: {
		type: String,
		default: 'gang'
	},
	numid: {
		type: Number,
		default: 0
	},
	visualname: {
		type: String,
		default: ''
	},
	money: {
		type: Number,
		default: 0
	},
	materials: {
		type: Number,
		default: 0
	},
	inventory: {
		type: Array,
		default: []
	},
	vaultCoords: {
		x: Number,
		y: Number,
		z: Number
	},
	garageCoords: {
		x: Number,
		y: Number,
		z: Number
	},
	ranks: [rankSchema],
	members: [memberSchema]
});

const Faction = mongoose.model<Faction>('Faction', factionSchema);

export default Faction;
