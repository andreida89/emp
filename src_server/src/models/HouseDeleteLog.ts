import { Schema, model, Document } from 'mongoose';

export interface IHouseDeleteLog extends Document {
    issuerId: number;
    issuerEmail: string;
    houseId: number;
    createdAt: Date;
}

const HouseDeleteLogSchema = new Schema({
    issuerId: { type: Number, required: true },
    issuerEmail: { type: String, default: 'N/A' },
    houseId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default model<IHouseDeleteLog>('HouseDeleteLog', HouseDeleteLogSchema, 'housedeletelogs');
