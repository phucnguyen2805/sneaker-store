import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import {
  getAdminUsers,
  updateAdminUserStatus,
} from "../services/adminUserService.js";

const PAGE_SIZE = 10;

const COPY = {
  vi: {
    eyebrow: "ADMIN USERS",
    title: "Quản lý người dùng",
    description:
      "Theo dõi tài khoản, vai trò và trạng thái hoạt động của người dùng trong hệ thống.",

    totalUsers: "Tổng người dùng",
    activeUsers: "Đang hoạt động",
    lockedUsers: "Đã khóa",
    admins: "Quản trị viên",

    searchSection: "USER SEARCH",
    searchTitle: "Tìm kiếm tài khoản",
    searchLabel: "Tìm kiếm",
    searchPlaceholder: "Tìm theo họ tên hoặc email...",
    search: "Tìm kiếm",
    reset: "Đặt lại",
    searching: "Đang tìm:",

    listSection: "USER LIST",
    listTitle: "Danh sách tài khoản",
    pageShowing: "Trang hiện tại đang hiển thị",
    accounts: "tài khoản",

    id: "ID",
    user: "Người dùng",
    role: "Vai trò",
    status: "Trạng thái",
    created: "Ngày tạo",
    action: "Thao tác",

    currentUser: "Bạn",

    admin: "Quản trị viên",
    customer: "Khách hàng",

    active: "Đang hoạt động",
    locked: "Đã khóa",

    lock: "Khóa tài khoản",
    unlock: "Mở khóa",
    processing: "Đang xử lý...",

    loading: "Đang tải người dùng...",
    emptyTitle: "Không tìm thấy người dùng.",
    emptyDescription: "Thử thay đổi từ khóa tìm kiếm.",

    createdAt: "Tạo lúc",
    pagination: "Trang",
    previous: "Trước",
    next: "Sau",
    totalSuffix: "người dùng",

    confirmEyebrow: "XÁC NHẬN THAO TÁC",
    lockTitle: "Khóa tài khoản",
    unlockTitle: "Mở khóa tài khoản",
    lockDescription: (name) =>
      `Bạn có chắc muốn khóa tài khoản "${name}"? Tài khoản này sẽ không thể đăng nhập cho đến khi được mở khóa.`,
    unlockDescription: (name) =>
      `Bạn có chắc muốn mở khóa tài khoản "${name}"? Tài khoản này sẽ có thể đăng nhập lại vào hệ thống.`,
    cancel: "Hủy",

    cannotLockSelf: "Bạn không thể tự khóa tài khoản đang đăng nhập.",

    loadError: "Không thể tải danh sách người dùng.",
    updateError: "Không thể cập nhật trạng thái tài khoản.",

    lockSuccess: (name) => `Đã khóa tài khoản "${name}".`,
    unlockSuccess: (name) => `Đã mở khóa tài khoản "${name}".`,
  },

  en: {
    eyebrow: "ADMIN USERS",
    title: "User Management",
    description:
      "Monitor accounts, roles, and activity status across the system.",

    totalUsers: "Total users",
    activeUsers: "Active users",
    lockedUsers: "Locked users",
    admins: "Administrators",

    searchSection: "USER SEARCH",
    searchTitle: "Search accounts",
    searchLabel: "Search",
    searchPlaceholder: "Search by name or email...",
    search: "Search",
    reset: "Reset",
    searching: "Searching:",

    listSection: "USER LIST",
    listTitle: "Account list",
    pageShowing: "Current page shows",
    accounts: "accounts",

    id: "ID",
    user: "User",
    role: "Role",
    status: "Status",
    created: "Created",
    action: "Action",

    currentUser: "You",

    admin: "Administrator",
    customer: "Customer",

    active: "Active",
    locked: "Locked",

    lock: "Lock account",
    unlock: "Unlock",
    processing: "Processing...",

    loading: "Loading users...",
    emptyTitle: "No users found.",
    emptyDescription: "Try changing your search keyword.",

    createdAt: "Created at",
    pagination: "Page",
    previous: "Previous",
    next: "Next",
    totalSuffix: "users",

    confirmEyebrow: "CONFIRM ACTION",
    lockTitle: "Lock account",
    unlockTitle: "Unlock account",
    lockDescription: (name) =>
      `Are you sure you want to lock "${name}"? This account will not be able to log in until it is unlocked.`,
    unlockDescription: (name) =>
      `Are you sure you want to unlock "${name}"? This account will be able to log in to the system again.`,
    cancel: "Cancel",

    cannotLockSelf: "You cannot lock the account currently signed in.",

    loadError: "Unable to load users.",
    updateError: "Unable to update account status.",

    lockSuccess: (name) => `Account "${name}" has been locked.`,
    unlockSuccess: (name) => `Account "${name}" has been unlocked.`,
  },
};

