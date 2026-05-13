import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    issuerId: { type: mongoose.Schema.Types.Mixed, required: true },
    issuerName: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.Mixed, required: true },
    targetName: { type: String, required: true },
    type: { type: String, required: true }, // 'CASH', 'BANK'
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('GiveCashLog', schema);
