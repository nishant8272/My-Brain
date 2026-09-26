import mongoose, { Schema, Document, Types } from 'mongoose';
import { ContentType } from '../types/index.js';

export interface IContentDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  text: string;
  link?: string;
  type: ContentType;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled', trim: true },
    text: { type: String, default: '' },
    link: { type: String, default: '' },
    type: { 
      type: String, 
      enum: ['youtube', 'twitter', 'document', 'link', 'image', 'video', 'article', 'audio'], 
      required: true,
      default: 'document'
    },
    tags: [{ type: String, trim: true }],
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contentSchema.index({ userId: 1, type: 1 });
contentSchema.index({ userId: 1, tags: 1 });

export const Content = mongoose.model<IContentDocument>('Content', contentSchema);
