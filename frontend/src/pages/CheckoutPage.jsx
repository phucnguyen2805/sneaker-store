import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { fetchCart, resetCart } from "../store/cartSlice.js";

import { checkout } from "../store/orderSlice.js";

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    cart,
    loading: cartLoading,
    error: cartError,
  } = useSelector((state) => state.cart);

  const {
    currentOrder,
    actionLoading,
    error: orderError,
  } = useSelector((state) => state.order);

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN");
  };

  const handleCheckout = async () => {
    setSuccess(false);

    const result = await dispatch(checkout());

    if (checkout.fulfilled.match(result)) {
      // Backend đã tạo Order và đồng thời xóa Cart.
      // Reset Redux Cart để Header và Cart Page đồng bộ ngay.
      dispatch(resetCart());

      setSuccess(true);
    }
  };

  if (cartLoading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">
            Đang tải thông tin checkout...
          </p>
        </div>
      </section>
    );
  }

  if (success && currentOrder) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Order Confirmed
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-950">
            Đặt hàng thành công
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-500">
            Đơn hàng của bạn đã được tạo thành công.
          </p>

          <div className="mt-8 rounded-2xl bg-neutral-100 p-6 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Mã đơn hàng</span>

              <span className="font-semibold text-neutral-950">
                #{currentOrder.id}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-neutral-500">Trạng thái</span>

              <span className="font-semibold text-neutral-950">
                {currentOrder.status}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-neutral-500">Tổng tiền</span>

              <span className="text-lg font-bold text-neutral-950">
                {formatPrice(currentOrder.totalAmount)} ₫
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
            >
              Tiếp tục mua sắm
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors duration-200 hover:bg-neutral-50"
            >
              Tài khoản
            </button>
          </div>
        </div>
      </section>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
            Không thể checkout
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Giỏ hàng đang trống. Hãy thêm sản phẩm trước khi đặt hàng.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            Xem sản phẩm
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Checkout
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-neutral-950">
          Xác nhận đơn hàng
        </h1>

        <p className="mt-3 text-base text-neutral-500">
          Kiểm tra lại sản phẩm và tổng tiền trước khi đặt hàng.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                  <span className="text-xs text-neutral-400">Sneaker</span>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold text-neutral-950">
                    {item.productName}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-neutral-500">
                    <span>Size {item.sizeName}</span>

                    <span>•</span>

                    <span>{item.colorName}</span>

                    <span>•</span>

                    <span>SL: {item.quantity}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-neutral-500">
                    {formatPrice(item.unitPrice)} ₫
                  </p>

                  <p className="mt-1 font-semibold text-neutral-950">
                    {formatPrice(item.subtotal)} ₫
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-xl font-semibold text-neutral-950">
            Tóm tắt đơn hàng
          </h2>

          <div className="my-6 h-px bg-neutral-200" />

          <div className="flex items-center justify-between text-sm text-neutral-500">
            <span>Số lượng</span>

            <span className="font-medium text-neutral-900">
              {cart?.totalItems || 0}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-base font-medium text-neutral-700">
              Tổng tiền
            </span>

            <span className="text-2xl font-bold text-neutral-950">
              {formatPrice(cart?.totalAmount)} ₫
            </span>
          </div>

          {(cartError || orderError) && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm leading-6 text-red-600">
                {orderError || cartError}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={actionLoading}
            className="mt-7 w-full rounded-xl bg-neutral-950 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading ? "Đang tạo đơn hàng..." : "Đặt hàng"}
          </button>

          <Link
            to="/cart"
            className="mt-3 block text-center text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
          >
            Quay lại giỏ hàng
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
