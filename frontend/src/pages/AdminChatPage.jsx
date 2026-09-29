import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ProductChatCard from "../components/ProductChatCard.jsx";
import { useThemeLanguage } from "../context/useThemeLanguage.js";

import {
  closeAdminChatConversation,
  getAdminChatConversations,
  getAdminChatMessages,
  reopenAdminChatConversation,
  sendAdminChatMessage,
} from "../services/adminChatService.js";
import { getProducts } from "../services/productService.js";
import { buildProductChatMessage, parseProductChatMessage } from "../utils/chatProductUtils.js";

function AdminChatPage() {
  const { language } = useThemeLanguage();

  const text = {
    vi: {
      eyebrow: "Admin Chat",
      title: "Trò chuyện với khách hàng",
      description:
        "Theo dõi và phản hồi các cuộc trò chuyện giữa Shop và khách hàng.",
      search: "Tìm khách hàng...",
      conversations: "Cuộc trò chuyện",
      conversation: "Conversation",
      noConversation: "Chưa có cuộc trò chuyện nào.",
      selectConversation: "Chọn một cuộc trò chuyện để bắt đầu.",
      open: "Đang mở",
      closed: "Đã đóng",
      close: "Đóng chat",
      reopen: "Mở lại",
      placeholder: "Nhập nội dung trả lời...",
      send: "Gửi",
      sending: "Đang gửi...",
      loading: "Đang tải...",
      loadingMessages: "Đang tải tin nhắn...",
      emptyMessages: "Chưa có tin nhắn trong cuộc trò chuyện này.",
      loadError: "Không thể tải dữ liệu chat.",
      sendError: "Không thể gửi tin nhắn.",
      closedNotice: "Cuộc trò chuyện đã đóng. Hãy mở lại để tiếp tục trả lời.",
      back: "Danh sách",
      shop: "Shop",
      user: "Khách",
      chooseProduct: "Chọn sản phẩm",
      sendProduct: "Gửi sản phẩm",
      searchProduct: "Tìm sản phẩm...",
      noProducts: "Không tìm thấy sản phẩm.",
      loadingProducts: "Đang tải sản phẩm...",
      productSentNote: "Mời bạn xem sản phẩm này.",
    },

    en: {
      eyebrow: "Admin Chat",
      title: "Customer conversations",
      description:
        "Manage and reply to conversations between the shop and customers.",
      search: "Search customers...",
      conversations: "Conversations",
      conversation: "Conversation",
      noConversation: "No conversations yet.",
      selectConversation: "Select a conversation to get started.",
      open: "Open",
      closed: "Closed",
      close: "Close chat",
      reopen: "Reopen",
      placeholder: "Type your reply...",
      send: "Send",
      sending: "Sending...",
      loading: "Loading...",
      loadingMessages: "Loading messages...",
      emptyMessages: "There are no messages in this conversation.",
      loadError: "Unable to load chat data.",
      sendError: "Unable to send the message.",
      closedNotice:
        "This conversation is closed. Reopen it to continue replying.",
      back: "List",
      shop: "Shop",
      user: "Customer",
      chooseProduct: "Choose a product",
      sendProduct: "Send product",
      searchProduct: "Search products...",
      noProducts: "No products found.",
      loadingProducts: "Loading products...",
      productSentNote: "Here is a product for you to check.",
    },
  };

  const t = text[language] || text.vi;

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerLoading, setProductPickerLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const selectedConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) || null
    );
  }, [conversations, selectedConversationId]);

  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const name = String(conversation.customerName || "").toLowerCase();

      const email = String(conversation.customerEmail || "").toLowerCase();

      const customerId = String(conversation.customerId || "").toLowerCase();

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        customerId.includes(keyword)
      );
    });
  }, [conversations, search]);

  const visibleMessages = selectedConversationId ? messages : [];

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const brand = String(product.brandName || "").toLowerCase();
      const category = String(product.categoryName || "").toLowerCase();
      return (
        name.includes(keyword) ||
        brand.includes(keyword) ||
        category.includes(keyword)
      );
    });
  }, [productSearch, products]);

  const totalUnread = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) =>
          total + Number(conversation.unreadCount || 0),
        0,
      ),
    [conversations],
  );

  const formatTime = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString(language === "en" ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        return [];
      }

      try {
        setMessagesLoading(true);
        setError("");

        const data = await getAdminChatMessages(conversationId);

        setMessages(data);

        return data;
      } catch (requestError) {
        console.error("Không thể tải messages:", requestError);

        setMessages([]);

        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            t.loadError,
        );

        return [];
      } finally {
        setMessagesLoading(false);
      }
    },
    [t.loadError],
  );

  const loadConversations = useCallback(
    async (keepSelection = true) => {
      try {
        setError("");

        const data = await getAdminChatConversations();

        setConversations(data);

        if (!keepSelection) {
          setSelectedConversationId(null);
          return data;
        }

        setSelectedConversationId((current) => {
          if (
            current &&
            data.some((conversation) => conversation.id === current)
          ) {
            return current;
          }

          return data[0]?.id || null;
        });

        return data;
      } catch (requestError) {
        console.error("Không thể tải Admin Chat:", requestError);

        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            t.loadError,
        );

        return [];
      }
    },
    [t.loadError],
  );

  /*
   * Initial loading.
   *
   * Không dùng effect để theo dõi selectedConversationId.
   * Conversation đầu tiên được tải message ngay tại đây.
   */
  useEffect(() => {
    let active = true;

    const initialLoad = async () => {
      setLoading(true);

      const data = await loadConversations();

      if (!active) {
        return;
      }

      const firstConversationId = data[0]?.id || null;

      if (firstConversationId) {
        await loadMessages(firstConversationId);
      }

      if (active) {
        setLoading(false);
      }
    };

    void initialLoad();

    return () => {
      active = false;
    };
  }, [loadConversations, loadMessages]);

  /*
   * Refresh danh sách conversation mỗi 5 giây.
   *
   * setState nằm trong callback bất đồng bộ của timer,
   * không nằm trực tiếp trong body của effect.
   */
  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        const data = await getAdminChatConversations();

        setConversations(data);

        const totalUnread = data.reduce(
          (total, conversation) =>
            total + Number(conversation.unreadCount || 0),
          0,
        );

        window.dispatchEvent(
          new CustomEvent("admin-chat-unread-changed", {
            detail: { totalUnread },
          }),
        );
      } catch (requestError) {
        console.error("Không thể refresh conversations:", requestError);
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  /*
   * Refresh messages conversation đang mở mỗi 5 giây.
   */
  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const conversationId = selectedConversationId;

    const intervalId = window.setInterval(async () => {
      try {
        const data = await getAdminChatMessages(conversationId);

        setMessages(data);
      } catch (requestError) {
        console.error("Không thể refresh messages:", requestError);
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [selectedConversationId]);

  /*
   * Scroll xuống message mới nhất.
   *
   * requestAnimationFrame giúp thao tác DOM
   * sau khi React render messages mới.
   */
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }, [messages]);

  const handleSelectConversation = async (conversationId) => {
    setSelectedConversationId(conversationId);
    setMobileShowChat(true);
    setError("");

    await loadMessages(conversationId);

    setConversations((current) => {
      const next = current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unreadCount: 0,
            }
          : conversation,
      );

      const totalUnread = next.reduce(
        (total, conversation) =>
          total + Number(conversation.unreadCount || 0),
        0,
      );

      window.dispatchEvent(
        new CustomEvent("admin-chat-unread-changed", {
          detail: { totalUnread },
        }),
      );

      return next;
    });
  };

  const handleOpenProductPicker = async () => {
    setProductPickerOpen(true);
    setProductSearch("");

    if (products.length > 0 || productPickerLoading) {
      return;
    }

    try {
      setProductPickerLoading(true);

      const data = await getProducts();
      const productList = Array.isArray(data) ? data : data?.content || [];

      setProducts(productList);
    } catch (requestError) {
      console.error("Không thể tải danh sách sản phẩm để gửi chat:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.loadError,
      );
    } finally {
      setProductPickerLoading(false);
    }
  };

  const handleSendProduct = async (product) => {
    if (!product?.id || !selectedConversationId || sending) {
      return;
    }

    if (selectedConversation?.status === "CLOSED") {
      return;
    }

    try {
      setSending(true);
      setError("");

      const content = buildProductChatMessage(
        product.id,
        t.productSentNote,
      );

      const savedMessage = await sendAdminChatMessage(
        selectedConversationId,
        content,
      );

      setMessages((current) => [...current, savedMessage]);

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                assignedAdminId: savedMessage.senderId,
                lastMessageAt: savedMessage.createdAt,
                updatedAt: savedMessage.createdAt,
              }
            : conversation,
        ),
      );

      setProductPickerOpen(false);
      setProductSearch("");

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } catch (requestError) {
      console.error("Không thể gửi sản phẩm vào chat Admin:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.sendError,
      );
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    const content = messageInput.trim();

    if (!content || sending || !selectedConversationId) {
      return;
    }

    if (selectedConversation?.status === "CLOSED") {
      return;
    }

    try {
      setSending(true);
      setError("");

      const savedMessage = await sendAdminChatMessage(
        selectedConversationId,
        content,
      );

      setMessages((current) => [...current, savedMessage]);

      setMessageInput("");

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                assignedAdminId: savedMessage.senderId,
                lastMessageAt: savedMessage.createdAt,
                updatedAt: savedMessage.createdAt,
              }
            : conversation,
        ),
      );

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } catch (requestError) {
      console.error("Không thể gửi Admin Chat:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.sendError,
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversationId) {
      return;
    }

    try {
      setError("");

      const updated = await closeAdminChatConversation(selectedConversationId);

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                ...updated,
              }
            : conversation,
        ),
      );
    } catch (requestError) {
      console.error("Không thể đóng conversation:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.loadError,
      );
    }
  };

  const handleReopenConversation = async () => {
    if (!selectedConversationId) {
      return;
    }

    try {
      setError("");

      const updated = await reopenAdminChatConversation(selectedConversationId);

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                ...updated,
              }
            : conversation,
        ),
      );
    } catch (requestError) {
      console.error("Không thể mở lại conversation:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          t.loadError,
      );
    }
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <style>{`
        @keyframes adminChatFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .admin-chat-fade-in {
          animation:
            adminChatFadeIn
            0.4s cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }
      `}</style>

      <section className="mx-auto max-w-7xl px-4 pb-5 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="admin-chat-fade-in">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
            {t.eyebrow}
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
                {t.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500">
                {t.description}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-400">
              {totalUnread > 0 && (
                <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-600 ring-1 ring-red-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {totalUnread > 99 ? "99+" : totalUnread}{" "}
                  {language === "en" ? "new messages" : "tin nhắn mới"}
                </span>
              )}

              <span>
                {conversations.length}{" "}
                {language === "en" ? "conversations" : "cuộc trò chuyện"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        <div className="grid h-[clamp(620px,calc(100vh-250px),820px)] min-h-0 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:grid-cols-[330px_minmax(0,1fr)]">
          {/* Conversation list */}
          <aside
            className={`flex min-h-0 flex-col border-r border-neutral-200 bg-[#fbfbfa] ${
              mobileShowChat ? "hidden lg:block" : "block"
            }`}
          >
            <div className="border-b border-neutral-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {t.conversations}
              </p>

              <div className="mt-3">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.search}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-100"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-xl border border-neutral-100 bg-white p-4"
                    >
                      <div className="h-4 w-32 rounded bg-neutral-100" />
                      <div className="mt-2 h-3 w-44 rounded bg-neutral-100" />
                      <div className="mt-4 h-3 w-16 rounded bg-neutral-100" />
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-neutral-950">
                    {t.noConversation}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const active = conversation.id === selectedConversationId;

                  const unread = Number(conversation.unreadCount || 0) > 0;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() =>
                        void handleSelectConversation(conversation.id)
                      }
                      className={`relative w-full border-b border-neutral-100 p-4 text-left transition-all duration-200 ${
                        active
                          ? "bg-white ring-1 ring-inset ring-neutral-200"
                          : unread
                            ? "bg-red-50/40 hover:bg-red-50/70"
                            : "hover:bg-white"
                      }`}
                    >
                      {unread && (
                        <span className="absolute inset-y-0 left-0 w-1 animate-pulse bg-red-500" />
                      )}

                      <div className="flex items-start justify-between gap-3 pl-1">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-950">
                            {conversation.customerName || "Unknown User"}
                          </p>

                          <p className="mt-1 truncate text-xs text-neutral-400">
                            {conversation.customerEmail}
                          </p>
                        </div>

                        {unread && (
                          <span className="shrink-0 animate-pulse rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_0_0_3px_rgba(239,68,68,0.10)]">
                            {conversation.unreadCount > 99
                              ? "99+"
                              : conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                            conversation.status === "OPEN"
                              ? "text-neutral-950"
                              : "text-neutral-400"
                          }`}
                        >
                          {conversation.status === "OPEN" ? t.open : t.closed}
                        </span>

                        <span className="truncate text-[10px] text-neutral-400">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat panel */}
          <section
            className={`min-w-0 min-h-0 ${
              mobileShowChat ? "flex" : "hidden lg:flex"
            } flex-col`}
          >
            {!selectedConversation ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-neutral-950">
                    {t.conversation}
                  </p>

                  <p className="mt-2 text-sm text-neutral-400">
                    {t.selectConversation}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <header className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-white px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="mb-3 text-xs font-medium text-neutral-400 transition-colors duration-200 hover:text-neutral-950 lg:hidden"
                    >
                      ← {t.back}
                    </button>

                    <p className="truncate text-base font-semibold text-neutral-950">
                      {selectedConversation.customerName || "Unknown User"}
                    </p>

                    <p className="mt-1 truncate text-xs text-neutral-400">
                      {selectedConversation.customerEmail}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`hidden rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] sm:inline-flex ${
                        selectedConversation.status === "OPEN"
                          ? "bg-neutral-100 text-neutral-700"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {selectedConversation.status === "OPEN"
                        ? t.open
                        : t.closed}
                    </span>

                    {selectedConversation.status === "OPEN" ? (
                      <button
                        type="button"
                        onClick={() => void handleCloseConversation()}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950"
                      >
                        {t.close}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleReopenConversation()}
                        className="rounded-lg bg-neutral-950 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-neutral-800"
                      >
                        {t.reopen}
                      </button>
                    )}
                  </div>
                </header>

                {/* Messages */}
                <div className="min-h-0 flex-1 overflow-y-auto bg-[#fafaf9] px-4 py-5 sm:px-6">
                  {messagesLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-xs text-neutral-400">
                        {t.loadingMessages}
                      </p>
                    </div>
                  ) : visibleMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <p className="text-sm text-neutral-400">
                        {t.emptyMessages}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visibleMessages.map((message) => {
                        const isAdmin = message.senderType === "ADMIN";
                        const productMessage = parseProductChatMessage(
                          message.content,
                        );

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isAdmin ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="max-w-[82%]">
                              <div
                                className={`mb-1 flex items-center gap-2 ${
                                  isAdmin ? "justify-end" : "justify-start"
                                }`}
                              >
                                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                                  {isAdmin ? t.shop : t.user}
                                </span>
                              </div>

                              {productMessage ? (
                                <div>
                                  <ProductChatCard
                                    productId={productMessage.productId}
                                    note={productMessage.note}
                                    mine={isAdmin}
                                    language={language}
                                  />

                                  <p
                                    className={`mt-1.5 text-[10px] ${
                                      isAdmin
                                        ? "text-right text-neutral-400"
                                        : "text-neutral-400"
                                    }`}
                                  >
                                    {formatTime(message.createdAt)}
                                  </p>
                                </div>
                              ) : (
                                <div
                                  className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                                    isAdmin
                                      ? "rounded-br-md bg-neutral-950 text-white"
                                      : "rounded-bl-md border border-neutral-200 bg-white text-neutral-800"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap break-words">
                                    {message.content}
                                  </p>

                                  <p className="mt-2 text-[10px] text-neutral-400">
                                    {formatTime(message.createdAt)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Composer */}
                {selectedConversation.status === "CLOSED" ? (
                  <div className="border-t border-neutral-200 bg-white px-5 py-4">
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                      {t.closedNotice}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-neutral-200 bg-white p-4 sm:p-5">
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-2 transition-all duration-200 focus-within:border-neutral-950 focus-within:bg-white focus-within:ring-4 focus-within:ring-neutral-100">
                      <textarea
                        ref={inputRef}
                        rows={3}
                        maxLength={2000}
                        value={messageInput}
                        onChange={(event) =>
                          setMessageInput(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder={t.placeholder}
                        className="w-full resize-none bg-transparent px-2 py-1.5 text-sm text-neutral-950 outline-none placeholder:text-neutral-400"
                      />

                      <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 text-[10px] text-neutral-400">
                            {messageInput.length}/2000
                          </span>

                          <button
                            type="button"
                            onClick={() => void handleOpenProductPicker()}
                            disabled={sending}
                            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {t.sendProduct}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleSend()}
                          disabled={sending || !messageInput.trim()}
                          className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {sending ? t.sending : t.send}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </section>

      {productPickerOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/25 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close product picker"
            onClick={() => setProductPickerOpen(false)}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 flex max-h-[min(760px,calc(100vh-32px))] w-full max-w-2xl flex-col overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Chat
                </p>

                <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                  {t.chooseProduct}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setProductPickerOpen(false)}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-600 transition-colors duration-200 hover:border-neutral-950 hover:text-neutral-950"
              >
                ×
              </button>
            </div>

            <div className="border-b border-neutral-100 p-4 sm:p-5">
              <input
                type="text"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder={t.searchProduct}
                autoFocus
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-950 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
              {productPickerLoading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm text-neutral-400">{t.loadingProducts}</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-center">
                  <p className="text-sm text-neutral-400">{t.noProducts}</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => void handleSendProduct(product)}
                      disabled={sending}
                      className="group rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:shadow-[0_12px_30px_rgba(0,0,0,0.07)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-neutral-400">
                            #{product.id}
                          </p>

                          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-neutral-950">
                            {product.name}
                          </p>

                          <p className="mt-2 text-xs text-neutral-400">
                            {product.brandName || "Sneaker"}
                          </p>

                          <p className="mt-3 text-sm font-semibold text-neutral-950">
                            {Number(product.basePrice || 0).toLocaleString("vi-VN")} ₫
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full border border-neutral-200 px-2.5 py-1 text-[10px] font-semibold text-neutral-500 transition-colors duration-200 group-hover:border-neutral-950 group-hover:text-neutral-950">
                          {t.sendProduct}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminChatPage;
