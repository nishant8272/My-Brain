import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  username: string;
  email?: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

if (mongoose.models.User) {
  delete (mongoose.models as any).User;
}

export const User = mongoose.model<IUserDocument>('User', userSchema);
