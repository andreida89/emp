import mongoose, { Document } from 'mongoose';

export type GarageType = 'civil' | 'politie' | 'umu' | 'boat' | 'boat_politie' | 'truck' | 'plane' | 'heli' | 'heli_politie' | 'heli_umu' | 'kart' | 'formula1';

export interface IGarage extends Document {
	index: number;
	name: string;
	type: GarageType;
	noBlip?: boolean;
	position: { x: number; y: number; z: number };
}

const garageSchema = new mongoose.Schema({
	index: { type: Number, required: true },
	name: { type: String, required: true },
	type: { type: String, required: true },
	noBlip: { type: Boolean, default: false },
	position: {
		x: { type: Number, required: true },
		y: { type: Number, required: true },
		z: { type: Number, required: true }
	}
});

export default mongoose.model<IGarage>('Garage', garageSchema);
