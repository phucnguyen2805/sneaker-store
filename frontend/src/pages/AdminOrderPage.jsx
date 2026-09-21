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

      setOrders(response.data);
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

    return option?.label || status;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700";

      case "CONFIRMED":
        return "bg-blue-50 text-blue-700";

      case "COMPLETED":
        return "bg-green-50 text-green-700";

      case "CANCELLED":
        return "bg-red-50 text-red-700";

      default:
        return "bg-neutral-100 text-neutral-600";
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

  return (
    <section className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Admin Orders
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-950">
            Quản lý đơn hàng
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-500">
            Theo dõi đơn hàng và cập nhật trạng thái xử lý.
          </p>
        </div>

        {(error || success) && (
          <div className="mb-6 space-y-3">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
                <p className="text-sm font-medium text-green-700">{success}</p>
              </div>
            )}
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Order Filter
              </p>

              <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                Lọc theo trạng thái
              </h2>
            </div>

            <div className="w-full sm:w-64">
              <label
                htmlFor="statusFilter"
                className="mb-2 block text-sm font-semibold text-neutral-700"
              >
                Trạng thái
              </label>

              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
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

        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-neutral-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Order List</p>

              <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                Danh sách đơn hàng
              </h2>
            </div>

            <p className="text-sm text-neutral-500">{orders.length} đơn hàng</p>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-neutral-500">
                Đang tải danh sách đơn hàng...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-neutral-500">
                Không có đơn hàng phù hợp.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      User
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      Sản phẩm
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      Tổng tiền
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      Trạng thái
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      Ngày đặt
                    </th>

                    <th className="px-5 py-4 text-right text-sm font-semibold text-neutral-500">
                      Cập nhật
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-100 last:border-b-0"
                    >
                      <td className="px-5 py-5 align-top">
                        <p className="font-semibold text-neutral-950">
                          #{order.id}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          Cập nhật: {formatDate(order.updatedAt)}
                        </p>
                      </td>

                      <td className="px-5 py-5 align-top text-sm text-neutral-700">
                        User #{order.userId}
                      </td>

                      <td className="px-5 py-5 align-top">
                        <div className="max-w-sm space-y-2">
                          {order.items?.map((item) => (
                            <div key={item.id}>
                              <p className="text-sm font-semibold text-neutral-900">
                                {item.productName}
                              </p>

                              <p className="text-xs text-neutral-500">
                                Size {item.sizeName} · {item.colorName} · SL{" "}
                                {item.quantity}
                              </p>

                              <p className="text-xs text-neutral-400">
                                {formatPrice(item.subtotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-5 align-top text-sm font-bold text-neutral-950">
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td className="px-5 py-5 align-top">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>

                      <td className="px-5 py-5 align-top text-sm text-neutral-600">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-5 py-5 align-top">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(event) =>
                            handleStatusChange(order.id, event.target.value)
                          }
                          className="w-44 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="PENDING">Chờ xác nhận</option>

                          <option value="CONFIRMED">Đã xác nhận</option>

                          <option value="COMPLETED">Hoàn thành</option>

                          <option value="CANCELLED">Đã hủy</option>
                        </select>

                        {updatingId === order.id && (
                          <p className="mt-2 text-xs text-neutral-400">
                            Đang cập nhật...
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminOrderPage;
