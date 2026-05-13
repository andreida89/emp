import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    issuerId: { type: Number, required: true },
    issuerEmail: { type: String, required: true },
    targetId: { type: Number, required: true },
    targetEmail: { type: String, required: true },
    targetSerial: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('UnfreezeLog', schema);
