export type ContentType = 'youtube' | 'twitter' | 'document' | 'link' | 'note' | 'all';

export interface ContentItem {
  _id: string;
  title: string;
  text: string;
  link: string;
  type: ContentType;
  tags: string[];
  userId: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  details?: string;
}

export interface AskSource {
  id: string;
  title: string;
  type?: string;
  score: number;
}

export interface ChatSessionItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id?: string;
  sessionId?: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: AskSource[];
  relevantCards?: ContentItem[];
  createdAt?: string;
}

export interface AskResponse {
  answer: string;
  sessionId?: string;
  sessionTitle?: string;
  sources: AskSource[];
  relevantCards?: ContentItem[];
  messages?: ChatMessage[];
  error?: string;
}

export interface SharedBrainResponse {
  username: string;
  contentCount: number;
  contents: ContentItem[];
  error?: string;
}
