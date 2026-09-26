import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILinkDocument extends Document {
  hash: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const linkSchema = new Schema<ILinkDocument>(
  {
    hash: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Link = mongoose.model<ILinkDocument>('Link', linkSchema);
