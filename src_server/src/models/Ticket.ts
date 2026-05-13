import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
    creator: mongoose.Types.ObjectId;
    playerNumericId: number;
    title: string;
    type: string;
    message: string;
    status: string;
    claimedBy?: {
        dbId: mongoose.Types.ObjectId;
        numericId: number;
        name: string;
        email: string;
    };
    createdAt: Date;
}

const TicketSchema: Schema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'Character', required: true, unique: true },
    playerNumericId: { type: Number, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'OPEN' },
    claimedBy: {
        dbId: { type: Schema.Types.ObjectId, ref: 'User' },
        numericId: { type: Number },
        name: { type: String },
        email: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITicket>('Ticket', TicketSchema, 'tickete');
