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
      setVariants(variantsResponse.data);
      setSizes(sizesResponse.data);
      setColors(colorsResponse.data);
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

    if (value <= 5) {
      return `Còn ${value}`;
    }

    return `Còn ${value}`;
  };

  const getStockClass = (stock) => {
    const value = Number(stock || 0);

    if (value === 0) {
      return "bg-red-50 text-red-600";
    }

    if (value <= 5) {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-green-50 text-green-700";
  };

  return (
    <section className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            to="/admin/products"
            className="text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
          >
            ← Quay lại quản lý sản phẩm
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Admin Variants
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-950">
            Quản lý Variant
          </h1>

          {product && (
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Sản phẩm
              </p>

              <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                {product.name}
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Product ID: #{product.id}
              </p>
            </div>
          )}
        </div>

        {(error || success) && (
          <div className="mb-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
                <p className="text-sm font-medium text-green-700">{success}</p>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-neutral-500">
              Đang tải dữ liệu Variant...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    {editingId ? "Chỉnh sửa Variant" : "Thêm Variant"}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                    {editingId
                      ? `Đang sửa Variant #${editingId}`
                      : "Tạo Variant mới"}
                  </h2>
                </div>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
              >
                <div>
                  <label
                    htmlFor="sizeId"
                    className="mb-2 block text-sm font-semibold text-neutral-700"
                  >
                    Size
                  </label>

                  <select
                    id="sizeId"
                    name="sizeId"
                    value={form.sizeId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="">-- Chọn Size --</option>

                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="colorId"
                    className="mb-2 block text-sm font-semibold text-neutral-700"
                  >
                    Color
                  </label>

                  <select
                    id="colorId"
                    name="colorId"
                    value={form.colorId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="">-- Chọn Color --</option>

                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-neutral-700"
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
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block text-sm font-semibold text-neutral-700"
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
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Đang lưu..."
                      : editingId
                        ? "Cập nhật Variant"
                        : "Thêm Variant"}
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-neutral-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Variant List
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                    Danh sách Variant
                  </h2>
                </div>

                <p className="text-sm text-neutral-500">
                  {variants.length} Variant
                </p>
              </div>

              {variants.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-neutral-500">
                    Sản phẩm này chưa có Variant.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                        <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                          ID
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                          Size
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                          Color
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                          Giá
                        </th>

                        <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                          Stock
                        </th>

                        <th className="px-5 py-4 text-right text-sm font-semibold text-neutral-500">
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {variants.map((variant) => (
                        <tr
                          key={variant.id}
                          className="border-b border-neutral-100 last:border-b-0"
                        >
                          <td className="px-5 py-4 text-sm text-neutral-500">
                            #{variant.id}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-neutral-900">
                            {variant.sizeName || variant.sizeId}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {variant.colorHexCode && (
                                <span
                                  className="h-6 w-6 rounded-full border border-neutral-300"
                                  style={{
                                    backgroundColor: variant.colorHexCode,
                                  }}
                                />
                              )}

                              <span className="text-sm text-neutral-700">
                                {variant.colorName || variant.colorId}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-neutral-950">
                            {formatPrice(variant.price)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStockClass(
                                variant.stock,
                              )}`}
                            >
                              {getStockLabel(variant.stock)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => startEdit(variant)}
                                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50"
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
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminVariantPage;
