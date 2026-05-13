import { Schema, model, Document } from 'mongoose';

export interface IGarageCreateLog extends Document {
    issuerId: number;
    issuerEmail: string;
    garageId: number;
    garageType: string;
    createdAt: Date;
}

const GarageCreateLogSchema = new Schema({
    issuerId: { type: Number, required: true },
    issuerEmail: { type: String, default: 'N/A' },
    garageId: { type: Number, required: true },
    garageType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default model<IGarageCreateLog>('GarageCreateLog', GarageCreateLogSchema, 'garagecreatelogs');
