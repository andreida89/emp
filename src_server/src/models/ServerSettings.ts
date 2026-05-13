import mongoose, { Schema, Document } from 'mongoose';

export interface IServerSettings extends Document {
  key: string;
  value: any;
}

const ServerSettingsSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true }
});

export default mongoose.model<IServerSettings>('ServerSettings', ServerSettingsSchema);
