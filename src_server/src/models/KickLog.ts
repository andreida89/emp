import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    issuerId: { type: mongoose.Schema.Types.Mixed, required: true },
    issuerEmail: { type: String, required: true },
    kickedId: { type: mongoose.Schema.Types.Mixed, required: true },
    kickedEmail: { type: String, required: true },
    kickedSerial: { type: String, required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('KickLog', schema);
