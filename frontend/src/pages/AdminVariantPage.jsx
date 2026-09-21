import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api.js";

function AdminVariantPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    sizeId: "",
    colorId: "",
    price: "",
    stock: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productResponse, variantsResponse, sizesResponse, colorsResponse] =
        await Promise.all([
          api.get(`/products/${productId}`),
          api.get(`/products/${productId}/variants`),
          api.get("/sizes"),
          api.get("/colors"),
        ]);

      setProduct(productResponse.data);

      setVariants(
        Array.isArray(variantsResponse.data)
          ? variantsResponse.data
          : variantsResponse.data?.content || [],
      );

      setSizes(Array.isArray(sizesResponse.data) ? sizesResponse.data : []);

      setColors(Array.isArray(colorsResponse.data) ? colorsResponse.data : []);
    } catch (err) {
      console.error("Không thể tải dữ liệu Variant:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể tải dữ liệu Variant.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      sizeId: "",
      colorId: "",
      price: "",
      stock: "",
    });
  };

  const startEdit = (variant) => {
    setEditingId(variant.id);

    setForm({
      sizeId: variant.sizeId ?? "",
      colorId: variant.colorId ?? "",
      price: variant.price ?? "",
      stock: variant.stock ?? "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.sizeId) {
      setError("Vui lòng chọn Size.");
      return;
    }

    if (!form.colorId) {
      setError("Vui lòng chọn Color.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Giá Variant phải lớn hơn hoặc bằng 0.");
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setError("Stock phải lớn hơn hoặc bằng 0.");
      return;
    }

    const payload = {
      productId: Number(productId),
      sizeId: Number(form.sizeId),
      colorId: Number(form.colorId),
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/variants/${editingId}`, payload);

        setSuccess("Cập nhật Variant thành công.");
      } else {
        await api.post(`/products/${productId}/variants`, payload);

        setSuccess("Thêm Variant thành công.");
      }

      resetForm();

      await loadData();
    } catch (err) {
      console.error("Không thể lưu Variant:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể lưu Variant.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString("vi-VN")} ₫`;
  };

  const getStockLabel = (stock) => {
    const value = Number(stock || 0);

    if (value === 0) {
      return "Hết hàng";
    }

    return `Còn ${value}`;
  };

  const getStockClass = (stock) => {
    const value = Number(stock || 0);

    if (value === 0) {
      return "border-red-200 bg-red-50 text-red-600";
    }

    if (value <= 5) {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  };

  const availableCount = variants.filter(
    (variant) => Number(variant.stock || 0) > 0,
  ).length;

  const outOfStockCount = variants.filter(
    (variant) => Number(variant.stock || 0) === 0,
  ).length;

  const totalStock = variants.reduce(
    (total, variant) => total + Number(variant.stock || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8">
          <Link
            to="/admin/products"
            className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            Quay lại quản lý sản phẩm
          </Link>

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                Admin Variants
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                Quản lý Variant
              </h1>

              {product && (
                <div className="mt-5">
                  <h2 className="truncate text-xl font-semibold text-neutral-950">
                    {product.name}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-400">
                    <span>
                      Product ID:{" "}
                      <span className="font-semibold text-neutral-600">
                        #{product.id}
                      </span>
                    </span>

                    <span>{variants.length} Variant</span>
                  </div>
                </div>
              )}
            </div>

            {product && !loading && (
              <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Variant
                  </p>

                  <p className="mt-1 text-lg font-semibold text-neutral-950">
                    {variants.length}
                  </p>
                </div>

                <div className="border-l border-neutral-100 px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Có hàng
                  </p>

                  <p className="mt-1 text-lg font-semibold text-neutral-950">
                    {availableCount}
                  </p>
                </div>

                <div className="border-l border-neutral-100 px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Tồn kho
                  </p>

                  <p className="mt-1 text-lg font-semibold text-neutral-950">
                    {totalStock}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        {(error || success) && (
          <div className="mt-6 space-y-3">
            {error && (
              <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm font-medium leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-5 py-4">
                <p className="text-sm font-medium leading-6 text-emerald-700">
                  {success}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="h-80 animate-pulse rounded-[1.5rem] bg-neutral-200" />

            <div className="h-80 animate-pulse rounded-[1.5rem] bg-neutral-200" />
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {/* Form */}
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                      {editingId ? "Edit Variant" : "New Variant"}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                      {editingId
                        ? `Đang sửa Variant #${editingId}`
                        : "Tạo Variant mới"}
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-neutral-400">
                      Mỗi Variant kết hợp một Size, một Color, giá và số lượng
                      tồn kho.
                    </p>
                  </div>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="self-start rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:text-neutral-950"
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid gap-5 px-6 py-7 sm:px-7 md:grid-cols-2 xl:grid-cols-4"
              >
                {/* Size */}
                <div>
                  <label
                    htmlFor="sizeId"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Size
                  </label>

                  <select
                    id="sizeId"
                    name="sizeId"
                    value={form.sizeId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
                  >
                    <option value="">-- Chọn Size --</option>

                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label
                    htmlFor="colorId"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Color
                  </label>

                  <select
                    id="colorId"
                    name="colorId"
                    value={form.colorId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
                  >
                    <option value="">-- Chọn Color --</option>

                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Giá Variant
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1000"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="1850000"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Stock
                  </label>

                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="group flex w-full items-center justify-between rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      {saving
                        ? "Đang lưu..."
                        : editingId
                          ? "Cập nhật Variant"
                          : "Thêm Variant"}
                    </span>

                    {!saving && (
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Variant list */}
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                      Variant List
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                      Danh sách Variant
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                      {variants.length} Variant
                    </span>

                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      {availableCount} có hàng
                    </span>

                    {outOfStockCount > 0 && (
                      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                        {outOfStockCount} hết hàng
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {variants.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-neutral-700">
                    Sản phẩm này chưa có Variant.
                  </p>

                  <p className="mt-2 text-xs text-neutral-400">
                    Hãy tạo Variant đầu tiên bằng form phía trên.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[900px] border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50">
                          <th className="w-20 px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            ID
                          </th>

                          <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            Size
                          </th>

                          <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            Color
                          </th>

                          <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            Giá
                          </th>

                          <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            Stock
                          </th>

                          <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            Thao tác
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {variants.map((variant) => (
                          <tr
                            key={variant.id}
                            className="group border-b border-neutral-100 last:border-b-0 transition-colors duration-200 hover:bg-neutral-50/70"
                          >
                            <td className="px-5 py-5 text-sm font-medium text-neutral-400">
                              #{variant.id}
                            </td>

                            <td className="px-5 py-5">
                              <span className="inline-flex min-w-14 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900">
                                {variant.sizeName || variant.sizeId}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-7 w-7 shrink-0 rounded-full border border-neutral-300 shadow-inner"
                                  style={{
                                    backgroundColor:
                                      variant.colorHexCode || "#FFFFFF",
                                  }}
                                />

                                <div>
                                  <p className="text-sm font-medium text-neutral-800">
                                    {variant.colorName || variant.colorId}
                                  </p>

                                  {variant.colorHexCode && (
                                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-neutral-400">
                                      {variant.colorHexCode}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5 text-sm font-semibold text-neutral-950">
                              {formatPrice(variant.price)}
                            </td>

                            <td className="px-5 py-5">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStockClass(
                                  variant.stock,
                                )}`}
                              >
                                {getStockLabel(variant.stock)}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => startEdit(variant)}
                                  className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                                >
                                  Sửa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile / tablet */}
                  <div className="grid gap-4 p-5 lg:hidden">
                    {variants.map((variant) => (
                      <article
                        key={variant.id}
                        className="overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                                Variant #{variant.id}
                              </p>

                              <div className="mt-3 flex items-center gap-3">
                                <span className="inline-flex min-w-14 items-center justify-center rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-900">
                                  {variant.sizeName || variant.sizeId}
                                </span>

                                <span
                                  className="h-7 w-7 rounded-full border border-neutral-300"
                                  style={{
                                    backgroundColor:
                                      variant.colorHexCode || "#FFFFFF",
                                  }}
                                />

                                <span className="text-sm font-medium text-neutral-800">
                                  {variant.colorName || variant.colorId}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStockClass(
                                variant.stock,
                              )}`}
                            >
                              {getStockLabel(variant.stock)}
                            </span>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-neutral-50 p-4">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                                Giá
                              </p>

                              <p className="mt-1 text-sm font-semibold text-neutral-950">
                                {formatPrice(variant.price)}
                              </p>
                            </div>

                            <div className="rounded-xl bg-neutral-50 p-4">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                                Stock
                              </p>

                              <p className="mt-1 text-sm font-semibold text-neutral-950">
                                {Number(variant.stock || 0)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-neutral-100 p-4">
                          <button
                            type="button"
                            onClick={() => startEdit(variant)}
                            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                          >
                            Sửa Variant
                          </button>
                        </div>
                      </article>
                    ))}
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

export default AdminVariantPage;
