import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  fetchCart,
  removeAllItems,
  removeItem,
  updateItem,
} from "../store/cartSlice.js";

import { getProductImages } from "../services/productDetailService.js";
import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

function CartPage() {
  const dispatch = useDispatch();

  const { cart, loading, actionLoading, error } = useSelector(
    (state) => state.cart,
  );

  const { language } = useThemeLanguage();
  const t = translations[language];

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
    return Number(price || 0).toLocaleString(
      language === "en" ? "en-US" : "vi-VN",
    );
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
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />

            <div className="mt-4 h-10 w-40 animate-pulse rounded bg-neutral-200" />

            <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-neutral-200" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-neutral-200 bg-white p-5"
                >
                  <div className="flex gap-5">
                    <div className="h-28 w-28 shrink-0 animate-pulse rounded-2xl bg-neutral-100" />

                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-3/5 animate-pulse rounded bg-neutral-100" />

                      <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />

                      <div className="h-4 w-40 animate-pulse rounded bg-neutral-100" />
                    </div>

                    <div className="hidden space-y-3 sm:block">
                      <div className="h-10 w-32 animate-pulse rounded-xl bg-neutral-100" />

                      <div className="ml-auto h-5 w-24 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-64 animate-pulse rounded-[1.5rem] bg-neutral-200" />
          </div>
        </section>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 transition-colors duration-200 hover:text-neutral-500"
            >
              <span>←</span>
              {t.cart.continueShopping}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalItems = cart?.totalItems || 0;
  const totalAmount = cart?.totalAmount || 0;

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Heading */}
        <div className="mb-10 flex flex-col gap-6 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
              {t.cart.eyebrow}
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
              {t.cart.title}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
              {t.cart.description}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              disabled={actionLoading}
              className="self-start rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              {t.cart.clearAll}
            </button>
          )}
        </div>

        {/* Error */}
        {error && cart && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Empty cart */}
        {items.length === 0 ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-20 text-center sm:px-10 sm:py-24">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                {t.cart.emptyEyebrow}
              </p>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
                {t.cart.emptyTitle}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
                {t.cart.emptyDescription}
              </p>

              <Link
                to="/products"
                className="mt-7 inline-flex items-center gap-3 rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
              >
                <span>{t.cart.viewProducts}</span>

                <span className="transition-transform duration-300 hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
            {/* Cart items */}
            <div>
              <div className="mb-4 flex items-center gap-4">
                {imageLoading && (
                  <p className="text-xs text-neutral-400">
                    {t.cart.loadingImages}
                  </p>
                )}

                <Link
                  to="/products"
                  className="text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
                >
                  {t.cart.continueShopping}
                </Link>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const isMaxQuantity = item.quantity >= item.stock;

                  return (
                    <article
                      key={item.id}
                      className="group rounded-[1.5rem] border border-neutral-200 bg-white p-5 transition-all duration-300 hover:border-neutral-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] sm:p-6"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row">
                        {/* Product image */}
                        <Link
                          to={`/products/${item.productId}`}
                          className="motion-image relative flex aspect-square h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 sm:h-32 sm:w-32"
                        >
                          {productImages[item.productId] ? (
                            <img
                              src={productImages[item.productId]}
                              alt={item.productName}
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#ffffff,transparent_30%),linear-gradient(135deg,#f5f5f5,#e5e5e5)]">
                              <div className="text-center">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                                  Sneaker
                                </p>

                                <p className="mt-1 max-w-20 text-[11px] font-semibold leading-4 text-neutral-500">
                                  {item.productName}
                                </p>
                              </div>
                            </div>
                          )}
                        </Link>

                        {/* Information */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row">
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                                {t.cart.product}
                              </p>

                              <Link
                                to={`/products/${item.productId}`}
                                className="mt-1 block max-w-xl text-lg font-semibold tracking-[-0.015em] text-neutral-950 transition-colors duration-200 hover:text-neutral-500"
                              >
                                {item.productName}
                              </Link>
                            </div>

                            <div className="shrink-0 sm:text-right">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                                {t.cart.subtotal}
                              </p>

                              <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                                {formatPrice(item.subtotal)} ₫
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                              {t.cart.size} {item.sizeName}
                            </span>

                            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                              {item.colorName}
                            </span>
                          </div>

                          <div className="mt-5 flex flex-col gap-5 border-t border-neutral-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-neutral-500">
                              <p>
                                {t.cart.unitPrice}{" "}
                                <span className="font-semibold text-neutral-900">
                                  {formatPrice(item.unitPrice)} ₫
                                </span>
                              </p>

                              <p>
                                {t.cart.stock}{" "}
                                <span
                                  className={`font-semibold ${
                                    item.stock > 0
                                      ? "text-neutral-900"
                                      : "text-red-600"
                                  }`}
                                >
                                  {item.stock}
                                </span>
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                              {/* Quantity */}
                              <div className="flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-white">
                                <button
                                  type="button"
                                  onClick={() => handleDecrease(item)}
                                  disabled={item.quantity <= 1 || actionLoading}
                                  aria-label={t.cart.decreaseQuantity}
                                  className="flex h-10 w-10 items-center justify-center text-base text-neutral-600 transition-colors duration-200 hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:text-neutral-300"
                                >
                                  −
                                </button>

                                <span className="flex h-10 min-w-12 items-center justify-center border-x border-neutral-200 px-3 text-sm font-semibold text-neutral-950">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleIncrease(item)}
                                  disabled={isMaxQuantity || actionLoading}
                                  aria-label={t.cart.increaseQuantity}
                                  className="flex h-10 w-10 items-center justify-center text-base text-neutral-600 transition-colors duration-200 hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:text-neutral-300"
                                >
                                  +
                                </button>
                              </div>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => handleRemove(item.id)}
                                disabled={actionLoading}
                                className="text-xs font-medium text-neutral-400 underline decoration-neutral-300 underline-offset-4 transition-colors duration-200 hover:text-red-600 hover:decoration-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {t.cart.remove}
                              </button>
                            </div>
                          </div>

                          {isMaxQuantity && item.stock > 0 && (
                            <p className="mt-3 text-xs text-neutral-400">
                              {t.cart.maxQuantityReached}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
                <div className="border-b border-neutral-100 px-6 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    {t.cart.summaryEyebrow}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                    {t.cart.summaryTitle}
                  </h2>
                </div>

                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">
                        {t.cart.totalProducts}
                      </span>

                      <span className="font-medium text-neutral-900">
                        {totalItems}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">
                        {t.cart.cartStatus}
                      </span>

                      <span className="font-medium text-neutral-900">
                        {t.cart.ready}
                      </span>
                    </div>
                  </div>

                  <div className="my-6 h-px bg-neutral-200" />

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
                        {t.cart.total}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                        {formatPrice(totalAmount)} ₫
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="group mt-7 flex w-full items-center justify-between rounded-xl bg-neutral-950 px-5 py-4 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0"
                  >
                    <span>{t.cart.checkout}</span>

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  <Link
                    to="/products"
                    className="mt-4 block text-center text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
                  >
                    {t.cart.continueShopping}
                  </Link>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-neutral-200 bg-white px-5 py-4">
                <p className="text-xs leading-5 text-neutral-500">
                  {t.cart.bottomNote}
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}

export default CartPage;
