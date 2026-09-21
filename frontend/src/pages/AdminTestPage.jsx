import { useEffect, useState } from "react";
import api from "../services/api.js";

function AdminTestPage() {
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
          "Không thể tải dữ liệu thống kê.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("vi-VN");
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

  return (
    <section className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Admin Dashboard
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-neutral-950">
            Tổng quan hệ thống
          </h1>

          <p className="max-w-2xl text-base leading-7 text-neutral-500">
            Theo dõi nhanh tình hình sản phẩm, biến thể, đơn hàng và doanh thu
            của Sneaker Store.
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-neutral-500">
              Đang tải dữ liệu dashboard...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-700">
              Không thể tải dashboard
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && statistics && (
          <div className="space-y-8">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-sm font-medium text-neutral-500">
                  Tổng sản phẩm
                </p>

                <p className="mt-4 text-3xl font-bold tracking-tight text-neutral-950">
                  {formatNumber(totalProducts)}
                </p>

                <p className="mt-2 text-sm text-neutral-400">
                  Các mẫu sneaker hiện có
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-sm font-medium text-neutral-500">
                  Tổng variants
                </p>

                <p className="mt-4 text-3xl font-bold tracking-tight text-neutral-950">
                  {formatNumber(totalVariants)}
                </p>

                <p className="mt-2 text-sm text-neutral-400">
                  Size và màu sắc sản phẩm
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-sm font-medium text-neutral-500">
                  Tổng đơn hàng
                </p>

                <p className="mt-4 text-3xl font-bold tracking-tight text-neutral-950">
                  {formatNumber(totalOrders)}
                </p>

                <p className="mt-2 text-sm text-neutral-400">
                  Tất cả đơn hàng trong hệ thống
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="text-sm font-medium text-neutral-500">
                  Doanh thu hoàn thành
                </p>

                <p className="mt-4 text-3xl font-bold tracking-tight text-neutral-950">
                  {formatCurrency(completedRevenue)}
                </p>

                <p className="mt-2 text-sm text-neutral-400">
                  Tổng doanh thu từ đơn hoàn thành
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">
                      Trạng thái đơn hàng
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                      Tổng quan đơn hàng
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-neutral-50 p-5">
                    <p className="text-sm text-neutral-500">Chờ xử lý</p>

                    <p className="mt-2 text-2xl font-bold text-neutral-950">
                      {formatNumber(pendingOrders)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-5">
                    <p className="text-sm text-neutral-500">Đã xác nhận</p>

                    <p className="mt-2 text-2xl font-bold text-neutral-950">
                      {formatNumber(confirmedOrders)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-5">
                    <p className="text-sm text-neutral-500">Hoàn thành</p>

                    <p className="mt-2 text-2xl font-bold text-neutral-950">
                      {formatNumber(completedOrders)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-5">
                    <p className="text-sm text-neutral-500">Đã hủy</p>

                    <p className="mt-2 text-2xl font-bold text-neutral-950">
                      {formatNumber(cancelledOrders)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-neutral-500">
                  Doanh thu
                </p>

                <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                  Tình hình kinh doanh
                </h2>

                <div className="mt-6 rounded-2xl bg-neutral-950 p-6 text-white">
                  <p className="text-sm text-neutral-300">
                    Doanh thu đơn hoàn thành
                  </p>

                  <p className="mt-3 text-3xl font-bold">
                    {formatCurrency(completedRevenue)}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-6 text-neutral-500">
                  Số liệu được lấy trực tiếp từ API thống kê dành cho tài khoản
                  ADMIN.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm font-medium text-neutral-500">
                  Monthly Revenue
                </p>

                <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                  Doanh thu theo tháng
                </h2>
              </div>

              {monthlyRevenue.length === 0 ? (
                <div className="rounded-2xl bg-neutral-50 p-8 text-center">
                  <p className="text-sm text-neutral-500">
                    Chưa có dữ liệu doanh thu theo tháng.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 text-left">
                        <th className="px-4 py-3 text-sm font-semibold text-neutral-500">
                          Năm
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold text-neutral-500">
                          Tháng
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold text-neutral-500">
                          Đơn hàng
                        </th>

                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-500">
                          Doanh thu
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
                            className="border-b border-neutral-100 last:border-b-0"
                          >
                            <td className="px-4 py-4 text-sm text-neutral-700">
                              {year}
                            </td>

                            <td className="px-4 py-4 text-sm text-neutral-700">
                              {month}
                            </td>

                            <td className="px-4 py-4 text-sm text-neutral-700">
                              {formatNumber(orderCount)}
                            </td>

                            <td className="px-4 py-4 text-right text-sm font-semibold text-neutral-950">
                              {formatCurrency(revenue)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminTestPage;
