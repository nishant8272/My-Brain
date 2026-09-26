import mongoose, { Schema } from 'mongoose';
const chatMessageSchema = new Schema({
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    sources: { type: Schema.Types.Mixed, default: [] },
    relevantCards: { type: Schema.Types.Mixed, default: [] },
}, { timestamps: true, strict: false });
if (mongoose.models.ChatMessage) {
    delete mongoose.models.ChatMessage;
}
if (mongoose.connection && mongoose.connection.models && mongoose.connection.models.ChatMessage) {
    delete mongoose.connection.models.ChatMessage;
}
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
