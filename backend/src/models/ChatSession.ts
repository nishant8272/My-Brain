import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatSessionDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'AI Chat' },
  },
  { timestamps: true }
);

export const ChatSession = mongoose.model<IChatSessionDocument>('ChatSession', chatSessionSchema);
