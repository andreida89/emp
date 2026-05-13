import { Schema, model, Document } from 'mongoose';

export interface IGarageDeleteLog extends Document {
    issuerId: number;
    issuerEmail: string;
    garageId: number;
    createdAt: Date;
}

const GarageDeleteLogSchema = new Schema({
    issuerId: { type: Number, required: true },
    issuerEmail: { type: String, default: 'N/A' },
    garageId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default model<IGarageDeleteLog>('GarageDeleteLog', GarageDeleteLogSchema, 'garagedeletelogs');
