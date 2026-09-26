import type { AuthResponse, ContentItem, AskResponse, SharedBrainResponse, ContentType, ChatMessage } from '../types';

const API_BASE_URL = 'http://localhost:3000/api/user';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth APIs
  async signup(data: { username: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async signin(data: { username: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  // Content APIs
  async getContent(params?: { type?: string; tag?: string; search?: string }): Promise<{ success: boolean; contents: ContentItem[] }> {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'all') query.append('type', params.type);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/content?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json();
  },

  async addContent(data: { title: string; text?: string; link?: string; tags?: string[]; type?: ContentType }): Promise<{ success: boolean; content: ContentItem }> {
    const res = await fetch(`${API_BASE_URL}/content`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || result.details || 'Failed to add content');
    }
    return result;
  },

  async deleteContent(id: string): Promise<{ success: boolean; deletedId: string }> {
    const res = await fetch(`${API_BASE_URL}/content/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete content');
    return result;
  },

  // AI RAG & Chat APIs
  async getChat(): Promise<{ success: boolean; messages: ChatMessage[] }> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load chat history');
    return res.json();
  },

  async clearChat(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to clear chat history');
    return res.json();
  },

  async askAi(query: string): Promise<AskResponse> {
    const res = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to ask AI');
    return result;
  },

  // Share Link APIs
  async toggleShare(share: boolean): Promise<{ success: boolean; hash?: string }> {
    const res = await fetch(`${API_BASE_URL}/share`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ share }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update share settings');
    return result;
  },

  async getSharedBrain(hash: string): Promise<SharedBrainResponse> {
    const res = await fetch(`${API_BASE_URL}/share/${hash}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || result.msg || 'Shared brain not found');
    return result;
  },
};
