import { useEffect, useState } from "react";
import api from "../services/api.js";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

function AdminTestPage() {
  const { language } = useThemeLanguage();
  const t = translations[language];

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/statistics");
        setStatistics(response.data);
      } catch (err) {
        console.error("Không thể tải thống kê admin:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          t.adminDashboard.loadError;

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [language, t.adminDashboard.loadError]);

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString(
      language === "en" ? "en-US" : "vi-VN",
    );
  };

  const formatCurrency = (value) => {
    return `${formatNumber(value)} ₫`;
  };

  const getValue = (object, keys) => {
    for (const key of keys) {
      if (object?.[key] !== undefined && object?.[key] !== null) {
        return object[key];
      }
    }

    return 0;
  };

  const totalProducts = getValue(statistics, ["totalProducts"]);

  const totalVariants = getValue(statistics, ["totalVariants"]);

  const totalOrders = getValue(statistics, ["totalOrders"]);

  const completedRevenue = getValue(statistics, [
    "completedRevenue",
    "totalRevenue",
  ]);

  const pendingOrders = getValue(statistics, [
    "pendingOrders",
    "pendingOrderCount",
  ]);

  const confirmedOrders = getValue(statistics, [
    "confirmedOrders",
    "confirmedOrderCount",
  ]);

  const completedOrders = getValue(statistics, [
    "completedOrders",
    "completedOrderCount",
  ]);

  const cancelledOrders = getValue(statistics, [
    "cancelledOrders",
    "cancelledOrderCount",
  ]);

  const monthlyRevenue = Array.isArray(statistics?.monthlyRevenue)
    ? statistics.monthlyRevenue
    : [];

  const monthlyRevenueMax =
    monthlyRevenue.length === 0
      ? 0
      : Math.max(
          ...monthlyRevenue.map((item) =>
            Number(getValue(item, ["revenue", "totalRevenue", "amount"])),
          ),
        );

  const totalStatusOrders =
    Number(pendingOrders || 0) +
    Number(confirmedOrders || 0) +
    Number(completedOrders || 0) +
    Number(cancelledOrders || 0);

  const getStatusPercentage = (value) => {
    if (!totalStatusOrders) {
      return 0;
    }

    return Math.round((Number(value || 0) / totalStatusOrders) * 100);
  };

  const statCards = [
    {
      label: t.adminDashboard.stats.products,
      value: formatNumber(totalProducts),
      description: t.adminDashboard.stats.productsDescription,
    },
    {
      label: t.adminDashboard.stats.variants,
      value: formatNumber(totalVariants),
      description: t.adminDashboard.stats.variantsDescription,
    },
    {
      label: t.adminDashboard.stats.orders,
      value: formatNumber(totalOrders),
      description: t.adminDashboard.stats.ordersDescription,
    },
    {
      label: t.adminDashboard.stats.revenue,
      value: formatCurrency(completedRevenue),
      description: t.adminDashboard.stats.revenueDescription,
      wide: true,
    },
  ];

  const statusItems = [
    {
      label: t.adminDashboard.status.pending,
      value: pendingOrders,
      dot: "bg-amber-500",
      bar: "bg-amber-500",
      badge: "border-amber-200 bg-amber-50 text-amber-700",
    },
    {
      label: t.adminDashboard.status.confirmed,
      value: confirmedOrders,
      dot: "bg-blue-500",
      bar: "bg-blue-500",
      badge: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      label: t.adminDashboard.status.completed,
      value: completedOrders,
      dot: "bg-emerald-500",
      bar: "bg-emerald-500",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      label: t.adminDashboard.status.cancelled,
      value: cancelledOrders,
      dot: "bg-red-500",
      bar: "bg-red-500",
      badge: "border-red-200 bg-red-50 text-red-700",
    },
  ];

  const formatMonth = (month) => {
    if (language === "en") {
      return `M${month}`;
    }

    return `T${month}`;
  };

  const formatMonthFull = (month) => {
    if (language === "en") {
      return `Month ${month}`;
    }

    return `Tháng ${month}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
            {t.adminDashboard.eyebrow}
          </p>

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                {t.adminDashboard.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                {t.adminDashboard.description}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {t.adminDashboard.accessLabel}
              </p>

              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {t.adminDashboard.accessValue}
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-neutral-200 bg-white p-6"
                >
                  <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />

                  <div className="mt-5 h-8 w-28 animate-pulse rounded bg-neutral-100" />

                  <div className="mt-3 h-3 w-36 animate-pulse rounded bg-neutral-100" />
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="h-80 animate-pulse rounded-[1.5rem] bg-neutral-200" />

              <div className="h-80 animate-pulse rounded-[1.5rem] bg-neutral-200" />
            </div>

            <div className="h-72 animate-pulse rounded-[1.5rem] bg-neutral-200" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-red-200 bg-red-50">
            <div className="px-6 py-7 sm:px-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-400">
                {t.adminDashboard.errorEyebrow}
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-red-700">
                {t.adminDashboard.errorTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {!loading && !error && statistics && (
          <div className="mt-8 space-y-6">
            {/* Main statistics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className={`group rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)] ${
                    card.wide ? "xl:col-span-1" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      {card.label}
                    </p>

                    <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-950 transition-transform duration-300 group-hover:scale-125" />
                  </div>

                  <p
                    className={`mt-5 font-semibold tracking-[-0.04em] text-neutral-950 ${
                      card.wide ? "text-2xl sm:text-3xl" : "text-3xl"
                    }`}
                  >
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-neutral-400">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Revenue + Order status */}
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Revenue overview */}
              <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
                <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    {t.adminDashboard.revenue.eyebrow}
                  </p>

                  <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                        {t.adminDashboard.revenue.title}
                      </h2>

                      <p className="mt-2 text-sm text-neutral-500">
                        {t.adminDashboard.revenue.description}
                      </p>
                    </div>

                    <p className="text-2xl font-semibold tracking-tight text-neutral-950">
                      {formatCurrency(completedRevenue)}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <div className="rounded-[1.25rem] bg-neutral-950 p-6 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      {t.adminDashboard.revenue.currentTotal}
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                      {formatCurrency(completedRevenue)}
                    </p>

                    <p className="mt-3 max-w-md text-xs leading-5 text-neutral-400">
                      {t.adminDashboard.revenue.currentTotalDescription}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                        {t.adminDashboard.revenue.totalOrders}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                        {formatNumber(totalOrders)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                        {t.adminDashboard.revenue.completed}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                        {formatNumber(completedOrders)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order status */}
              <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
                <div className="border-b border-neutral-100 px-6 py-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    {t.adminDashboard.status.eyebrow}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
                    {t.adminDashboard.status.title}
                  </h2>
                </div>

                <div className="p-6">
                  <div className="mb-6 rounded-xl bg-neutral-50 p-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-neutral-400">
                          {t.adminDashboard.status.total}
                        </p>

                        <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                          {formatNumber(totalStatusOrders)}
                        </p>
                      </div>

                      <p className="text-xs text-neutral-400">
                        {t.adminDashboard.status.orders}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {statusItems.map((item) => {
                      const percentage = getStatusPercentage(item.value);

                      return (
                        <div key={item.label}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span
                                className={`h-2 w-2 shrink-0 rounded-full ${item.dot}`}
                              />

                              <span className="truncate text-sm font-medium text-neutral-700">
                                {item.label}
                              </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${item.badge}`}
                              >
                                {percentage}%
                              </span>

                              <span className="w-7 text-right text-sm font-semibold text-neutral-950">
                                {formatNumber(item.value)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${item.bar}`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly revenue */}
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
              <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {t.adminDashboard.monthly.eyebrow}
                </p>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                      {t.adminDashboard.monthly.title}
                    </h2>

                    <p className="mt-2 text-sm text-neutral-500">
                      {t.adminDashboard.monthly.description}
                    </p>
                  </div>
                </div>
              </div>

              {monthlyRevenue.length === 0 ? (
                <div className="p-6 sm:p-7">
                  <div className="rounded-xl bg-neutral-50 px-6 py-12 text-center">
                    <p className="text-sm text-neutral-500">
                      {t.adminDashboard.monthly.empty}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Visual bars */}
                  <div className="border-b border-neutral-100 px-6 py-7 sm:px-7">
                    <div className="flex h-64 items-end gap-3 overflow-x-auto pb-2">
                      {monthlyRevenue.map((item, index) => {
                        const year = getValue(item, ["year"]);
                        const month = getValue(item, ["month"]);

                        const orderCount = getValue(item, [
                          "orderCount",
                          "orders",
                          "count",
                        ]);

                        const revenue = getValue(item, [
                          "revenue",
                          "totalRevenue",
                          "amount",
                        ]);

                        const numericRevenue = Number(revenue || 0);

                        const barHeight =
                          monthlyRevenueMax > 0
                            ? Math.max(
                                8,
                                (numericRevenue / monthlyRevenueMax) * 100,
                              )
                            : 8;

                        return (
                          <div
                            key={`${year}-${month}-${index}`}
                            className="group flex min-w-16 flex-1 flex-col items-center justify-end gap-3"
                          >
                            <div className="relative flex h-52 w-full max-w-16 items-end justify-center">
                              <div className="absolute bottom-0 h-full w-px bg-neutral-100" />

                              <div
                                className="relative z-10 w-8 rounded-t-lg bg-neutral-950 transition-all duration-500 ease-out group-hover:w-10"
                                style={{
                                  height: `${barHeight}%`,
                                }}
                                title={`${formatCurrency(
                                  numericRevenue,
                                )} · ${formatNumber(orderCount)} ${
                                  t.adminDashboard.monthly.orderTooltip
                                }`}
                              >
                                <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1.5 text-[9px] font-medium text-white shadow-lg group-hover:block">
                                  {formatCurrency(numericRevenue)}
                                </div>
                              </div>
                            </div>

                            <div className="text-center">
                              <p className="text-xs font-semibold text-neutral-700">
                                {formatMonth(month)}
                              </p>

                              <p className="mt-0.5 text-[10px] text-neutral-400">
                                {year}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 text-left">
                          <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 sm:px-7">
                            {t.adminDashboard.monthly.year}
                          </th>

                          <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            {t.adminDashboard.monthly.month}
                          </th>

                          <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            {t.adminDashboard.monthly.orders}
                          </th>

                          <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 sm:px-7">
                            {t.adminDashboard.monthly.revenue}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {monthlyRevenue.map((item, index) => {
                          const year = getValue(item, ["year"]);

                          const month = getValue(item, ["month"]);

                          const orderCount = getValue(item, [
                            "orderCount",
                            "orders",
                            "count",
                          ]);

                          const revenue = getValue(item, [
                            "revenue",
                            "totalRevenue",
                            "amount",
                          ]);

                          return (
                            <tr
                              key={`${year}-${month}-${index}`}
                              className="border-b border-neutral-100 last:border-b-0 transition-colors duration-200 hover:bg-neutral-50"
                            >
                              <td className="px-6 py-4 text-sm text-neutral-600 sm:px-7">
                                {year}
                              </td>

                              <td className="px-6 py-4 text-sm font-medium text-neutral-800">
                                {formatMonthFull(month)}
                              </td>

                              <td className="px-6 py-4 text-sm text-neutral-600">
                                {formatNumber(orderCount)}
                              </td>

                              <td className="px-6 py-4 text-right text-sm font-semibold text-neutral-950 sm:px-7">
                                {formatCurrency(revenue)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminTestPage;
