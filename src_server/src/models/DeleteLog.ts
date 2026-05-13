import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    issuerId: { type: mongoose.Schema.Types.Mixed, required: true },
    issuerName: { type: String, required: true },
    type: { type: String, required: true }, // 'DELETE', 'DELETE RADIUS', 'DELETE ALL'
    details: { type: String }, // e.g. "Range: 300, Count: 5" or "Vehicle ID: 123"
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('DeleteLog', schema);
