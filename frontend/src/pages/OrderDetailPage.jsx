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
        return status || "Không xác định";
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
              <div className="h-10 w-64 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-neutral-200" />
            </div>

            <div className="h-9 w-28 animate-pulse rounded-full bg-neutral-200" />
          </div>

          <div className="mt-8 space-y-6">
            <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6">
              <div className="h-5 w-24 animate-pulse rounded bg-neutral-100" />

              <div className="mt-6 space-y-5">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="h-20 w-20 animate-pulse rounded-2xl bg-neutral-100" />

                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-3/5 animate-pulse rounded bg-neutral-100" />
                      <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />
                      <div className="h-3 w-28 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-36 animate-pulse rounded-[1.5rem] bg-neutral-200" />
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.5rem] border border-red-200 bg-red-50">
            <div className="px-6 py-8 sm:px-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-400">
                Order Error
              </p>

              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-red-700">
                Không thể tải đơn hàng
              </h1>

              <p className="mt-3 text-sm leading-6 text-red-600">{error}</p>

              <Link
                to="/orders"
                className="mt-6 inline-flex items-center gap-3 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800"
              >
                <span>Quay lại đơn hàng</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-20 text-center sm:px-10 sm:py-24">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                Order Detail
              </p>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
                Không tìm thấy đơn hàng
              </h1>

              <p className="mt-3 text-sm text-neutral-500">
                Đơn hàng này không tồn tại hoặc không thể truy cập.
              </p>

              <Link
                to="/orders"
                className="mt-7 inline-flex items-center gap-3 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800"
              >
                <span>Quay lại đơn hàng</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const items = currentOrder.items || [];

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Back */}
        <div>
          <Link
            to="/orders"
            className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            Quay lại đơn hàng
          </Link>
        </div>

        {/* Order header */}
        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                  Order Detail
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
                  Đơn hàng #{currentOrder.id}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-400">
                  <span>
                    Đặt lúc:{" "}
                    <span className="font-medium text-neutral-600">
                      {formatDate(currentOrder.createdAt)}
                    </span>
                  </span>

                  <span>
                    Cập nhật:{" "}
                    <span className="font-medium text-neutral-600">
                      {formatDate(currentOrder.updatedAt)}
                    </span>
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${getStatusClass(
                  currentOrder.status,
                )}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(
                    currentOrder.status,
                  )}`}
                />

                {getStatusLabel(currentOrder.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Products */}
          <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.04)]">
            <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                Order items
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                Sản phẩm
              </h2>
            </div>

            {items.length > 0 ? (
              <div className="divide-y divide-neutral-100 px-5 sm:px-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col gap-4 py-5 sm:flex-row sm:items-center"
                  >
                    {/* Product visual */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_35%_30%,#ffffff,transparent_30%),linear-gradient(135deg,#f5f5f5,#e5e5e5)] transition-transform duration-300 group-hover:scale-[1.02]">
                      <div className="px-2 text-center">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                          Sneaker
                        </p>

                        <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-4 text-neutral-500">
                          {item.productName}
                        </p>
                      </div>
                    </div>

                    {/* Information */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                        Product
                      </p>

                      <h3 className="mt-1 truncate text-base font-semibold tracking-tight text-neutral-950">
                        {item.productName}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                          Size {item.sizeName}
                        </span>

                        <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                          {item.colorName}
                        </span>

                        <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                          SL: {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-end justify-between gap-5 sm:min-w-36 sm:flex-col sm:items-end">
                      <p className="text-xs text-neutral-400">
                        {formatPrice(item.unitPrice)} ₫ / sản phẩm
                      </p>

                      <p className="text-base font-semibold text-neutral-950">
                        {formatPrice(item.subtotal)} ₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-neutral-500">
                  Đơn hàng chưa có sản phẩm.
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
              <div className="border-b border-neutral-100 px-5 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  Summary
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  Tóm tắt đơn hàng
                </h2>
              </div>

              <div className="px-5 py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Số lượng sản phẩm</span>

                    <span className="font-semibold text-neutral-950">
                      {totalQuantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Số dòng sản phẩm</span>

                    <span className="font-semibold text-neutral-950">
                      {items.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Trạng thái</span>

                    <span className="font-medium text-neutral-900">
                      {getStatusLabel(currentOrder.status)}
                    </span>
                  </div>
                </div>

                <div className="my-6 h-px bg-neutral-200" />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    Tổng thanh toán
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                    {formatPrice(currentOrder.totalAmount)} ₫
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/orders"
              className="group mt-4 flex items-center justify-between rounded-xl border border-neutral-300 bg-white px-5 py-3.5 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
            >
              <span>Quay lại lịch sử đơn hàng</span>

              <span className="transition-transform duration-200 group-hover:-translate-x-1">
                ←
              </span>
            </Link>

            <Link
              to="/products"
              className="mt-3 block text-center text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
            >
              Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default OrderDetailPage;
