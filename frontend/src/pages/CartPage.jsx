import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  fetchCart,
  removeAllItems,
  removeItem,
  updateItem,
} from "../store/cartSlice.js";

function CartPage() {
  const dispatch = useDispatch();

  const { cart, loading, actionLoading, error } = useSelector(
    (state) => state.cart,
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN");
  };

  const handleIncrease = (item) => {
    if (item.quantity >= item.stock) {
      return;
    }

    dispatch(
      updateItem({
        itemId: item.id,
        quantity: item.quantity + 1,
      }),
    );
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) {
      return;
    }

    dispatch(
      updateItem({
        itemId: item.id,
        quantity: item.quantity - 1,
      }),
    );
  };

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  const handleClearCart = () => {
    dispatch(removeAllItems());
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">Đang tải giỏ hàng...</p>
        </div>
      </section>
    );
  }

  if (error && !cart) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">{error}</p>

          <Link
            to="/products"
            className="mt-4 inline-block text-sm font-semibold text-neutral-900 underline"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    );
  }

  const items = cart?.items || [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Shopping Cart
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-neutral-950">
            Giỏ hàng
          </h1>

          <p className="mt-3 text-base text-neutral-500">
            Kiểm tra sản phẩm trước khi tiến hành thanh toán.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            disabled={actionLoading}
            className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 transition-colors duration-200 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xóa toàn bộ
          </button>
        )}
      </div>

      {error && cart && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-950">
            Giỏ hàng đang trống
          </h2>

          <p className="mt-3 text-sm text-neutral-500">
            Hãy chọn một đôi sneaker và thêm vào giỏ hàng.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                    <span className="text-xs text-neutral-400">Sneaker</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-neutral-950">
                      {item.productName}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-neutral-500">
                      <span className="rounded-lg bg-neutral-100 px-3 py-1">
                        Size {item.sizeName}
                      </span>

                      <span className="rounded-lg bg-neutral-100 px-3 py-1">
                        {item.colorName}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-neutral-500">
                      Đơn giá:{" "}
                      <span className="font-medium text-neutral-900">
                        {formatPrice(item.unitPrice)} ₫
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      Tồn kho hiện tại:{" "}
                      <span className="font-medium text-neutral-900">
                        {item.stock}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-5 sm:flex-col sm:items-end">
                    <div className="flex items-center rounded-xl border border-neutral-200">
                      <button
                        type="button"
                        onClick={() => handleDecrease(item)}
                        disabled={item.quantity <= 1 || actionLoading}
                        className="h-10 w-10 text-lg text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-300"
                      >
                        −
                      </button>

                      <span className="flex h-10 min-w-12 items-center justify-center border-x border-neutral-200 px-3 text-sm font-semibold text-neutral-900">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleIncrease(item)}
                        disabled={item.quantity >= item.stock || actionLoading}
                        className="h-10 w-10 text-lg text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-300"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-950">
                        {formatPrice(item.subtotal)} ₫
                      </p>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        disabled={actionLoading}
                        className="mt-2 text-sm font-medium text-neutral-500 underline underline-offset-4 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Xóa
                      </button>
                    </div>
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

            <div className="mt-4 flex items-center justify-between">
              <span className="text-base font-medium text-neutral-700">
                Tổng tiền
              </span>

              <span className="text-2xl font-bold text-neutral-950">
                {formatPrice(cart?.totalAmount)} ₫
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-7 block w-full rounded-xl bg-neutral-950 px-6 py-4 text-center text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
            >
              Tiến hành thanh toán
            </Link>

            <Link
              to="/products"
              className="mt-3 block text-center text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
            >
              Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}

export default CartPage;
