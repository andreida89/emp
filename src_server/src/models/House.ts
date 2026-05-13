import mongoose from 'mongoose';

const { Schema } = mongoose;

type House = {
	owner?: string;
	type: string;
	position: PositionEx;
	locked: boolean;
	paid: number;
	inventory: InventoryItem[];
} & mongoose.Document;

const houseSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'Character'
	},
	type: {
		type: String,
		required: true
	},
	customId: {
		type: Number
	},
	name: {
		type: String
	},
	price: {
		type: Number
	},
	position: {
		type: Object,
		required: true
	},
	locked: {
		type: Boolean,
		default: false
	},
	paid: {
		type: Number,
		default: 1
	},
	inventory: []
});

const House = mongoose.model<House>('House', houseSchema);

export default House;
