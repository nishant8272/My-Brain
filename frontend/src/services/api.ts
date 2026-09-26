import type { AuthResponse, ContentItem, AskResponse, SharedBrainResponse, ContentType, ChatMessage, ChatSessionItem } from '../types';

const API_BASE_URL = 'http://localhost:3000/api/user' ;

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

  async updateContent(id: string, data: Partial<ContentItem>): Promise<{ success: boolean; content: ContentItem }> {
    const res = await fetch(`${API_BASE_URL}/content/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update content');
    return result;
  },

  async toggleFavorite(id: string): Promise<{ success: boolean; content: ContentItem }> {
    const res = await fetch(`${API_BASE_URL}/content/${id}/favorite`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to toggle favorite');
    return result;
  },

  async batchDeleteContent(ids: string[]): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/content/batch-delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to batch delete content');
    return result;
  },

  async getContentStats(): Promise<{ success: boolean; counts: Record<string, number>; tags: string[] }> {
    const res = await fetch(`${API_BASE_URL}/content/stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch content stats');
    return res.json();
  },

  // AI RAG & Chat APIs
  async getChat(sessionId?: string): Promise<{ success: boolean; sessionId?: string; sessionTitle?: string; messages: ChatMessage[]; sessions?: ChatSessionItem[] }> {
    const url = sessionId ? `${API_BASE_URL}/chat?sessionId=${sessionId}` : `${API_BASE_URL}/chat`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load chat history');
    return res.json();
  },

  async getChatSessions(): Promise<{ success: boolean; sessions: ChatSessionItem[] }> {
    const res = await fetch(`${API_BASE_URL}/chat/sessions`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load chat sessions');
    return res.json();
  },

  async createChatSession(title?: string): Promise<{ success: boolean; session: ChatSessionItem }> {
    const res = await fetch(`${API_BASE_URL}/chat/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title: title || 'New Conversation' }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create chat session');
    return result;
  },

  async getChatSessionMessages(sessionId: string): Promise<{ success: boolean; session: ChatSessionItem; messages: ChatMessage[] }> {
    const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch session messages');
    return res.json();
  },

  async deleteChatSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete chat session');
    return result;
  },

  async clearChat(sessionId?: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) throw new Error('Failed to clear chat history');
    return res.json();
  },

  async askAi(query: string, sessionId?: string): Promise<AskResponse> {
    const res = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, sessionId }),
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
