import mongoose, { Schema } from 'mongoose';
const chatSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'AI Chat' },
}, { timestamps: true });
export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
