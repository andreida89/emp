import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    issuerId: { type: Number, required: true },
    issuerEmail: { type: String, required: true },
    bannedId: { type: Number, required: true },
    bannedEmail: { type: String, required: true },
    bannedSerial: { type: String, required: true },
    reason: { type: String, required: true },
    term: { type: String, required: true },
    isPermanent: { type: Boolean, default: false },
    withPayment: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('BanLog', schema);
