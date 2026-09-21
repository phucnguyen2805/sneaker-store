import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { fetchMyOrders } from "../store/orderSlice.js";

function OrderHistoryPage() {
  const dispatch = useDispatch();

  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN");
  };

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleString("vi-VN");
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";

      case "CONFIRMED":
        return "Đã xác nhận";

      case "COMPLETED":
        return "Hoàn thành";

      case "CANCELLED":
        return "Đã hủy";

      default:
        return status;
    }
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

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          My Orders
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-neutral-950">
          Đơn hàng của tôi
        </h1>

        <p className="mt-3 text-base text-neutral-500">
          Theo dõi các đơn hàng bạn đã đặt tại Sneaker Store.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-neutral-500">
            Đang tải lịch sử đơn hàng...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-950">
            Bạn chưa có đơn hàng
          </h2>

          <p className="mt-3 text-sm text-neutral-500">
            Hãy khám phá các mẫu sneaker và đặt đơn hàng đầu tiên.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            Xem sản phẩm
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-neutral-950">
                      Đơn hàng #{order.id}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-neutral-500">
                    Đặt lúc: {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-neutral-500">Tổng tiền</p>

                  <p className="mt-1 text-xl font-bold text-neutral-950">
                    {formatPrice(order.totalAmount)} ₫
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-neutral-200" />

              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                      <span className="text-[11px] text-neutral-400">
                        Sneaker
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {item.productName}
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Size {item.sizeName} · {item.colorName}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        SL: {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-neutral-900">
                      {formatPrice(item.subtotal)} ₫
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Link
                  to={`/orders/${order.id}`}
                  className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-colors duration-200 hover:bg-neutral-50"
                >
                  Xem chi tiết
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrderHistoryPage;
