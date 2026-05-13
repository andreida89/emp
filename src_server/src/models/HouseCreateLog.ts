import { Schema, model, Document } from 'mongoose';

export interface IHouseCreateLog extends Document {
    issuerId: number;
    issuerEmail: string;
    houseId: number;
    houseType: string;
    price: number;
    ownerId: string;
    createdAt: Date;
}

const HouseCreateLogSchema = new Schema({
    issuerId: { type: Number, required: true },
    issuerEmail: { type: String, default: 'N/A' },
    houseId: { type: Number, required: true },
    houseType: { type: String, required: true },
    price: { type: Number, default: 0 },
    ownerId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

export default model<IHouseCreateLog>('HouseCreateLog', HouseCreateLogSchema, 'housecreatelogs');
