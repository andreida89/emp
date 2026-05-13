import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    issuerId: { type: mongoose.Schema.Types.Mixed, required: true },
    issuerName: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.Mixed, required: true },
    targetName: { type: String, required: true },
    model: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('SkinLog', schema);
