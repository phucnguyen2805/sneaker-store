import api from "./api.js";

export const getAdminChatConversations = async () => {
  const response = await api.get("/admin/chat/conversations");

  return Array.isArray(response.data) ? response.data : [];
};

export const getAdminChatMessages = async (conversationId) => {
  const response = await api.get(
    `/admin/chat/conversations/${conversationId}/messages`,
  );

  return Array.isArray(response.data) ? response.data : [];
};

export const sendAdminChatMessage = async (conversationId, content) => {
  const response = await api.post(
    `/admin/chat/conversations/${conversationId}/messages`,
    {
      content,
    },
  );

  return response.data;
};

export const closeAdminChatConversation = async (conversationId) => {
  const response = await api.put(
    `/admin/chat/conversations/${conversationId}/close`,
  );

  return response.data;
};

export const reopenAdminChatConversation = async (conversationId) => {
  const response = await api.put(
    `/admin/chat/conversations/${conversationId}/reopen`,
  );

  return response.data;
};