const formatDate = (value, language) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function AdminUserPage() {
  const { language } = useThemeLanguage();

  const t = COPY[language] || COPY.vi;

  const currentUser = useSelector((state) => state.auth.user);

  const [users, setUsers] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmUser, setConfirmUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminUsers({
          search,
          page,
          size: PAGE_SIZE,
        });

        if (cancelled) {
          return;
        }

        setUsers(Array.isArray(data?.content) ? data.content : []);
        setTotalPages(Number(data?.totalPages || 0));
        setTotalElements(Number(data?.totalElements || 0));
      } catch (err) {
        console.error("Không thể tải danh sách người dùng:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          t.loadError;

        if (!cancelled) {
          setError(message);
          setUsers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [search, page, t.loadError]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setConfirmUser(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(0);
    setSuccess("");
    setError("");
    setSearch(searchInput.trim());
  };

  const handleResetSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(0);
    setError("");
    setSuccess("");
  };

  const handleToggleStatus = (user) => {
    const isCurrentUser =
      currentUser?.email &&
      user?.email &&
      currentUser.email.toLowerCase() === user.email.toLowerCase();

    if (isCurrentUser && user.enabled) {
      setError(t.cannotLockSelf);
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setConfirmUser(user);
  };

  const handleCloseConfirm = () => {
    if (processingUserId === confirmUser?.id) {
      return;
    }

    setConfirmUser(null);
  };

  const handleConfirmOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleCloseConfirm();
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!confirmUser) {
      return;
    }

    const user = confirmUser;
    const nextEnabled = !user.enabled;

    try {
      setProcessingUserId(user.id);
      setError("");
      setSuccess("");

      const updatedUser = await updateAdminUserStatus(user.id, nextEnabled);

      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === user.id ? updatedUser : item)),
      );

      setConfirmUser(null);

      setSuccess(
        nextEnabled
          ? t.unlockSuccess(user.fullName)
          : t.lockSuccess(user.fullName),
      );
    } catch (err) {
      console.error("Không thể cập nhật trạng thái người dùng:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t.updateError;

      setError(message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const goToPage = (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages) {
      return;
    }

    setPage(nextPage);
    setError("");
    setSuccess("");
  };

  const statistics = useMemo(() => {
    const activeUsers = users.filter((user) => user.enabled).length;

    const lockedUsers = users.filter((user) => !user.enabled).length;

    const admins = users.filter((user) => user.role === "ADMIN").length;

    return {
      activeUsers,
      lockedUsers,
      admins,
    };
  }, [users]);

  const currentPageText =
    totalPages === 0 ? "0 / 0" : `${page + 1} / ${totalPages}`;

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-28">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-neutral-400">
                {t.eyebrow}
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-5xl">
                {t.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                {t.description}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-neutral-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {t.totalUsers}
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
                {totalElements}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="motion-soft rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t.totalUsers}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
              {totalElements}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full w-full rounded-full bg-neutral-900" />
            </div>
          </div>

          <div className="motion-soft rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t.activeUsers}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
              {statistics.activeUsers}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width:
                    totalElements > 0
                      ? `${Math.min(
                          (statistics.activeUsers / totalElements) * 100,
                          100,
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div className="motion-soft rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t.lockedUsers}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
              {statistics.lockedUsers}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-red-100">
              <div
                className="h-full rounded-full bg-red-500"
                style={{
                  width:
                    totalElements > 0
                      ? `${Math.min(
                          (statistics.lockedUsers / totalElements) * 100,
                          100,
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div className="motion-soft rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t.admins}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
              {statistics.admins}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-neutral-700"
                style={{
                  width:
                    totalElements > 0
                      ? `${Math.min(
                          (statistics.admins / totalElements) * 100,
                          100,
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Search */}
        <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-neutral-100 px-6 py-5 sm:px-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              {t.searchSection}
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-neutral-950">
              {t.searchTitle}
            </h2>
          </div>

          <div className="p-5 sm:p-6">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-3 lg:flex-row"
            >
              <div className="flex-1">
                <label
                  htmlFor="user-search"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                >
                  {t.searchLabel}
                </label>

                <input
                  id="user-search"
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="motion-soft rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
                >
                  {t.search}
                </button>

                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="motion-soft rounded-xl border border-neutral-200 bg-white px-5 py-3.5 text-sm font-semibold text-neutral-700 hover:-translate-y-0.5 hover:border-neutral-950 hover:text-neutral-950 active:translate-y-0"
                >
                  {t.reset}
                </button>
              </div>
            </form>

            {search && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>{t.searching}</span>

                <span className="rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-700">
                  {search}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Messages */}
        {(error || success) && (
          <section className="mt-6 space-y-3">
            {error && (
              <div className="motion-soft rounded-[1.25rem] border border-red-200 bg-red-50 px-5 py-4 shadow-[0_8px_25px_rgba(220,38,38,0.05)]">
                <p className="text-sm font-medium leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="motion-soft rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-[0_8px_25px_rgba(16,185,129,0.05)]">
                <p className="text-sm font-medium leading-6 text-emerald-700">
                  {success}
                </p>
              </div>
            )}
          </section>
        )}

        {/* User List */}
        <section className="mt-8 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {t.listSection}
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-neutral-950">
                  {t.listTitle}
                </h2>

                <p className="mt-2 text-xs text-neutral-400">
                  {t.pageShowing}{" "}
                  <span className="font-medium text-neutral-600">
                    {users.length}
                  </span>{" "}
                  {t.accounts}.
                </p>
              </div>

              <span className="w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                {currentPageText}
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid gap-4 p-6 sm:p-7">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.25rem] border border-neutral-200 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    <div className="h-4 w-12 animate-pulse rounded bg-neutral-100" />

                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-48 animate-pulse rounded bg-neutral-100" />
                      <div className="h-3 w-64 animate-pulse rounded bg-neutral-100" />
                    </div>

                    <div className="h-8 w-28 animate-pulse rounded-full bg-neutral-100" />

                    <div className="h-9 w-32 animate-pulse rounded-xl bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            /* Empty */
            <div className="px-6 py-16 text-center sm:py-20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                NO USERS
              </p>

              <p className="mt-3 text-xl font-semibold tracking-tight text-neutral-950">
                {t.emptyTitle}
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                {t.emptyDescription}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[980px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.id}
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.user}
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.role}
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.status}
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.created}
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.action}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user, index) => {
                      const isCurrentUser =
                        currentUser?.email &&
                        user?.email &&
                        currentUser.email.toLowerCase() ===
                          user.email.toLowerCase();

                      const isProcessing = processingUserId === user.id;

                      return (
                        <tr
                          key={user.id}
                          className="group border-b border-neutral-100 last:border-b-0 transition-colors duration-300 hover:bg-neutral-50/80"
                          style={{
                            animation: "pageFadeIn 0.45s ease both",
                            animationDelay: `${index * 45}ms`,
                          }}
                        >
                          <td className="px-6 py-5 align-top text-sm font-medium text-neutral-400">
                            #{user.id}
                          </td>

                          <td className="px-6 py-5 align-top">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-neutral-950">
                                  {user.fullName}
                                </p>

                                {isCurrentUser && (
                                  <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-[9px] font-semibold text-white">
                                    {t.currentUser}
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-neutral-400">
                                {user.email}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5 align-top">
                            <span
                              className={
                                user.role === "ADMIN"
                                  ? "inline-flex rounded-full bg-neutral-950 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white"
                                  : "inline-flex rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-600"
                              }
                            >
                              {user.role === "ADMIN" ? t.admin : t.customer}
                            </span>
                          </td>

                          <td className="px-6 py-5 align-top">
                            <span
                              className={
                                user.enabled
                                  ? "inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[10px] font-semibold text-neutral-700"
                                  : "inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-semibold text-red-700"
                              }
                            >
                              <span
                                className={
                                  user.enabled
                                    ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                    : "h-1.5 w-1.5 rounded-full bg-red-500"
                                }
                              />

                              {user.enabled ? t.active : t.locked}
                            </span>
                          </td>

                          <td className="px-6 py-5 align-top text-sm text-neutral-500">
                            {formatDate(user.createdAt, language)}
                          </td>

                          <td className="px-6 py-5 text-right align-top">
                            <button
                              type="button"
                              disabled={isProcessing || isCurrentUser}
                              onClick={() => handleToggleStatus(user)}
                              className={
                                user.enabled
                                  ? "motion-soft rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  : "motion-soft rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              }
                            >
                              {isProcessing
                                ? t.processing
                                : user.enabled
                                  ? t.lock
                                  : t.unlock}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet */}
              <div className="grid gap-4 p-5 lg:hidden">
                {users.map((user, index) => {
                  const isCurrentUser =
                    currentUser?.email &&
                    user?.email &&
                    currentUser.email.toLowerCase() ===
                      user.email.toLowerCase();

                  const isProcessing = processingUserId === user.id;

                  return (
                    <article
                      key={user.id}
                      className="motion-soft overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-white hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
                      style={{
                        animation: "pageFadeIn 0.45s ease both",
                        animationDelay: `${index * 55}ms`,
                      }}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-neutral-950">
                                {user.fullName}
                              </p>

                              {isCurrentUser && (
                                <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-[9px] font-semibold text-white">
                                  {t.currentUser}
                                </span>
                              )}
                            </div>

                            <p className="mt-1 break-all text-sm text-neutral-400">
                              {user.email}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs font-medium text-neutral-400">
                            #{user.id}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              {t.role}
                            </p>

                            <span
                              className={
                                user.role === "ADMIN"
                                  ? "mt-2 inline-flex rounded-full bg-neutral-950 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white"
                                  : "mt-2 inline-flex rounded-full bg-neutral-100 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-600"
                              }
                            >
                              {user.role === "ADMIN" ? t.admin : t.customer}
                            </span>
                          </div>

                          <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              {t.status}
                            </p>

                            <span
                              className={
                                user.enabled
                                  ? "mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[9px] font-semibold text-neutral-700"
                                  : "mt-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[9px] font-semibold text-red-700"
                              }
                            >
                              <span
                                className={
                                  user.enabled
                                    ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                    : "h-1.5 w-1.5 rounded-full bg-red-500"
                                }
                              />

                              {user.enabled ? t.active : t.locked}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-neutral-100 pt-4">
                          <p className="text-xs text-neutral-400">
                            {t.createdAt}:{" "}
                            <span className="text-neutral-600">
                              {formatDate(user.createdAt, language)}
                            </span>
                          </p>

                          <button
                            type="button"
                            disabled={isProcessing || isCurrentUser}
                            onClick={() => handleToggleStatus(user)}
                            className={
                              user.enabled
                                ? "motion-soft mt-4 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                : "motion-soft mt-4 w-full rounded-xl bg-neutral-950 px-4 py-3 text-xs font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                            }
                          >
                            {isProcessing
                              ? t.processing
                              : user.enabled
                                ? t.lock
                                : t.unlock}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && totalPages > 0 && (
            <div className="flex flex-col gap-4 border-t border-neutral-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-neutral-400">
                {t.pagination} {page + 1} / {totalPages} · {totalElements}{" "}
                {t.totalSuffix}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => goToPage(page - 1)}
                  className="motion-soft rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.previous}
                </button>

                <div className="rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
                  {page + 1}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => goToPage(page + 1)}
                  className="motion-soft rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.next}
                </button>
              </div>
            </div>
          )}
        </section>
      </section>

      {/* Confirmation Modal */}
      {confirmUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/45 px-4 backdrop-blur-sm"
          onMouseDown={handleConfirmOverlayClick}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="px-6 py-7 sm:px-7 sm:py-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                {t.confirmEyebrow}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
                {confirmUser.enabled ? t.lockTitle : t.unlockTitle}
              </h2>

              <p className="mt-4 text-sm leading-7 text-neutral-500">
                {confirmUser.enabled
                  ? t.lockDescription(confirmUser.fullName)
                  : t.unlockDescription(confirmUser.fullName)}
              </p>

              <div className="mt-7 rounded-xl bg-neutral-50 px-4 py-3">
                <p className="text-xs font-medium text-neutral-500">
                  {confirmUser.fullName}
                </p>

                <p className="mt-1 break-all text-xs text-neutral-400">
                  {confirmUser.email}
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseConfirm}
                  disabled={processingUserId === confirmUser.id}
                  className="motion-soft rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.cancel}
                </button>

                <button
                  type="button"
                  onClick={handleConfirmToggleStatus}
                  disabled={processingUserId === confirmUser.id}
                  className={
                    confirmUser.enabled
                      ? "motion-soft rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      : "motion-soft rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  }
                >
                  {processingUserId === confirmUser.id
                    ? t.processing
                    : confirmUser.enabled
                      ? t.lock
                      : t.unlock}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserPage;
