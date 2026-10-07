import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import ProductChatCard from "./ProductChatCard.jsx";
import { useThemeLanguage } from "../context/useThemeLanguage.js";

import {
  createChatConversation,
  deleteChatConversation,
  getChatMessages,
  getMyChatConversations,
  sendAiChatMessage,
  sendChatMessage,
} from "../services/chatService.js";
import {
  buildProductChatMessage,
  extractAiProductIds,
  parseProductChatMessage,
  stripAiProductTags,
} from "../utils/chatProductUtils.js";

const CHAT_TYPES = {
  SHOP: "SHOP",
  AI: "AI",
};

function ChatWidget() {
  const navigate = useNavigate();
  const { language } = useThemeLanguage();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isAdmin = (() => {
    if (!user) {
      return false;
    }

    const role = String(user.role || user.roleName || "").toUpperCase();
    if (role === "ADMIN" || role === "ROLE_ADMIN") {
      return true;
    }

    const roles = user.roles || user.authorities || [];
    if (Array.isArray(roles)) {
      return roles.some((item) => {
        const value =
          typeof item === "string"
            ? item
            : item?.authority || item?.role || item?.name || "";
        const normalized = String(value).toUpperCase();
        return (
          normalized === "ADMIN" ||
          normalized === "ROLE_ADMIN" ||
          normalized.endsWith("_ADMIN")
        );
      });
    }

    return false;
  })();

  // Admin dùng trang Admin Chat — không hiện widget storefront

  const [open, setOpen] = useState(false);
  const [activeType, setActiveType] = useState(CHAT_TYPES.SHOP);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  const [messages, setMessages] = useState([]);

  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [incomingUnreadCount, setIncomingUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const incomingStateRef = useRef(new Map());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const text = {
    vi: {
      button: "Chat",
      title: "Trò chuyện",
      shop: "Chat với Shop",
      ai: "Chat với AI",
      shopDescription: "Trao đổi trực tiếp với đội ngũ hỗ trợ.",
      aiDescription: "Trợ lý AI sẽ hỗ trợ bạn tìm sản phẩm.",
      loginTitle: "Đăng nhập để trò chuyện",
      loginDescription: "Lịch sử trò chuyện được lưu theo tài khoản của bạn.",
      login: "Đăng nhập",
      close: "Đóng",
      placeholder: "Nhập tin nhắn...",
      send: "Gửi",
      sending: "Đang gửi...",
      loading: "Đang tải...",
      empty: "Chưa có tin nhắn nào.",
      loadError: "Không thể tải lịch sử trò chuyện.",
      sendError: "Không thể gửi tin nhắn.",
      aiEmpty:
        'Hỏi AI về sản phẩm, giá, size hoặc tồn kho. Ví dụ: "Nike dưới 3 triệu".',
      aiThinking: "AI đang trả lời...",
      today: "Hôm nay",
      justNow: "Vừa xong",
      deleteChat: "Xóa hội thoại",
      deleteModalTitle: "Xóa hội thoại?",
      deleteModalBody:
        "Toàn bộ tin nhắn hội thoại này sẽ bị xóa vĩnh viễn. Không hoàn tác được.",
      deleteConfirm: "Xóa hội thoại",
      deleteCancel: "Hủy",
      deleteError: "Không thể xóa hội thoại.",
    },
    en: {
      button: "Chat",
      title: "Conversation",
      shop: "Chat with Shop",
      ai: "Chat with AI",
      shopDescription: "Talk directly with our support team.",
      aiDescription: "The AI assistant will help you find products.",
      loginTitle: "Sign in to chat",
      loginDescription: "Your chat history is saved to your account.",
      login: "Sign in",
      close: "Close",
      placeholder: "Type a message...",
      send: "Send",
      sending: "Sending...",
      loading: "Loading...",
      empty: "No messages yet.",
      loadError: "Unable to load chat history.",
      sendError: "Unable to send the message.",
      aiEmpty:
        'Ask the AI about products, price, size or stock. Example: "Nike under 3 million".',
      aiThinking: "AI is thinking...",
      today: "Today",
      justNow: "Just now",
      deleteChat: "Delete chat",
      deleteModalTitle: "Delete conversation?",
      deleteModalBody:
        "All messages in this conversation will be permanently deleted. This cannot be undone.",
      deleteConfirm: "Delete conversation",
      deleteCancel: "Cancel",
      deleteError: "Unable to delete the conversation.",
    },
  };

  const t = text[language] || text.vi;

  const activeConversationByType = conversations.find(
    (conversation) =>
      conversation.type === activeType && conversation.status === "OPEN",
  );

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }, []);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) {
      return [];
    }

    const data = await getMyChatConversations();

    setConversations(data);

    return data;
  }, [isAuthenticated]);

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      try {
        setMessagesLoading(true);
        setError("");

        const data = await getChatMessages(conversationId);

        setMessages(data);

        scrollToBottom();
      } catch (requestError) {
        console.error("Không thể tải chat messages:", requestError);

        setMessages([]);

        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            t.loadError,
        );
      } finally {
        setMessagesLoading(false);
      }
    },
    [scrollToBottom, t.loadError],
  );

  const ensureConversation = useCallback(
    async (type, existingConversations = null) => {
      if (!isAuthenticated) {
        return null;
      }

      const source = existingConversations || conversations;

      const existing = source.find(
        (conversation) =>
          conversation.type === type && conversation.status === "OPEN",
      );

      if (existing) {
        setActiveConversation(existing);

        return existing;
      }

      const created = await createChatConversation(type);

      setConversations((current) => {
        const alreadyExists = current.some(
          (conversation) => conversation.id === created.id,
        );

        if (alreadyExists) {
          return current;
        }

        return [...current, created];
      });

      setActiveConversation(created);

      return created;
    },
    [conversations, isAuthenticated],
  );

  const handleOpen = async () => {
    setOpen(true);
    setError("");

    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);

      const data = await loadConversations();

      const conversation = await ensureConversation(activeType, data);

      if (conversation?.id) {
        await loadMessages(conversation.id);
      }
    } catch (requestError) {
      console.error("Không thể khởi tạo chat:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.loadError,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogin = () => {
    setOpen(false);

    navigate("/login", {
      state: {
        from: window.location.pathname,
      },
    });
  };

  const handleTypeChange = async (type) => {
    if (type === activeType) {
      return;
    }

    setActiveType(type);
    setMessages([]);
    setError("");

    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);

      const data =
        conversations.length > 0 ? conversations : await loadConversations();

      const conversation = await ensureConversation(type, data);

      if (conversation?.id) {
        await loadMessages(conversation.id);
      }
    } catch (requestError) {
      console.error("Không thể chuyển loại chat:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.loadError,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendProduct = useCallback(
    async (productId, note = "") => {
      if (!isAuthenticated) {
        setOpen(false);

        navigate("/login", {
          state: {
            from: window.location.pathname,
          },
        });
        return;
      }

      try {
        setOpen(true);
        setActiveType(CHAT_TYPES.SHOP);
        setLoading(true);
        setError("");

        const data = await loadConversations();
        const conversation = await ensureConversation(CHAT_TYPES.SHOP, data);

        if (!conversation?.id) {
          throw new Error(t.sendError);
        }

        await loadMessages(conversation.id);

        const content = buildProductChatMessage(productId, note);
        const savedMessage = await sendChatMessage(conversation.id, content);

        setMessages((current) => [...current, savedMessage]);

        setConversations((current) =>
          current.map((item) =>
            item.id === conversation.id
              ? {
                  ...item,
                  lastMessageAt: savedMessage.createdAt,
                  updatedAt: savedMessage.createdAt,
                }
              : item,
          ),
        );

        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });

        scrollToBottom();
      } catch (requestError) {
        console.error("Không thể gửi sản phẩm vào chat:", requestError);

        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            t.sendError,
        );
      } finally {
        setLoading(false);
      }
    },
    [
      ensureConversation,
      isAuthenticated,
      loadConversations,
      loadMessages,
      navigate,
      scrollToBottom,
      t.sendError,
    ],
  );

  const handleSend = async () => {
    const content = messageInput.trim();

    if (!content || sending) {
      return;
    }

    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    try {
      setSending(true);
      setError("");

      // ========== AI CHAT ==========
      if (activeType === CHAT_TYPES.AI) {
        const conversationId =
          activeConversation?.type === CHAT_TYPES.AI
            ? activeConversation.id
            : null;

        // --- Optimistic: hiện bubble USER ngay ---
        const tempId = `temp-user-${Date.now()}`;
        const optimisticUserMessage = {
          id: tempId,
          conversationId: conversationId,
          senderType: "USER",
          senderId: null,
          content,
          isRead: true,
          createdAt: new Date().toISOString(),
        };

        setMessages((current) => [...current, optimisticUserMessage]);
        setMessageInput("");
        scrollToBottom();

        // --- Gọi API (AI trả lời sau) ---
        const response = await sendAiChatMessage(conversationId, content);

        const { conversation, userMessage, aiMessage } = response;

        if (conversation) {
          setActiveConversation(conversation);

          setConversations((current) => {
            const exists = current.some((item) => item.id === conversation.id);

            if (exists) {
              return current.map((item) =>
                item.id === conversation.id
                  ? {
                      ...item,
                      ...conversation,
                      lastMessageAt:
                        aiMessage?.createdAt || conversation.lastMessageAt,
                    }
                  : item,
              );
            }

            return [...current, conversation];
          });
        }

        // Thay temp bằng message thật + thêm AI
        setMessages((current) => {
          const withoutTemp = current.filter((item) => item.id !== tempId);
          const next = [...withoutTemp];

          if (userMessage) {
            next.push(userMessage);
          }

          if (aiMessage) {
            next.push(aiMessage);
          }

          return next;
        });

        scrollToBottom();
        return;
      }

      // ========== SHOP CHAT (giữ logic cũ) ==========
      let conversation = activeConversation;

      if (!conversation || conversation.type !== CHAT_TYPES.SHOP) {
        conversation = await ensureConversation(CHAT_TYPES.SHOP);
      }

      if (!conversation?.id) {
        throw new Error(t.sendError);
      }

      const savedMessage = await sendChatMessage(conversation.id, content);

      setMessages((current) => [...current, savedMessage]);
      setMessageInput("");

      setConversations((current) =>
        current.map((item) =>
          item.id === conversation.id
            ? {
                ...item,
                lastMessageAt: savedMessage.createdAt,
                updatedAt: savedMessage.createdAt,
              }
            : item,
        ),
      );

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });

      scrollToBottom();
    } catch (requestError) {
      console.error("Không thể gửi tin nhắn:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.sendError,
      );
      // Xóa bubble USER tạm nếu gửi AI thất bại
      setMessages((current) =>
        current.filter(
          (item) =>
            typeof item.id !== "string" ||
            !String(item.id).startsWith("temp-user-"),
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const openDeleteModal = () => {
    if (!activeConversation?.id || sending || deleting) {
      return;
    }
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }
    setDeleteModalOpen(false);
  };

  const handleDeleteConversation = async () => {
    const conversation = activeConversation;

    if (!conversation?.id || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteChatConversation(conversation.id);

      setConversations((current) =>
        current.filter((item) => item.id !== conversation.id),
      );
      setActiveConversation(null);
      setMessages([]);
      setDeleteModalOpen(false);

      // Tạo lại conversation trống cùng type
      const created = await ensureConversation(activeType, []);
      if (created?.id) {
        setActiveConversation(created);
        setMessages([]);
      }
    } catch (requestError) {
      console.error("Không thể xóa conversation:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.deleteError,
      );
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const handleOpenProductChat = (event) => {
      const productId = Number(event.detail?.productId);

      if (!Number.isInteger(productId) || productId <= 0) {
        return;
      }

      const note =
        typeof event.detail?.note === "string"
          ? event.detail.note
          : "Cho mình hỏi sản phẩm này còn hàng không?";

      void handleSendProduct(productId, note);
    };

    window.addEventListener("open-chat-with-product", handleOpenProductChat);

    return () => {
      window.removeEventListener(
        "open-chat-with-product",
        handleOpenProductChat,
      );
    };
  }, [handleSendProduct]);

  useEffect(() => {
    const handleChatAuthChanged = (event) => {
      if (event.detail?.authenticated === false) {
        incomingStateRef.current.clear();
        setIncomingUnreadCount(0);
      }
    };

    window.addEventListener("chat-auth-changed", handleChatAuthChanged);

    return () => {
      window.removeEventListener("chat-auth-changed", handleChatAuthChanged);
    };
  }, []);

  useEffect(() => {
    if (!open || !isAuthenticated) {
      return;
    }

    const active = activeConversation || activeConversationByType;

    if (!active?.id) {
      return;
    }

    // AI không cần poll; SHOP mới cần nhận tin admin
    if (active.type === CHAT_TYPES.AI) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      // Đang gửi thì đừng ghi đè list
      if (sending) {
        return;
      }

      try {
        const data = await getChatMessages(active.id);
        setMessages(data);
      } catch (requestError) {
        console.error("Không thể refresh chat:", requestError);
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    activeConversation,
    activeConversationByType,
    isAuthenticated,
    open,
    sending,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      incomingStateRef.current.clear();
      return undefined;
    }

    let active = true;
    let initialized = false;

    const loadIncomingNotifications = async () => {
      try {
        const data = await getMyChatConversations();

        const shopConversations = data.filter(
          (conversation) => conversation.type === CHAT_TYPES.SHOP,
        );

        const nextState = new Map(incomingStateRef.current);
        let newlyReceived = 0;

        for (const conversation of shopConversations) {
          const messageData = await getChatMessages(conversation.id);

          const adminMessages = messageData.filter(
            (message) => message.senderType === "ADMIN",
          );

          if (adminMessages.length === 0) {
            continue;
          }

          const latestMessage = adminMessages[adminMessages.length - 1];
          const previousLatestId = nextState.get(conversation.id);

          if (!initialized) {
            nextState.set(conversation.id, latestMessage.id);
            continue;
          }

          if (previousLatestId === undefined) {
            nextState.set(conversation.id, latestMessage.id);
            newlyReceived += 1;
            continue;
          }

          const previousIndex = adminMessages.findIndex(
            (message) => message.id === previousLatestId,
          );

          if (previousIndex === -1) {
            nextState.set(conversation.id, latestMessage.id);
            newlyReceived += 1;
            continue;
          }

          const newMessages = adminMessages.slice(previousIndex + 1);

          if (newMessages.length > 0) {
            newlyReceived += newMessages.length;
            nextState.set(conversation.id, latestMessage.id);
          }
        }

        incomingStateRef.current = nextState;
        initialized = true;

        if (!active || newlyReceived === 0 || open) {
          return;
        }

        setIncomingUnreadCount((current) => current + newlyReceived);
      } catch (requestError) {
        console.error(
          "Không thể kiểm tra tin nhắn mới của Chat Widget:",
          requestError,
        );
      }
    };

    void loadIncomingNotifications();

    const intervalId = window.setInterval(() => {
      void loadIncomingNotifications();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, open]);

  useEffect(() => {
    if (!open || !isAuthenticated) {
      return;
    }

    if (activeConversation?.id) {
      scrollToBottom();
    }
  }, [activeConversation?.id, open, isAuthenticated, scrollToBottom]);

  const markIncomingNotificationsAsRead = useCallback(async () => {
    try {
      const data = await getMyChatConversations();

      const shopConversations = data.filter(
        (conversation) => conversation.type === CHAT_TYPES.SHOP,
      );

      const nextState = new Map(incomingStateRef.current);

      await Promise.all(
        shopConversations.map(async (conversation) => {
          const messageData = await getChatMessages(conversation.id);

          const adminMessages = messageData.filter(
            (message) => message.senderType === "ADMIN",
          );

          if (adminMessages.length > 0) {
            nextState.set(
              conversation.id,
              adminMessages[adminMessages.length - 1].id,
            );
          }
        }),
      );

      incomingStateRef.current = nextState;
      setIncomingUnreadCount(0);
    } catch (requestError) {
      console.error("Không thể đánh dấu thông báo chat đã xem:", requestError);
      setIncomingUnreadCount(0);
    }
  }, []);

  if (isAdmin) {
    return null;
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={async () => {
            await markIncomingNotificationsAsRead();
            await handleOpen();
          }}
          className={`fixed bottom-5 right-5 z-[80] rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-800 hover:shadow-[0_18px_40px_rgba(0,0,0,0.22)] active:translate-y-0 sm:bottom-7 sm:right-7 ${
            incomingUnreadCount > 0 ? "animate-pulse" : ""
          }`}
          aria-label={t.button}
        >
          <span className="flex items-center gap-2">
            {t.button}

            {incomingUnreadCount > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-[0_0_0_3px_rgba(239,68,68,0.14)]">
                {incomingUnreadCount > 99 ? "99+" : incomingUnreadCount}
              </span>
            )}
          </span>
        </button>
      )}

      {open && (
        <>
          <button
            type="button"
            aria-label={t.close}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-neutral-950/10 backdrop-blur-[2px]"
          />

          <section className="fixed bottom-4 right-4 z-[90] flex h-[min(680px,calc(100vh-32px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.18)] animate-[chatPanelIn_0.32s_cubic-bezier(0.22,1,0.36,1)] sm:bottom-7 sm:right-7">
            <style>{`
              @keyframes chatPanelIn {
                from {
                  opacity: 0;
                  transform: translateY(16px) scale(0.97);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}</style>

            {/* Header */}
            <div className="border-b border-neutral-200 px-5 pb-4 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                    Sneaker Store
                  </p>

                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                    {t.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950"
                >
                  {t.close}
                </button>
              </div>

              {/* Chat type switch */}
              <div className="mt-5 grid grid-cols-2 rounded-xl bg-neutral-100 p-1">
                <button
                  type="button"
                  onClick={() => handleTypeChange(CHAT_TYPES.SHOP)}
                  className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    activeType === CHAT_TYPES.SHOP
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {t.shop}
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange(CHAT_TYPES.AI)}
                  className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    activeType === CHAT_TYPES.AI
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {t.ai}
                </button>
              </div>

              <p className="mt-3 text-xs leading-5 text-neutral-400">
                {activeType === CHAT_TYPES.SHOP
                  ? t.shopDescription
                  : t.aiDescription}
              </p>

              {isAuthenticated && activeConversation?.id && (
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="mt-3 text-xs font-medium text-red-600 transition-colors hover:text-red-700"
                >
                  {t.deleteChat}
                </button>
              )}
            </div>

            {!isAuthenticated ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="w-full max-w-xs rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                  <p className="text-sm font-semibold text-neutral-950">
                    {t.loginTitle}
                  </p>

                  <p className="mt-2 text-xs leading-6 text-neutral-500">
                    {t.loginDescription}
                  </p>

                  <button
                    type="button"
                    onClick={handleLogin}
                    className="mt-5 w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
                  >
                    {t.login}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="min-h-0 flex-1 overflow-y-auto bg-[#fafaf9] px-4 py-5">
                  {loading || messagesLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-xs text-neutral-400">{t.loading}</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="max-w-xs text-center">
                        <p className="text-sm font-semibold text-neutral-950">
                          {t.empty}
                        </p>

                        {activeType === CHAT_TYPES.AI && (
                          <p className="mt-2 text-xs leading-5 text-neutral-400">
                            {t.aiEmpty}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isUser = message.senderType === "USER";

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="max-w-[82%]">
                              {(() => {
                                // 1) Message dạng SNEAKER_PRODUCT: (chat Shop gửi sp)
                                const productMessage = parseProductChatMessage(
                                  message.content,
                                );

                                if (productMessage) {
                                  return (
                                    <div>
                                      <ProductChatCard
                                        productId={productMessage.productId}
                                        note={productMessage.note}
                                        mine={isUser}
                                        language={language}
                                      />

                                      <p
                                        className={`mt-1.5 text-[10px] ${
                                          isUser
                                            ? "text-right text-neutral-400"
                                            : "text-neutral-400"
                                        }`}
                                      >
                                        {formatMessageTime(message.createdAt)}
                                      </p>
                                    </div>
                                  );
                                }

                                // 2) Message AI: text + card theo [productId:N]
                                const isAiMessage = message.senderType === "AI";
                                const aiProductIds = isAiMessage
                                  ? extractAiProductIds(message.content)
                                  : [];
                                const displayText = isAiMessage
                                  ? stripAiProductTags(message.content)
                                  : message.content;

                                return (
                                  <div>
                                    {displayText ? (
                                      <div
                                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                                          isUser
                                            ? "rounded-br-md bg-neutral-950 text-white"
                                            : "rounded-bl-md border border-neutral-200 bg-white text-neutral-800"
                                        }`}
                                      >
                                        <p className="whitespace-pre-wrap break-words">
                                          {displayText}
                                        </p>

                                        <p className="mt-1.5 text-[10px] text-neutral-400">
                                          {formatMessageTime(message.createdAt)}
                                        </p>
                                      </div>
                                    ) : null}

                                    {aiProductIds.length > 0 && (
                                      <div className="mt-2 space-y-2">
                                        {aiProductIds.map((productId) => (
                                          <ProductChatCard
                                            key={`${message.id}-${productId}`}
                                            productId={productId}
                                            note=""
                                            mine={false}
                                            language={language}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="border-t border-red-100 bg-red-50 px-4 py-2.5">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-neutral-200 bg-white p-4">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-2 transition-all duration-200 focus-within:border-neutral-950 focus-within:bg-white focus-within:ring-4 focus-within:ring-neutral-100">
                    <textarea
                      ref={inputRef}
                      rows={2}
                      value={messageInput}
                      onChange={(event) => setMessageInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={2000}
                      placeholder={t.placeholder}
                      className="w-full resize-none bg-transparent px-2 py-1.5 text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                    />

                    <div className="mt-1 flex items-center justify-between gap-3 border-t border-neutral-200 pt-2">
                      <span className="px-2 text-[10px] text-neutral-400">
                        {messageInput.length}/2000
                      </span>

                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending || !messageInput.trim()}
                        className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {sending
                          ? activeType === CHAT_TYPES.AI
                            ? t.aiThinking
                            : t.sending
                          : t.send}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </>
      )}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-950/40 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            onClick={closeDeleteModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
            <h3 className="text-base font-semibold text-neutral-950">
              {t.deleteModalTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {t.deleteModalBody}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-950 disabled:opacity-40"
              >
                {t.deleteCancel}
              </button>

              <button
                type="button"
                onClick={() => void handleDeleteConversation()}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
              >
                {deleting ? t.sending : t.deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default ChatWidget;
