import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { fetchMyOrders } from "../store/orderSlice.js";
import { getPrimaryProductImage } from "../services/productImageService.js";
import { getProductVariantById } from "../services/productDetailService.js";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

function OrderHistoryPage() {
  const dispatch = useDispatch();

  const { orders, loading, error } = useSelector((state) => state.order);

  const { language } = useThemeLanguage();
  const t = translations[language];

  const [productImages, setProductImages] = useState({});

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    let active = true;

    const loadProductImages = async () => {
      if (!orders || orders.length === 0) {
        setProductImages({});
        return;
      }

      const uniqueVariantIds = [
        ...new Set(
          orders
            .flatMap((order) => order.items || [])
            .map((item) => item.productVariantId)
            .filter(
              (variantId) => variantId !== null && variantId !== undefined,
            ),
        ),
      ];

      if (uniqueVariantIds.length === 0) {
        setProductImages({});
        return;
      }

      try {
        // Bước 1: từ Variant lấy ra Product ID.
        const variantResults = await Promise.all(
          uniqueVariantIds.map(async (variantId) => {
            try {
              const variant = await getProductVariantById(variantId);

              return {
                variantId,
                productId: variant?.productId || null,
              };
            } catch {
              return {
                variantId,
                productId: null,
              };
            }
          }),
        );

        const productIds = [
          ...new Set(
            variantResults
              .map((result) => result.productId)
              .filter(
                (productId) => productId !== null && productId !== undefined,
              ),
          ),
        ];

        if (productIds.length === 0) {
          if (active) {
            setProductImages({});
          }

          return;
        }

        // Bước 2: từ Product ID lấy ảnh primary.
        const imageResults = await Promise.all(
          productIds.map(async (productId) => {
            try {
              const imageUrl = await getPrimaryProductImage(productId);

              return {
                productId,
                imageUrl: imageUrl || "",
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

        const productImageMap = {};

        imageResults.forEach((result) => {
          productImageMap[result.productId] = result.imageUrl;
        });

        const variantImageMap = {};

        variantResults.forEach((result) => {
          if (result.productId !== null) {
            variantImageMap[result.variantId] =
              productImageMap[result.productId] || "";
          }
        });

        setProductImages(variantImageMap);
      } catch (requestError) {
        console.error("Không thể tải hình ảnh đơn hàng:", requestError);

        if (active) {
          setProductImages({});
        }
      }
    };

    void loadProductImages();

    return () => {
      active = false;
    };
  }, [orders]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      language === "en" ? "en-US" : "vi-VN",
    );
  };

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleString(
      language === "en" ? "en-US" : "vi-VN",
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return t.orders.statusPending;

      case "CONFIRMED":
        return t.orders.statusConfirmed;

      case "COMPLETED":
        return t.orders.statusCompleted;

      case "CANCELLED":
        return t.orders.statusCancelled;

      case "PAID":
        return t.orders.statusPaid;

      case "PROCESSING":
        return t.orders.statusProcessing;

      case "SHIPPED":
        return t.orders.statusShipped;

      case "DELIVERED":
        return t.orders.statusDelivered;

      default:
        return status || t.orders.statusUnknown;
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

      case "PAID":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "PROCESSING":
        return "border-indigo-200 bg-indigo-50 text-indigo-700";

      case "SHIPPED":
        return "border-violet-200 bg-violet-50 text-violet-700";

      case "DELIVERED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

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

      case "PAID":
        return "bg-emerald-500";

      case "PROCESSING":
        return "bg-indigo-500";

      case "SHIPPED":
        return "bg-violet-500";

      case "DELIVERED":
        return "bg-emerald-500";

      default:
        return "bg-neutral-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="border-b border-neutral-200 pb-8">
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />

            <div className="mt-4 h-10 w-64 max-w-full animate-pulse rounded bg-neutral-200" />

            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-neutral-200" />
          </div>

          <div className="mt-8 space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-neutral-200 bg-white p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="h-5 w-44 animate-pulse rounded bg-neutral-100" />

                    <div className="h-4 w-36 animate-pulse rounded bg-neutral-100" />
                  </div>

                  <div className="space-y-2 sm:text-right">
                    <div className="ml-auto h-3 w-20 animate-pulse rounded bg-neutral-100" />

                    <div className="ml-auto h-6 w-32 animate-pulse rounded bg-neutral-100" />
                  </div>
                </div>

                <div className="my-6 h-px bg-neutral-100" />

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 animate-pulse rounded-xl bg-neutral-100" />

                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/5 animate-pulse rounded bg-neutral-100" />

                      <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-16 w-16 animate-pulse rounded-xl bg-neutral-100" />

                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/5 animate-pulse rounded bg-neutral-100" />

                      <div className="h-3 w-32 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Heading */}
        <div className="flex flex-col gap-6 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
              {t.orders.eyebrow}
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
              {t.orders.title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
              {t.orders.description}
            </p>
          </div>

          {!loading && !error && orders.length > 0 && (
            <Link
              to="/products"
              className="self-start rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-50 sm:self-auto"
            >
              {t.orders.continueShopping}
            </Link>
          )}
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium leading-6 text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-20 text-center sm:px-10 sm:py-24">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                {t.orders.emptyEyebrow}
              </p>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
                {t.orders.emptyTitle}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
                {t.orders.emptyDescription}
              </p>

              <Link
                to="/products"
                className="mt-7 inline-flex items-center gap-3 rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
              >
                <span>{t.orders.viewProducts}</span>

                <span className="transition-transform duration-300 hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Order list */}
        {!loading && !error && orders.length > 0 && (
          <div className="mt-8 space-y-5">
            {orders.map((order) => {
              const items = order.items || [];

              const totalQuantity = items.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0,
              );

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)]"
                >
                  {/* Order header */}
                  <div className="border-b border-neutral-100 px-5 py-5 sm:px-6 sm:py-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
                            {t.orders.order} #{order.id}
                          </h2>

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

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-400">
                          <span>
                            {t.orders.orderedAt}{" "}
                            <span className="font-medium text-neutral-600">
                              {formatDate(order.createdAt)}
                            </span>
                          </span>

                          <span>
                            {items.length}{" "}
                            {items.length === 1
                              ? t.orders.productLine
                              : t.orders.productLines}
                          </span>

                          <span>
                            {totalQuantity} {t.orders.products}
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                          {t.orders.total}
                        </p>

                        <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                          {formatPrice(order.totalAmount)} ₫
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="divide-y divide-neutral-100 px-5 sm:px-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center"
                      >
                        {/* Product image */}
                        <div className="group/image flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100">
                          {productImages[item.productVariantId] ? (
                            <img
                              src={productImages[item.productVariantId]}
                              alt={item.productName}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/image:scale-[1.05]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#ffffff,transparent_30%),linear-gradient(135deg,#f5f5f5,#e5e5e5)]">
                              <div className="px-2 text-center">
                                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                  Sneaker
                                </p>

                                <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-4 text-neutral-500">
                                  {item.productName}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Product info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-neutral-950">
                            {item.productName}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                              {t.orders.size} {item.sizeName}
                            </span>

                            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                              {item.colorName}
                            </span>

                            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                              {t.orders.quantity}: {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Item price */}
                        <div className="flex items-end justify-between gap-6 sm:min-w-36 sm:flex-col sm:items-end">
                          <p className="text-xs text-neutral-400">
                            {formatPrice(item.unitPrice)} ₫ / {t.orders.item}
                          </p>

                          <p className="text-base font-semibold text-neutral-950">
                            {formatPrice(item.subtotal)} ₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col gap-3 border-t border-neutral-100 bg-neutral-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="text-xs text-neutral-400">
                      {t.orders.orderCode}{" "}
                      <span className="font-semibold text-neutral-600">
                        #{order.id}
                      </span>
                    </p>

                    <Link
                      to={`/orders/${order.id}`}
                      className="group inline-flex items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white active:translate-y-0"
                    >
                      <span>{t.orders.viewDetails}</span>

                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default OrderHistoryPage;
