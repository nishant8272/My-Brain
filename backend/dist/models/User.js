import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
}, { timestamps: true });
if (mongoose.models.User) {
    delete mongoose.models.User;
}
export const User = mongoose.model('User', userSchema);
