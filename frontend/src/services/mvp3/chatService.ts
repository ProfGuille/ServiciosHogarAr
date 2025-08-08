// frontend/src/services/mvp3/chatService.ts
import { Message, Conversation } from '../../hooks/mvp3/useChat';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

class ChatService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/mvp3/messages') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Request failed';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Get all conversations for the current user
  async getConversations(token: string): Promise<ApiResponse<Conversation[]>> {
    return this.makeRequest<Conversation[]>('/conversations', {}, token);
  }

  // Get messages for a specific conversation
  async getMessages(
    conversationId: number,
    token: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<Message[]>> {
    return this.makeRequest<Message[]>(
      `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      {},
      token
    );
  }

  // Get conversation details
  async getConversation(
    conversationId: number,
    token: string
  ): Promise<ApiResponse<Conversation>> {
    return this.makeRequest<Conversation>(
      `/conversations/${conversationId}`,
      {},
      token
    );
  }

  // Create a new conversation
  async createConversation(
    data: {
      providerId: number;
      serviceRequestId?: number;
      initialMessage?: string;
    },
    token: string
  ): Promise<ApiResponse<Conversation>> {
    return this.makeRequest<Conversation>(
      '/conversations',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  // Send a message (REST endpoint - WebSocket is preferred for real-time)
  async sendMessage(
    conversationId: number,
    data: {
      content: string;
      messageType?: string;
      attachmentUrl?: string;
    },
    token: string
  ): Promise<ApiResponse<Message>> {
    return this.makeRequest<Message>(
      `/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  // Upload file attachment (if implemented)
  async uploadAttachment(
    file: File,
    token: string
  ): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest<{ url: string; filename: string }>(
      '/upload',
      {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  // Search conversations
  async searchConversations(
    query: string,
    token: string
  ): Promise<ApiResponse<Conversation[]>> {
    return this.makeRequest<Conversation[]>(
      `/conversations/search?q=${encodeURIComponent(query)}`,
      {},
      token
    );
  }

  // Mark conversation as read
  async markConversationAsRead(
    conversationId: number,
    token: string
  ): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(
      `/conversations/${conversationId}/read`,
      {
        method: 'POST',
      },
      token
    );
  }

  // Delete a message
  async deleteMessage(
    conversationId: number,
    messageId: number,
    token: string
  ): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(
      `/conversations/${conversationId}/messages/${messageId}`,
      {
        method: 'DELETE',
      },
      token
    );
  }

  // Edit a message
  async editMessage(
    conversationId: number,
    messageId: number,
    content: string,
    token: string
  ): Promise<ApiResponse<Message>> {
    return this.makeRequest<Message>(
      `/conversations/${conversationId}/messages/${messageId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ content }),
      },
      token
    );
  }
}

// Create and export singleton instance
export const chatService = new ChatService();
export default chatService;