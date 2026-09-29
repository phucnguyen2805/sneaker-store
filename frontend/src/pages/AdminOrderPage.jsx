import { useCallback, useEffect, useMemo, useState } from "react";
import { useThemeLanguage } from "../context/useThemeLanguage.js";
import CustomSelect from "../components/CustomSelect.jsx";
import api from "../services/api.js";

const STATUS_OPTIONS = [
  {
    value: "",
    vi: "Tất cả trạng thái",
    en: "All statuses",
  },
  {
    value: "PENDING",
    vi: "Chờ xác nhận",
    en: "Pending",
  },
  {
    value: "CONFIRMED",
    vi: "Đã xác nhận",
    en: "Confirmed",
  },
  {
    value: "COMPLETED",
    vi: "Hoàn thành",
    en: "Completed",
  },
  {
    value: "CANCELLED",
    vi: "Đã hủy",
    en: "Cancelled",
  },
];

const COPY = {
  vi: {
    eyebrow: "ADMIN ORDERS",
    title: "Quản lý đơn hàng",
    description:
      "Theo dõi đơn hàng và cập nhật trạng thái xử lý trong hệ thống.",

    orders: "Đơn hàng",
    items: "Sản phẩm",
    pending: "Chờ xác nhận",
    revenue: "Tổng tiền",

    orderFilter: "ORDER FILTER",
    filterOrders: "Lọc đơn hàng",
    viewing: "Đang xem",

    status: "Trạng thái",

    orderList: "ORDER LIST",
    orderListTitle: "Danh sách đơn hàng",
    orderCount: "đơn hàng",

    order: "Đơn hàng",
    user: "Người dùng",
    product: "Sản phẩm",
    total: "Tổng tiền",
    created: "Ngày đặt",
    update: "Cập nhật",

    productCount: "sản phẩm",
    updated: "Cập nhật",
    userPrefix: "User",

    size: "Size",
    color: "Màu",
    quantityShort: "SL",

    noOrdersEyebrow: "NO ORDERS",
    noOrdersTitle: "Không có đơn hàng phù hợp",
    noOrdersDescription: "Hãy thử thay đổi bộ lọc trạng thái.",

    updateStatus: "Cập nhật trạng thái",
    updating: "Đang cập nhật...",

    loadingError: "Không thể tải danh sách đơn hàng.",
    updateError: "Không thể cập nhật trạng thái đơn hàng.",
    updateSuccess: "Cập nhật trạng thái đơn hàng thành công.",

    unknownStatus: "Không xác định",

    refresh: "Làm mới",
  },

  en: {
    eyebrow: "ADMIN ORDERS",
    title: "Order Management",
    description:
      "Monitor orders and update their processing status across the system.",

    orders: "Orders",
    items: "Items",
    pending: "Pending",
    revenue: "Revenue",

    orderFilter: "ORDER FILTER",
    filterOrders: "Filter orders",
    viewing: "Viewing",

    status: "Status",

    orderList: "ORDER LIST",
    orderListTitle: "Order list",
    orderCount: "orders",

    order: "Order",
    user: "User",
    product: "Product",
    total: "Total",
    created: "Created",
    update: "Update",

    productCount: "items",
    updated: "Updated",
    userPrefix: "User",

    size: "Size",
    color: "Color",
    quantityShort: "Qty",

    noOrdersEyebrow: "NO ORDERS",
    noOrdersTitle: "No matching orders",
    noOrdersDescription: "Try changing the status filter.",

    updateStatus: "Update status",
    updating: "Updating...",

    loadingError: "Unable to load orders.",
    updateError: "Unable to update order status.",
    updateSuccess: "Order status updated successfully.",

    unknownStatus: "Unknown",

    refresh: "Refresh",
  },
};

