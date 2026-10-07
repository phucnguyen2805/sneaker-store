import api from "./api.js";

export const createChatConversation = async (type) => {
  const response = await api.post("/chat/conversations", {
    type,
  });

  return response.data;
};

export const getMyChatConversations = async () => {
  const response = await api.get("/chat/conversations");

  return Array.isArray(response.data) ? response.data : [];
};

export const getMyChatConversation = async (conversationId) => {
  const response = await api.get(`/chat/conversations/${conversationId}`);

  return response.data;
};

export const getChatMessages = async (conversationId) => {
  const response = await api.get(
    `/chat/conversations/${conversationId}/messages`,
  );

  return Array.isArray(response.data) ? response.data : [];
};

export const sendChatMessage = async (conversationId, content) => {
  const response = await api.post(
    `/chat/conversations/${conversationId}/messages`,
    {
      content,
    },
  );

  return response.data;
};

export const closeChatConversation = async (conversationId) => {
  const response = await api.put(`/chat/conversations/${conversationId}/close`);

  return response.data;
};

/**
 * Chat với AI (Gemini) + lưu history.
 * POST /api/chat/ai
 *
 * @param {number|null} conversationId - null = backend tự tạo conversation AI
 * @param {string} message
 * @returns {Promise<{
 *   conversation: object,
 *   userMessage: object,
 *   aiMessage: object,
 *   products: Array
 * }>}
 */
export const sendAiChatMessage = async (conversationId, message) => {
  const response = await api.post("/chat/ai", {
    conversationId: conversationId ?? null,
    message,
  });

  return response.data;
};

export const deleteChatConversation = async (conversationId) => {
  await api.delete(`/chat/conversations/${conversationId}`);
};
