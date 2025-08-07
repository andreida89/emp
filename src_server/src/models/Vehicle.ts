import mongoose from 'mongoose';

const { Schema } = mongoose;

type Vehicle = {
	owner: string;
	oldOwners: string[];
	name: string;
	govNumber: string;
	fuel: number;
	mileage: number;
	maxspeed: number;
	state: {
		[key: string]: any;
	};
	tuning: {
		[key: string]: any;
	};
	inventory: InventoryItem[];
} & mongoose.Document;

const vehicleSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'Character'
	},
	oldOwners: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
	name: {
		type: String,
		required: true
	},
	govNumber: {
		type: String,
		unique: true,
		required: true
	},
	fuel: {
		type: Number,
		required: true
	},
	mileage: {
		type: Number,
		required: true,
		default: 0
	},
	maxspeed: {
		type: Number,
		required: true,
		default: 250
	},
	state: {
		type: Object,
		default: {}
	},
	tuning: {
		type: Object,
		default: {}
	},
	inventory: {
		type: Array,
		default: []
	}
});

const Vehicle = mongoose.model<Vehicle>('Vehicle', vehicleSchema);

export default Vehicle;