function AdminOrderPage() {
  const { language } = useThemeLanguage();

  const t = COPY[language] || COPY.vi;

  const isEnglish = language === "en";

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchOrders = useCallback(async (status = "") => {
    const params = {};

    if (status) {
      params.status = status;
    }

    const response = await api.get("/admin/orders", {
      params,
    });

    return Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];
  }, []);

  const loadOrders = useCallback(
    async ({ showLoading = true, showRefreshing = false } = {}) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        if (showRefreshing) {
          setRefreshing(true);
        }

        setError("");

        const data = await fetchOrders(statusFilter);

        setOrders(data);
      } catch (err) {
        console.error("Không thể tải danh sách đơn hàng:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          t.loadingError;

        setError(message);
      } finally {
        if (showLoading) {
          setLoading(false);
        }

        if (showRefreshing) {
          setRefreshing(false);
        }
      }
    },
    [fetchOrders, statusFilter, t.loadingError],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchOrders(statusFilter);

        if (!cancelled) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Không thể tải danh sách đơn hàng:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          t.loadingError;

        if (!cancelled) {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchOrders, statusFilter, t.loadingError]);

  const formatPrice = (price) => {
    const value = Number(price || 0);

    return isEnglish
      ? `${value.toLocaleString("en-US")} ₫`
      : `${value.toLocaleString("vi-VN")} ₫`;
  };

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleString(isEnglish ? "en-US" : "vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const getStatusLabel = (status) => {
    const option = STATUS_OPTIONS.find((item) => item.value === status);

    return option?.[language] || status || t.unknownStatus;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "CONFIRMED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-neutral-200 bg-neutral-100 text-neutral-600";
    }
  };

  const getStatusDotClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500";

      case "CONFIRMED":
        return "bg-blue-500";

      case "COMPLETED":
        return "bg-emerald-500";

      case "CANCELLED":
        return "bg-red-500";

      default:
        return "bg-neutral-400";
    }
  };

  const handleStatusChange = async (orderId, nextStatus) => {
    if (!nextStatus) {
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingId(orderId);

    try {
      await api.put(`/orders/${orderId}/status`, {
        status: nextStatus,
      });

      setSuccess(`${t.updateSuccess} #${orderId}.`);

      const data = await fetchOrders(statusFilter);

      setOrders(data);
    } catch (err) {
      console.error("Không thể cập nhật trạng thái đơn hàng:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t.updateError;

      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const statistics = useMemo(() => {
    let itemCount = 0;
    let pendingCount = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      itemCount += (order.items || []).reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      );

      if (order.status === "PENDING") {
        pendingCount += 1;
      }

      totalRevenue += Number(order.totalAmount || 0);
    });

    return {
      orderCount: orders.length,
      itemCount,
      pendingCount,
      totalRevenue,
    };
  }, [orders]);

  const filteredStatusLabel =
    STATUS_OPTIONS.find((item) => item.value === statusFilter)?.[language] ||
    t.unknownStatus;

  const statusFilterOptions = STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: option[language],
  }));

  const statusUpdateOptions = STATUS_OPTIONS.filter(
    (option) => option.value,
  ).map((option) => ({
    value: option.value,
    label: option[language],
  }));

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

            <button
              type="button"
              onClick={() =>
                void loadOrders({
                  showLoading: false,
                  showRefreshing: true,
                })
              }
              disabled={refreshing}
              className="motion-soft inline-flex w-fit items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={`mr-2 inline-block h-3.5 w-3.5 rounded-full border-2 border-neutral-300 border-t-neutral-900 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              {refreshing ? t.updating : t.refresh}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {(error || success) && (
          <div className="mt-6 space-y-3">
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
          </div>
        )}

        {/* Statistics */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="motion-soft rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t.orders}
            </p>

            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                {statistics.orderCount}
              </p>

              <div className="h-1.5 w-12 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full w-full rounded-full bg-neutral-900" />
              </div>
            </div>
          </div>

          <div className="motion-soft rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t.items}
            </p>

            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                {statistics.itemCount}
              </p>

              <div className="h-1.5 w-12 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full w-9/12 rounded-full bg-neutral-700" />
              </div>
            </div>
          </div>

          <div className="motion-soft rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t.pending}
            </p>

            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                {statistics.pendingCount}
              </p>

              <div className="h-1.5 w-12 overflow-hidden rounded-full bg-amber-100">
                <div className="h-full w-7/12 rounded-full bg-amber-500" />
              </div>
            </div>
          </div>

          <div className="motion-soft rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t.revenue}
            </p>

            <p className="mt-3 truncate text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              {formatPrice(statistics.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-neutral-100 px-6 py-5 sm:px-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              {t.orderFilter}
            </p>

            <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-neutral-950">
                  {t.filterOrders}
                </h2>

                <p className="mt-2 text-xs text-neutral-400">
                  {t.viewing}:{" "}
                  <span className="font-medium text-neutral-600">
                    {filteredStatusLabel}
                  </span>
                </p>
              </div>

              <div className="w-full sm:w-72">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {t.status}
                </p>

                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusFilterOptions}
                  placeholder={
                    language === "en" ? "All statuses" : "Tất cả trạng thái"
                  }
                />
              </div>
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex gap-2 overflow-x-auto px-6 py-4 sm:px-7">
            {STATUS_OPTIONS.map((option) => {
              const active = statusFilter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`motion-soft whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold ${
                    active
                      ? "border-neutral-950 bg-neutral-950 text-white shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
                      : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-950"
                  }`}
                >
                  {option[language]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders */}
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {t.orderList}
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-neutral-950">
                  {t.orderListTitle}
                </h2>
              </div>

              <span className="w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                {orders.length} {t.orderCount}
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid gap-4 p-6 sm:p-7">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.25rem] border border-neutral-200 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row">
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-40 animate-pulse rounded bg-neutral-100" />

                      <div className="h-3 w-28 animate-pulse rounded bg-neutral-100" />

                      <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-100" />

                      <div className="h-4 w-3/5 animate-pulse rounded bg-neutral-100" />
                    </div>

                    <div className="space-y-3 lg:w-52">
                      <div className="h-9 w-full animate-pulse rounded-xl bg-neutral-100" />

                      <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-16 text-center sm:py-20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                {t.noOrdersEyebrow}
              </p>

              <h3 className="mt-3 text-xl font-semibold tracking-tight text-neutral-950">
                {t.noOrdersTitle}
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                {t.noOrdersDescription}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1160px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.order}
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.user}
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.product}
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.total}
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.status}
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.created}
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.update}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order, orderIndex) => {
                      const orderItemCount = (order.items || []).reduce(
                        (total, item) => total + Number(item.quantity || 0),
                        0,
                      );

                      return (
                        <tr
                          key={order.id}
                          className="group border-b border-neutral-100 last:border-b-0 transition-all duration-300 hover:bg-neutral-50/80"
                          style={{
                            animation: "pageFadeIn 0.45s ease both",
                            animationDelay: `${orderIndex * 45}ms`,
                          }}
                        >
                          {/* Order */}
                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-neutral-950">
                              #{order.id}
                            </p>

                            <p className="mt-1 text-[11px] text-neutral-400">
                              {orderItemCount} {t.productCount}
                            </p>

                            <p className="mt-1 text-[10px] text-neutral-400">
                              {t.updated.toLowerCase()}{" "}
                              {formatDate(order.updatedAt)}
                            </p>
                          </td>

                          {/* User */}
                          <td className="px-5 py-5 align-top">
                            <div className="inline-flex rounded-xl bg-neutral-50 px-3 py-2 transition-colors duration-200 group-hover:bg-white">
                              <span className="text-xs font-medium text-neutral-700">
                                {t.userPrefix} #{order.userId}
                              </span>
                            </div>
                          </td>

                          {/* Products */}
                          <td className="px-5 py-5 align-top">
                            <div className="max-w-md space-y-3">
                              {order.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 transition-all duration-200 hover:border-neutral-200 hover:bg-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] group-hover:border-neutral-200"
                                >
                                  <p className="text-xs font-semibold text-neutral-900">
                                    {item.productName}
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-neutral-500">
                                    <span className="rounded-full bg-white px-2.5 py-1">
                                      {t.size} {item.sizeName}
                                    </span>

                                    <span className="rounded-full bg-white px-2.5 py-1">
                                      {t.color} {item.colorName}
                                    </span>

                                    <span className="rounded-full bg-white px-2.5 py-1">
                                      {t.quantityShort} {item.quantity}
                                    </span>
                                  </div>

                                  <p className="mt-2 text-xs font-semibold text-neutral-950">
                                    {formatPrice(item.subtotal)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-5 py-5 text-right align-top">
                            <p className="text-sm font-semibold text-neutral-950">
                              {formatPrice(order.totalAmount)}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-5 align-top">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                                order.status,
                              )}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(
                                  order.status,
                                )}`}
                              />

                              {getStatusLabel(order.status)}
                            </span>
                          </td>

                          {/* Created */}
                          <td className="px-5 py-5 align-top text-xs leading-5 text-neutral-600">
                            {formatDate(order.createdAt)}
                          </td>

                          {/* Update */}
                          <td className="px-5 py-5 align-top">
                            <div className="w-48">
                              <CustomSelect
                                value={order.status}
                                onChange={(value) =>
                                  handleStatusChange(order.id, value)
                                }
                                options={statusUpdateOptions}
                                disabled={updatingId === order.id}
                              />
                            </div>

                            {updatingId === order.id && (
                              <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-400">
                                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />

                                <span>{t.updating}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="grid gap-4 p-5 lg:hidden">
                {orders.map((order, orderIndex) => {
                  const orderItemCount = (order.items || []).reduce(
                    (total, item) => total + Number(item.quantity || 0),
                    0,
                  );

                  return (
                    <article
                      key={order.id}
                      className="motion-soft overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-white hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
                      style={{
                        animation: "pageFadeIn 0.45s ease both",
                        animationDelay: `${orderIndex * 55}ms`,
                      }}
                    >
                      {/* Summary */}
                      <div className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
                                {t.order} #{order.id}
                              </h3>

                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                                  order.status,
                                )}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(
                                    order.status,
                                  )}`}
                                />

                                {getStatusLabel(order.status)}
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-neutral-400">
                              {t.userPrefix} #{order.userId}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                              {t.total}
                            </p>

                            <p className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                              {formatPrice(order.totalAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          <div className="rounded-xl bg-neutral-50 p-3 transition-colors duration-200 hover:bg-neutral-100">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              {t.product}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-neutral-950">
                              {orderItemCount}
                            </p>
                          </div>

                          <div className="rounded-xl bg-neutral-50 p-3 transition-colors duration-200 hover:bg-neutral-100">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              {t.created}
                            </p>

                            <p className="mt-1 truncate text-xs font-medium text-neutral-700">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div className="col-span-2 rounded-xl bg-neutral-50 p-3 transition-colors duration-200 hover:bg-neutral-100 sm:col-span-1">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              {t.updated}
                            </p>

                            <p className="mt-1 truncate text-xs font-medium text-neutral-700">
                              {formatDate(order.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="border-t border-neutral-100 px-5">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="border-b border-neutral-100 py-4 last:border-b-0"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-neutral-900">
                                  {item.productName}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600">
                                    {t.size} {item.sizeName}
                                  </span>

                                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600">
                                    {item.colorName}
                                  </span>

                                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600">
                                    {t.quantityShort} {item.quantity}
                                  </span>
                                </div>
                              </div>

                              <p className="shrink-0 text-sm font-semibold text-neutral-950">
                                {formatPrice(item.subtotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Update */}
                      <div className="border-t border-neutral-100 bg-neutral-50/70 p-4">
                        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                          {t.updateStatus}
                        </p>

                        <CustomSelect
                          value={order.status}
                          onChange={(value) =>
                            handleStatusChange(order.id, value)
                          }
                          options={statusUpdateOptions}
                          disabled={updatingId === order.id}
                        />

                        {updatingId === order.id && (
                          <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-400">
                            <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />

                            <span>{t.updating}</span>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminOrderPage;
