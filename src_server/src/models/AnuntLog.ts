import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    issuerId: { type: mongoose.Schema.Types.Mixed, required: true },
    issuerName: { type: String, required: true },
    details: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AnuntLog', schema);
