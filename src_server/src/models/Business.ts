import mongoose from 'mongoose';

const { Schema } = mongoose;

type Business = {
	owner?: string;
	name: string;
	type: string;
	price: number;
	position: PositionEx;
	income: number;
	paid: number;
	profitPercent: number;
	customId: number;
	paymentTime?: Date;
	interactionPoints?: { name: string; position: PositionEx }[];
} & mongoose.Document;

const businessSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'Character'
	},
	customId: {
		type: Number
	},
	name: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true,
		default: 'Magazin 24/7'
	},
	price: {
		type: Number,
		required: true
	},
	profitPercent: {
		type: Number,
		default: 0
	},
	position: {
		type: Object,
		required: true
	},
	interactionPoints: {
		type: Array,
		default: []
	},
	income: {
		type: Number,
		required: true
	},
	paid: {
		type: Number,
		default: 1
	},
	paymentTime: {
		type: Date,
		default: null
	}
});

const Business = mongoose.model<Business>('Business', businessSchema);

export default Business;
