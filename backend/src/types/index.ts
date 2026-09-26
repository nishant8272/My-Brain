import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export type ContentType = 'youtube' | 'twitter' | 'document' | 'link' | 'image' | 'video' | 'article' | 'audio' | 'all';

export interface IContent {
  _id?: string;
  userId: string;
  title: string;
  text: string;
  link?: string;
  type: ContentType;
  tags: string[];
  isFavorite?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatMessage {
  _id?: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: Array<{ id: string; title?: string; type?: string; score?: number }>;
  relevantCards?: any[];
  createdAt?: Date;
}
