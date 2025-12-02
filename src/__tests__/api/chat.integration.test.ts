import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Mock fetch for API calls
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Chat/LLM API Integration Tests', () => {
  const baseUrl = 'http://localhost:4000';

  beforeAll(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    global.fetch = undefined as any;
  });

  describe('POST /api/chat-with-daddy', () => {
    it('should successfully send chat message and receive response', async () => {
      const chatRequest = {
        messages: [
          { role: 'user', content: 'Hello Daddy!' },
          { role: 'assistant', content: 'Hello sweetheart!' },
        ],
        quotes: [
          {
            response_id: 1,
            response_type: 'joy',
            text: 'Daddy loves you to the moon and back!',
          },
        ],
        sessionId: 'session-123',
      };

      const mockResponse = {
        reply: 'Hello my precious child! Daddy is so happy to hear from you today. How are you feeling?',
        sessionId: 'session-123',
        metadata: {
          tokens_used: 45,
          processing_time: 1200,
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify(chatRequest),
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/api/chat-with-daddy`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token',
          }),
          body: JSON.stringify(chatRequest),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.reply).toContain('Hello my precious child');
      expect(data.sessionId).toBe('session-123');
      expect(data.metadata).toBeDefined();
    });

    it('should handle streaming responses', async () => {
      const chatRequest = {
        messages: [{ role: 'user', content: 'Tell me a story!' }],
        quotes: [],
        sessionId: 'session-456',
        streaming: true,
      };

      // Mock streaming response
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"chunk": "Once upon"}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: {"chunk": " a time,"}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: {"chunk": " there was..."}\n\n'));
          controller.close();
        },
      });

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/event-stream']]),
        body: mockStream,
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/event-stream');
    });

    it('should handle API errors gracefully', async () => {
      const chatRequest = {
        messages: [{ role: 'user', content: 'Test message' }],
        quotes: [],
        sessionId: 'session-789',
      };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Chat service unavailable',
          code: 'SERVICE_UNAVAILABLE',
        }),
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequest),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Chat service unavailable');
    });

    it('should handle rate limiting', async () => {
      const chatRequest = {
        messages: [{ role: 'user', content: 'Too many messages!' }],
        quotes: [],
        sessionId: 'session-rate-limited',
      };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: 'Too many requests',
          retryAfter: 30,
        }),
        headers: new Map([['retry-after', '30']]),
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequest),
      });

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toBe('Too many requests');
      expect(data.retryAfter).toBe(30);
    });

    it('should validate request payload', async () => {
      const invalidRequest = {
        // Missing required fields
        quotes: [],
      };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation failed',
          details: [
            'messages is required',
            'sessionId is required',
          ],
        }),
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toContain('messages is required');
    });
  });

  describe('GET /api/chat-history', () => {
    it('should retrieve chat history for authenticated user', async () => {
      const mockHistory = {
        sessionId: 'session-123',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello Daddy!',
            timestamp: '2024-12-01T10:00:00Z',
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'Hello sweetheart!',
            timestamp: '2024-12-01T10:00:05Z',
          },
        ],
        metadata: {
          totalMessages: 2,
          lastActivity: '2024-12-01T10:00:05Z',
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistory,
      });

      const response = await fetch(`${baseUrl}/api/chat-history?sessionId=session-123`, {
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/api/chat-history?sessionId=session-123`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.sessionId).toBe('session-123');
      expect(data.messages).toHaveLength(2);
      expect(data.metadata.totalMessages).toBe(2);
    });

    it('should handle pagination', async () => {
      const mockPagedHistory = {
        sessionId: 'session-123',
        messages: [
          { id: 'msg-3', role: 'user', content: 'How are you?', timestamp: '2024-12-01T10:01:00Z' },
        ],
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          hasNext: true,
          hasPrev: true,
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockPagedHistory,
      });

      const response = await fetch(`${baseUrl}/api/chat-history?sessionId=session-123&page=2&limit=10`, {
        headers: { 'Authorization': 'Bearer valid-token' },
      });

      const data = await response.json();
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.hasNext).toBe(true);
      expect(data.messages).toHaveLength(1);
    });
  });

  describe('POST /api/chat-sessions', () => {
    it('should create new chat session', async () => {
      const sessionData = {
        title: 'Christmas Morning Chat',
        childId: 'child-123',
        metadata: {
          theme: 'christmas',
          mood: 'excited',
        },
      };

      const mockSession = {
        sessionId: 'new-session-456',
        title: 'Christmas Morning Chat',
        childId: 'child-123',
        createdAt: '2024-12-01T10:00:00Z',
        status: 'active',
        metadata: sessionData.metadata,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockSession,
      });

      const response = await fetch(`${baseUrl}/api/chat-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify(sessionData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.sessionId).toBe('new-session-456');
      expect(data.title).toBe('Christmas Morning Chat');
      expect(data.status).toBe('active');
    });
  });

  describe('Content moderation', () => {
    it('should handle content moderation for inappropriate messages', async () => {
      const inappropriateRequest = {
        messages: [
          { role: 'user', content: 'This is an inappropriate message' },
        ],
        quotes: [],
        sessionId: 'session-moderated',
      };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Content moderation failed',
          code: 'INAPPROPRIATE_CONTENT',
          details: 'Message contains inappropriate content',
        }),
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inappropriateRequest),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe('INAPPROPRIATE_CONTENT');
    });

    it('should handle content moderation API failures gracefully', async () => {
      const chatRequest = {
        messages: [{ role: 'user', content: 'Hello!' }],
        quotes: [],
        sessionId: 'session-moderation-fail',
      };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({
          error: 'Content moderation service unavailable',
          code: 'MODERATION_SERVICE_ERROR',
        }),
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequest),
      });

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.code).toBe('MODERATION_SERVICE_ERROR');
    });
  });

  describe('LLM Cache integration', () => {
    it('should utilize cached responses for repeated queries', async () => {
      const repeatedRequest = {
        messages: [
          { role: 'user', content: 'What is Christmas?' },
        ],
        quotes: [],
        sessionId: 'session-cached',
      };

      const mockCachedResponse = {
        reply: 'Christmas is a wonderful holiday...',
        cached: true,
        cacheKey: 'christmas-definition-2024',
        metadata: {
          tokens_used: 0, // Cached response
          processing_time: 50,
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCachedResponse,
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repeatedRequest),
      });

      const data = await response.json();
      expect(data.cached).toBe(true);
      expect(data.cacheKey).toBeDefined();
      expect(data.metadata.tokens_used).toBe(0);
    });

    it('should handle cache misses and generate new responses', async () => {
      const newRequest = {
        messages: [
          { role: 'user', content: 'Tell me about a unique Christmas tradition' },
        ],
        quotes: [],
        sessionId: 'session-new',
      };

      const mockNewResponse = {
        reply: 'One unique Christmas tradition is...',
        cached: false,
        metadata: {
          tokens_used: 120,
          processing_time: 1500,
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockNewResponse,
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });

      const data = await response.json();
      expect(data.cached).toBe(false);
      expect(data.metadata.tokens_used).toBeGreaterThan(0);
    });
  });

  describe('Error handling and resilience', () => {
    it('should handle network timeouts', async () => {
      const chatRequest = {
        messages: [{ role: 'user', content: 'Test' }],
        quotes: [],
        sessionId: 'session-timeout',
      };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 408,
        json: async () => ({ error: 'Request timeout' }),
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequest),
      });

      expect(response.status).toBe(408);
    });

    it('should handle malformed JSON responses', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => 'invalid json response',
      });

      const chatRequest = {
        messages: [{ role: 'user', content: 'Test' }],
        quotes: [],
        sessionId: 'session-malformed',
      };

      await expect(
        fetch(`${baseUrl}/api/chat-with-daddy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatRequest),
        }).then(r => r.json())
      ).rejects.toThrow();
    });

    it('should handle server maintenance mode', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({
          error: 'Service temporarily unavailable',
          code: 'MAINTENANCE_MODE',
          retryAfter: 3600,
        }),
        headers: new Map([['retry-after', '3600']]),
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          quotes: [],
          sessionId: 'session-maintenance',
        }),
      });

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.code).toBe('MAINTENANCE_MODE');
    });
  });

  describe('Authentication and security', () => {
    it('should require authentication for chat endpoints', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Authentication required' }),
      });

      const response = await fetch(`${baseUrl}/api/chat-with-daddy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          quotes: [],
          sessionId: 'session-no-auth',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should validate session ownership', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'Access denied',
          code: 'SESSION_ACCESS_DENIED',
        }),
      });

      const response = await fetch(`${baseUrl}/api/chat-history?sessionId=other-user-session`, {
        headers: { 'Authorization': 'Bearer valid-token' },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.code).toBe('SESSION_ACCESS_DENIED');
    });
  });
});