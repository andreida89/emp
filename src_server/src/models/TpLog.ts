import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    issuerId: { type: mongoose.Schema.Types.Mixed, required: true },
    issuerName: { type: String, required: true },
    type: { type: String, required: true }, // 'TPTO', 'TPTOME', 'TPW', 'TPC'
    details: { type: String }, // e.g. "To Player: X", "To Coords: X,Y,Z"
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('TpLog', schema);
