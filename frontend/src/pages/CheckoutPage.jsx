import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { getProductImages } from "../services/productDetailService.js";
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
  const [productImages, setProductImages] = useState({});
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    let active = true;

    const loadProductImages = async () => {
      const items = cart?.items || [];

      if (items.length === 0) {
        setProductImages({});
        setImageLoading(false);
        return;
      }

      const uniqueProductIds = [
        ...new Set(
          items
            .map((item) => item.productId)
            .filter(
              (productId) => productId !== null && productId !== undefined,
            ),
        ),
      ];

      if (uniqueProductIds.length === 0) {
        setProductImages({});
        setImageLoading(false);
        return;
      }

      try {
        setImageLoading(true);

        const results = await Promise.all(
          uniqueProductIds.map(async (productId) => {
            try {
              const imageData = await getProductImages(productId);

              const images = Array.isArray(imageData) ? [...imageData] : [];

              images.sort((first, second) => {
                if (first.primary && !second.primary) {
                  return -1;
                }

                if (!first.primary && second.primary) {
                  return 1;
                }

                return (
                  Number(first.displayOrder || 0) -
                  Number(second.displayOrder || 0)
                );
              });

              return {
                productId,
                imageUrl: images[0]?.imageUrl || "",
              };
            } catch {
              return {
                productId,
                imageUrl: "",
              };
            }
          }),
        );

        if (!active) {
          return;
        }

        const imageMap = {};

        results.forEach((result) => {
          imageMap[result.productId] = result.imageUrl;
        });

        setProductImages(imageMap);
      } finally {
        if (active) {
          setImageLoading(false);
        }
      }
    };

    loadProductImages();

    return () => {
      active = false;
    };
  }, [cart?.items]);

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

  const handleContinueShopping = () => {
    navigate("/products");
  };

  const handleViewAccount = () => {
    navigate("/profile");
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
            <div className="mt-4 h-10 w-64 animate-pulse rounded bg-neutral-200" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-neutral-200" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex gap-5">
                    <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-neutral-100" />

                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-3/5 animate-pulse rounded bg-neutral-100" />
                      <div className="h-4 w-40 animate-pulse rounded bg-neutral-100" />
                      <div className="h-4 w-28 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-72 animate-pulse rounded-[1.5rem] bg-neutral-200" />
          </div>
        </section>
      </div>
    );
  }

  if (success && currentOrder) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <div className="border-b border-neutral-100 px-6 py-10 text-center sm:px-10 sm:py-14">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                  Order Confirmed
                </p>

                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
                  Đặt hàng thành công
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-neutral-500 sm:text-base">
                  Đơn hàng của bạn đã được tạo thành công và đang được xử lý.
                </p>
              </div>

              <div className="px-6 py-7 sm:px-10 sm:py-8">
                <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-neutral-50">
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="text-sm text-neutral-500">
                      Mã đơn hàng
                    </span>

                    <span className="text-sm font-semibold text-neutral-950">
                      #{currentOrder.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="text-sm text-neutral-500">Trạng thái</span>

                    <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white">
                      {currentOrder.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="text-sm text-neutral-500">Tổng tiền</span>

                    <span className="text-lg font-semibold text-neutral-950">
                      {formatPrice(currentOrder.totalAmount)} ₫
                    </span>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleContinueShopping}
                    className="rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
                  >
                    Tiếp tục mua sắm
                  </button>

                  <button
                    type="button"
                    onClick={handleViewAccount}
                    className="rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-50 active:translate-y-0"
                  >
                    Xem tài khoản
                  </button>
                </div>

                <Link
                  to="/orders"
                  className="mt-5 block text-center text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
                >
                  Xem lịch sử đơn hàng
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalItems = cart?.totalItems || 0;
  const totalAmount = cart?.totalAmount || 0;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
            <div className="px-6 py-20 text-center sm:px-10 sm:py-24">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                Checkout
              </p>

              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                Không thể checkout
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-500">
                Giỏ hàng đang trống. Hãy thêm sản phẩm trước khi tiến hành đặt
                hàng.
              </p>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className="rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800"
                >
                  Xem sản phẩm
                </Link>

                <Link
                  to="/cart"
                  className="rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-50"
                >
                  Quay lại giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Heading */}
        <div className="mb-10 border-b border-neutral-200 pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
            Checkout
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                Xác nhận đơn hàng
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                Kiểm tra lại sản phẩm và tổng tiền trước khi hoàn tất đơn hàng.
              </p>
            </div>

            <Link
              to="/cart"
              className="self-start text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950 sm:self-auto"
            >
              ← Quay lại giỏ hàng
            </Link>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          {/* Order items */}
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  Order items
                </p>

                <h2 className="mt-1 text-lg font-semibold text-neutral-950">
                  Sản phẩm của bạn
                </h2>
              </div>

              {imageLoading && (
                <p className="text-xs text-neutral-400">Đang tải hình ảnh...</p>
              )}
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="group rounded-[1.5rem] border border-neutral-200 bg-white p-5 transition-all duration-300 hover:border-neutral-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    {/* Image */}
                    <Link
                      to={`/products/${item.productId}`}
                      className="motion-image relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 sm:h-28 sm:w-28"
                    >
                      {productImages[item.productId] ? (
                        <img
                          src={productImages[item.productId]}
                          alt={item.productName}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#ffffff,transparent_30%),linear-gradient(135deg,#f5f5f5,#e5e5e5)]">
                          <p className="text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                            Sneaker
                          </p>
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                        Product
                      </p>

                      <Link
                        to={`/products/${item.productId}`}
                        className="mt-1 block text-lg font-semibold tracking-[-0.015em] text-neutral-950 transition-colors duration-200 hover:text-neutral-500"
                      >
                        {item.productName}
                      </Link>

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
                    <div className="shrink-0 sm:min-w-32 sm:text-right">
                      <p className="text-xs text-neutral-400">
                        {formatPrice(item.unitPrice)} ₫ / sản phẩm
                      </p>

                      <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                        {formatPrice(item.subtotal)} ₫
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
              <div className="border-b border-neutral-100 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  Order summary
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  Tóm tắt đơn hàng
                </h2>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Số lượng sản phẩm</span>

                    <span className="font-medium text-neutral-900">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Sản phẩm trong giỏ</span>

                    <span className="font-medium text-neutral-900">
                      {items.length}
                    </span>
                  </div>
                </div>

                <div className="my-6 h-px bg-neutral-200" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
                      Tổng thanh toán
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                      {formatPrice(totalAmount)} ₫
                    </p>
                  </div>
                </div>

                {(cartError || orderError) && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm leading-6 text-red-700">
                      {orderError || cartError}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={actionLoading}
                  className="group mt-7 flex w-full items-center justify-between rounded-xl bg-neutral-950 px-5 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {actionLoading ? "Đang tạo đơn hàng..." : "Đặt hàng"}
                  </span>

                  {!actionLoading && (
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="mt-4 block text-center text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
                >
                  Chỉnh sửa giỏ hàng
                </Link>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-neutral-200 bg-white px-5 py-4">
              <p className="text-xs leading-5 text-neutral-500">
                Khi nhấn{" "}
                <span className="font-semibold text-neutral-700">Đặt hàng</span>
                , hệ thống sẽ tạo đơn hàng và cập nhật lại giỏ hàng của bạn.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default CheckoutPage;
