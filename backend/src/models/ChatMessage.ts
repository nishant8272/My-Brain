import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatMessageDocument extends Document {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  sender: 'user' | 'ai';
  text: string;
  sources?: any[];
  relevantCards?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessageDocument>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    sources: { type: Schema.Types.Mixed, default: [] },
    relevantCards: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models.ChatMessage) {
  delete (mongoose.models as any).ChatMessage;
}
if (mongoose.connection && (mongoose.connection as any).models && (mongoose.connection as any).models.ChatMessage) {
  delete (mongoose.connection as any).models.ChatMessage;
}

export const ChatMessage = mongoose.model<IChatMessageDocument>('ChatMessage', chatMessageSchema);
