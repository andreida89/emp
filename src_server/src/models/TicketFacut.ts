import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketFacut extends Document {
    creator: mongoose.Types.ObjectId;
    playerNumericId: number;
    title: string;
    type: string;
    message: string;
    status: string;
    claimedBy: {
        dbId: mongoose.Types.ObjectId;
        numericId: number;
        name: string;
        email: string;
    };
    createdAt: Date;
    claimedAt: Date;
}

const TicketFacutSchema: Schema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    playerNumericId: { type: Number, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'CLAIMED' },
    claimedBy: {
        dbId: { type: Schema.Types.ObjectId, ref: 'User' },
        numericId: { type: Number },
        name: { type: String },
        email: { type: String }
    },
    createdAt: { type: Date },
    claimedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITicketFacut>('TicketFacut', TicketFacutSchema, 'ticketefacute');
