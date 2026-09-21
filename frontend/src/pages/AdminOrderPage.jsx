import { useEffect, useState } from "react";

import api from "../services/api.js";

const STATUS_OPTIONS = [
  {
    value: "",
    label: "Tất cả trạng thái",
  },
  {
    value: "PENDING",
    label: "Chờ xác nhận",
  },
  {
    value: "CONFIRMED",
    label: "Đã xác nhận",
  },
  {
    value: "COMPLETED",
    label: "Hoàn thành",
  },
  {
    value: "CANCELLED",
    label: "Đã hủy",
  },
];

function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrders = async (status = statusFilter) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (status) {
        params.status = status;
      }

      const response = await api.get("/admin/orders", {
        params,
      });

      setOrders(
        Array.isArray(response.data)
          ? response.data
          : response.data?.content || [],
      );
    } catch (err) {
      console.error("Không thể tải danh sách đơn hàng:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể tải danh sách đơn hàng.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(statusFilter);
  }, [statusFilter]);

  const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString("vi-VN")} ₫`;
  };

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleString("vi-VN");
  };

  const getStatusLabel = (status) => {
    const option = STATUS_OPTIONS.find((item) => item.value === status);

    return option?.label || status || "Không xác định";
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

      setSuccess(`Cập nhật trạng thái đơn hàng #${orderId} thành công.`);

      await loadOrders(statusFilter);
    } catch (err) {
      console.error("Không thể cập nhật trạng thái đơn hàng:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể cập nhật trạng thái đơn hàng.";

      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalProducts = orders.reduce((total, order) => {
    return (
      total +
      (order.items || []).reduce(
        (itemTotal, item) => itemTotal + Number(item.quantity || 0),
        0,
      )
    );
  }, 0);

  const filteredStatusLabel =
    STATUS_OPTIONS.find((item) => item.value === statusFilter)?.label ||
    "Tất cả trạng thái";

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                Admin Orders
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                Quản lý đơn hàng
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                Theo dõi đơn hàng và cập nhật trạng thái xử lý trong hệ thống.
              </p>
            </div>

            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <div className="px-4 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Orders
                </p>

                <p className="mt-1 text-lg font-semibold text-neutral-950">
                  {orders.length}
                </p>
              </div>

              <div className="border-l border-neutral-100 px-4 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Items
                </p>

                <p className="mt-1 text-lg font-semibold text-neutral-950">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {(error || success) && (
          <div className="mt-6 space-y-3">
            {error && (
              <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm font-medium leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-5 py-4">
                <p className="text-sm font-medium leading-6 text-emerald-700">
                  {success}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filter */}
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-neutral-100 px-6 py-5 sm:px-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Order Filter
            </p>

            <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                  Lọc đơn hàng
                </h2>

                <p className="mt-2 text-xs text-neutral-400">
                  Đang xem: {filteredStatusLabel}
                </p>
              </div>

              <div className="w-full sm:w-72">
                <label
                  htmlFor="statusFilter"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                >
                  Trạng thái
                </label>

                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-950"
                  }`}
                >
                  {option.label}
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
                  Order List
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  Danh sách đơn hàng
                </h2>
              </div>

              <span className="w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                {orders.length} đơn hàng
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
            /* Empty */
            <div className="px-6 py-16 text-center sm:py-20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                No Orders
              </p>

              <h3 className="mt-3 text-xl font-semibold tracking-tight text-neutral-950">
                Không có đơn hàng phù hợp
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Hãy thử thay đổi bộ lọc trạng thái.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1120px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Đơn hàng
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Người dùng
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Sản phẩm
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Tổng tiền
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Trạng thái
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Ngày đặt
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Cập nhật
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => {
                      const orderItemCount = (order.items || []).reduce(
                        (total, item) => total + Number(item.quantity || 0),
                        0,
                      );

                      return (
                        <tr
                          key={order.id}
                          className="group border-b border-neutral-100 last:border-b-0 transition-colors duration-200 hover:bg-neutral-50/70"
                        >
                          {/* Order */}
                          <td className="px-5 py-5 align-top">
                            <p className="text-sm font-semibold text-neutral-950">
                              #{order.id}
                            </p>

                            <p className="mt-1 text-[11px] text-neutral-400">
                              {orderItemCount} sản phẩm
                            </p>

                            <p className="mt-1 text-[10px] text-neutral-400">
                              Cập nhật {formatDate(order.updatedAt)}
                            </p>
                          </td>

                          {/* User */}
                          <td className="px-5 py-5 align-top">
                            <div className="inline-flex rounded-xl bg-neutral-50 px-3 py-2">
                              <span className="text-xs font-medium text-neutral-700">
                                User #{order.userId}
                              </span>
                            </div>
                          </td>

                          {/* Products */}
                          <td className="px-5 py-5 align-top">
                            <div className="max-w-md space-y-3">
                              {order.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 transition-colors duration-200 group-hover:border-neutral-200"
                                >
                                  <p className="text-xs font-semibold text-neutral-900">
                                    {item.productName}
                                  </p>

                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                                    <span>Size {item.sizeName}</span>

                                    <span>Màu {item.colorName}</span>

                                    <span>SL {item.quantity}</span>
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
                            <select
                              value={order.status}
                              disabled={updatingId === order.id}
                              onChange={(event) =>
                                handleStatusChange(order.id, event.target.value)
                              }
                              className="w-48 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs font-medium text-neutral-800 transition-all duration-200 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="PENDING">Chờ xác nhận</option>

                              <option value="CONFIRMED">Đã xác nhận</option>

                              <option value="COMPLETED">Hoàn thành</option>

                              <option value="CANCELLED">Đã hủy</option>
                            </select>

                            {updatingId === order.id && (
                              <p className="mt-2 text-[10px] text-neutral-400">
                                Đang cập nhật...
                              </p>
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
                {orders.map((order) => {
                  const orderItemCount = (order.items || []).reduce(
                    (total, item) => total + Number(item.quantity || 0),
                    0,
                  );

                  return (
                    <article
                      key={order.id}
                      className="overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
                    >
                      {/* Order summary */}
                      <div className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
                                Đơn hàng #{order.id}
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
                              User #{order.userId}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                              Tổng tiền
                            </p>

                            <p className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                              {formatPrice(order.totalAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              Sản phẩm
                            </p>

                            <p className="mt-1 text-sm font-semibold text-neutral-950">
                              {orderItemCount}
                            </p>
                          </div>

                          <div className="rounded-xl bg-neutral-50 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              Ngày đặt
                            </p>

                            <p className="mt-1 truncate text-xs font-medium text-neutral-700">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div className="col-span-2 rounded-xl bg-neutral-50 p-3 sm:col-span-1">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                              Cập nhật
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
                                    Size {item.sizeName}
                                  </span>

                                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600">
                                    {item.colorName}
                                  </span>

                                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600">
                                    SL {item.quantity}
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
                        <label
                          htmlFor={`mobile-status-${order.id}`}
                          className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400"
                        >
                          Cập nhật trạng thái
                        </label>

                        <select
                          id={`mobile-status-${order.id}`}
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(event) =>
                            handleStatusChange(order.id, event.target.value)
                          }
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition-all duration-200 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="PENDING">Chờ xác nhận</option>

                          <option value="CONFIRMED">Đã xác nhận</option>

                          <option value="COMPLETED">Hoàn thành</option>

                          <option value="CANCELLED">Đã hủy</option>
                        </select>

                        {updatingId === order.id && (
                          <p className="mt-2 text-[10px] text-neutral-400">
                            Đang cập nhật...
                          </p>
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
