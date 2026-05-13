import mongoose, { Schema, Document } from 'mongoose';

export interface IWhitelist extends Document {
  name: string;
  serial: string;
  createdAt: Date;
}

const WhitelistSchema: Schema = new Schema({
  name: { type: String, required: true },
  serial: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IWhitelist>('Whitelist', WhitelistSchema);
