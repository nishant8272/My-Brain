import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// User Schema
const userSchema = new Schema({
    username: { type: String, required: true, trim: true, unique: true }, 
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}); 

// Content Schema
const contentSchema = new Schema({
    title: { type: String, required: true, trim: true },
    text: { type: String, default: "" },
    link: { type: String, default: "", trim: true },
    type: { 
        type: String, 
        enum: ['youtube', 'twitter', 'document', 'link', 'note'], 
        default: 'document' 
    },
    tags: { type: [String], default: [] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const LinkSchema = new Schema({
    hash: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true }
});

// Chat Session Schema
const chatSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Chat' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Chat Message Schema
const chatMessageSchema = new Schema({
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    sources: { type: Array, default: [] },
    relevantCards: [{ type: Schema.Types.ObjectId, ref: 'Content' }],
    createdAt: { type: Date, default: Date.now }
});

// Create models
export const User = model("User", userSchema);
export const Content = model("Content", contentSchema);
export const Link = model("Links", LinkSchema);
export const ChatSession = model("ChatSession", chatSessionSchema);
export const ChatMessage = model("ChatMessage", chatMessageSchema);