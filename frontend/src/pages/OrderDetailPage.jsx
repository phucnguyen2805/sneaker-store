import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchMyOrderById } from "../store/orderSlice.js";

function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentOrder, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    if (id) {
      dispatch(fetchMyOrderById(id));
    }
  }, [dispatch, id]);

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

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-neutral-500">
            Đang tải chi tiết đơn hàng...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700">
            Không thể tải đơn hàng
          </h1>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <Link
            to="/orders"
            className="mt-5 inline-block rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            Quay lại đơn hàng
          </Link>
        </div>
      </section>
    );
  }

  if (!currentOrder) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-950">
            Không tìm thấy đơn hàng
          </h1>

          <Link
            to="/orders"
            className="mt-5 inline-block rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Quay lại đơn hàng
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <Link
          to="/orders"
          className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-950"
        >
          ← Quay lại đơn hàng
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Order Detail
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-neutral-950">
            Đơn hàng #{currentOrder.id}
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Đặt lúc: {formatDate(currentOrder.createdAt)}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
            currentOrder.status,
          )}`}
        >
          {getStatusLabel(currentOrder.status)}
        </span>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">Sản phẩm</h2>

          <div className="mt-6 divide-y divide-neutral-200">
            {currentOrder.items?.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                  <span className="text-xs text-neutral-400">Sneaker</span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-neutral-950">
                    {item.productName}
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Size {item.sizeName} · {item.colorName}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    Đơn giá: {formatPrice(item.unitPrice)} ₫
                  </p>
                </div>

                <div className="flex items-center justify-between gap-6 sm:block sm:text-right">
                  <p className="text-sm text-neutral-500">
                    Số lượng: {item.quantity}
                  </p>

                  <p className="mt-1 text-base font-semibold text-neutral-950">
                    {formatPrice(item.subtotal)} ₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Tổng số sản phẩm</span>

            <span className="text-sm font-semibold text-neutral-900">
              {currentOrder.items?.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0,
              )}
            </span>
          </div>

          <div className="my-5 h-px bg-neutral-200" />

          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-neutral-500">Tổng thanh toán</p>

              <p className="mt-1 text-2xl font-bold text-neutral-950">
                {formatPrice(currentOrder.totalAmount)} ₫
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-neutral-400">Cập nhật lần cuối</p>

              <p className="mt-1 text-sm text-neutral-600">
                {formatDate(currentOrder.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderDetailPage;
