import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";
import { getAdminChatConversations } from "../services/adminChatService.js";
import { logout } from "../store/authSlice.js";
import { fetchCart, resetCart } from "../store/cartSlice.js";

function LanguageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />

      <path
        strokeLinecap="round"
        d="M3 12h18M12 3c2.2 2.4 3.4 5.4 3.4 9S14.2 18.6 12 21c-2.2-2.4-3.4-5.4-3.4-9S9.8 5.4 12 3Z"
      />
    </svg>
  );
}

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminMenuRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  const { language, setLanguage } = useThemeLanguage();

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);

  const t = translations[language];

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    } else {
      dispatch(resetCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target)
      ) {
        setAdminMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return undefined;
    }

    let active = true;

    const loadAdminUnreadCount = async () => {
      try {
        const data = await getAdminChatConversations();
        const totalUnread = data.reduce(
          (total, conversation) =>
            total + Number(conversation.unreadCount || 0),
          0,
        );

        if (active) {
          setAdminUnreadCount(totalUnread);
        }

        window.dispatchEvent(
          new CustomEvent("admin-chat-unread-changed", {
            detail: { totalUnread },
          }),
        );
      } catch (error) {
        console.error(
          "Không thể tải số tin nhắn chưa đọc của Admin Chat:",
          error,
        );
      }
    };

    void loadAdminUnreadCount();

    const intervalId = window.setInterval(() => {
      void loadAdminUnreadCount();
    }, 5000);

    const handleAdminChatUnreadChanged = (event) => {
      setAdminUnreadCount(Number(event.detail?.totalUnread || 0));
    };

    window.addEventListener(
      "admin-chat-unread-changed",
      handleAdminChatUnreadChanged,
    );

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener(
        "admin-chat-unread-changed",
        handleAdminChatUnreadChanged,
      );
    };
  }, [isAuthenticated, isAdmin]);

  const getNavLinkClass = ({ isActive }) =>
    `group relative whitespace-nowrap px-1 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"
    }`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"
    }`;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    setAdminMenuOpen(false);
    setAdminUnreadCount(0);

    window.dispatchEvent(
      new CustomEvent("chat-auth-changed", {
        detail: { authenticated: false },
      }),
    );

    navigate("/");
  };

  const handleLanguageToggle = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  const displayName = user?.fullName || user?.name || user?.email || t.account;

  const totalItems = cart?.totalItems || 0;

  const languageTitle =
    language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt";

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-[76px] items-center justify-between gap-4 lg:gap-6">
          {/* Logo */}
          <NavLink
            to="/"
            className="shrink-0 transition-opacity duration-200 hover:opacity-65"
          >
            <div className="text-lg font-bold tracking-[-0.03em] text-neutral-950 sm:text-xl">
              Sneaker Store
            </div>

            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.28em] text-neutral-400">
              Premium Footwear
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 md:flex lg:gap-6">
            <NavLink to="/" end className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {t.nav.home}

                  <span
                    className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink to="/products" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {t.nav.products}

                  <span
                    className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink to="/about" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  {t.nav.about}

                  <span
                    className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/cart" className={getNavLinkClass}>
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-2">
                        {t.nav.cart}

                        {totalItems > 0 && (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                            {totalItems}
                          </span>
                        )}
                      </span>

                      <span
                        className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </>
                  )}
                </NavLink>

                <NavLink to="/profile" className={getNavLinkClass}>
                  {({ isActive }) => (
                    <>
                      {t.nav.account}

                      <span
                        className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </>
                  )}
                </NavLink>

                {/* Admin */}
                {isAdmin && (
                  <div ref={adminMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setAdminMenuOpen((current) => !current)}
                      className={`relative px-1 py-2 text-sm font-semibold transition-colors duration-200 ${
                        adminMenuOpen
                          ? "text-neutral-950"
                          : "text-neutral-500 hover:text-neutral-950"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {t.nav.admin}

                        {adminUnreadCount > 0 && (
                          <span className="inline-flex min-w-5 animate-pulse items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-[0_0_0_3px_rgba(239,68,68,0.08)]">
                            {adminUnreadCount > 99 ? "99+" : adminUnreadCount}
                          </span>
                        )}
                      </span>

                      <span
                        className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                          adminMenuOpen ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </button>

                    <div
                      className={`absolute right-0 top-[calc(100%+12px)] w-56 origin-top-right overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.10)] transition-all duration-200 ${
                        adminMenuOpen
                          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                          : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                      }`}
                    >
                      <div className="border-b border-neutral-100 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                          {t.nav.adminArea}
                        </p>
                      </div>

                      <div className="py-1">
                        <NavLink
                          to="/admin"
                          end
                          onClick={() => setAdminMenuOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-xl px-4 py-3 text-sm transition-colors duration-200 ${
                              isActive
                                ? "!bg-neutral-950 !text-white"
                                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                            }`
                          }
                        >
                          {t.nav.dashboard}
                        </NavLink>

                        <NavLink
                          to="/admin/chat"
                          onClick={() => setAdminMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors duration-200 ${
                              isActive
                                ? "!bg-neutral-950 !text-white"
                                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                            }`
                          }
                        >
                          <span>{t.nav.adminChat || "Chat"}</span>

                          {adminUnreadCount > 0 && (
                            <span className="inline-flex min-w-5 animate-pulse items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                              {adminUnreadCount > 99 ? "99+" : adminUnreadCount}
                            </span>
                          )}
                        </NavLink>

                        <NavLink
                          to="/admin/products"
                          onClick={() => setAdminMenuOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-xl px-4 py-3 text-sm transition-colors duration-200 ${
                              isActive
                                ? "!bg-neutral-950 !text-white"
                                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                            }`
                          }
                        >
                          {t.nav.adminProducts}
                        </NavLink>

                        <NavLink
                          to="/admin/orders"
                          onClick={() => setAdminMenuOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-xl px-4 py-3 text-sm transition-colors duration-200 ${
                              isActive
                                ? "!bg-neutral-950 !text-white"
                                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                            }`
                          }
                        >
                          {t.nav.adminOrders}
                        </NavLink>

                        <NavLink
                          to="/admin/users"
                          onClick={() => setAdminMenuOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-xl px-4 py-3 text-sm transition-colors duration-200 ${
                              isActive
                                ? "!bg-neutral-950 !text-white"
                                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                            }`
                          }
                        >
                          {t.nav.users}
                        </NavLink>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Language */}
            <button
              type="button"
              onClick={handleLanguageToggle}
              title={languageTitle}
              aria-label={languageTitle}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:text-neutral-950 active:translate-y-0"
            >
              <LanguageIcon />

              <span className="text-[11px] font-bold tracking-wide">
                {language.toUpperCase()}
              </span>
            </button>

            {/* User */}
            {isAuthenticated ? (
              <>
                <div className="hidden border-l border-neutral-200 pl-5 lg:block">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                    {t.nav.greeting}
                  </p>

                  <p className="mt-0.5 max-w-32 truncate text-sm font-semibold text-neutral-950">
                    {displayName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white active:translate-y-0 sm:px-5"
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="rounded-xl bg-neutral-950 px-3.5 py-2.5 text-sm font-medium !text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 sm:px-5"
              >
                {t.nav.login}
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile utility controls */}
        <div className="flex items-center justify-end border-t border-neutral-100 py-3 sm:hidden">
          <button
            type="button"
            onClick={handleLanguageToggle}
            title={languageTitle}
            aria-label={languageTitle}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950"
          >
            <LanguageIcon />

            <span className="text-[10px] font-bold tracking-wide">
              {language.toUpperCase()}
            </span>
          </button>
        </div>

        {/* Mobile navigation */}
        <nav className="flex gap-5 overflow-x-auto border-t border-neutral-100 py-3 md:hidden">
          <NavLink to="/" end className={getMobileNavLinkClass}>
            {t.nav.home}
          </NavLink>

          <NavLink to="/products" className={getMobileNavLinkClass}>
            {t.nav.products}
          </NavLink>

          <NavLink to="/about" className={getMobileNavLinkClass}>
            {t.nav.about}
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`
                }
              >
                {t.nav.cart}

                {totalItems > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {totalItems}
                  </span>
                )}
              </NavLink>

              <NavLink to="/profile" className={getMobileNavLinkClass}>
                {t.nav.account}
              </NavLink>

              {isAdmin && (
                <>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-neutral-950"
                          : "text-neutral-500 hover:text-neutral-950"
                      }`
                    }
                  >
                    {t.nav.admin}

                    {adminUnreadCount > 0 && (
                      <span className="inline-flex min-w-5 animate-pulse items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                        {adminUnreadCount > 99 ? "99+" : adminUnreadCount}
                      </span>
                    )}
                  </NavLink>

                  <NavLink
                    to="/admin/chat"
                    className={({ isActive }) =>
                      `flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-neutral-950"
                          : "text-neutral-500 hover:text-neutral-950"
                      }`
                    }
                  >
                    {t.nav.adminChat || "Chat"}
                  </NavLink>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
