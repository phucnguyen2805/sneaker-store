import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api.js";

function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    brandId: "",
    categoryId: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, brandsResponse, categoriesResponse] =
        await Promise.all([
          api.get("/products"),
          api.get("/brands"),
          api.get("/categories"),
        ]);

      setProducts(productsResponse.data);
      setBrands(brandsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error("Không thể tải dữ liệu Product:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể tải dữ liệu sản phẩm.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      name: "",
      description: "",
      basePrice: "",
      brandId: "",
      categoryId: "",
    });
  };

  const startEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      basePrice: product.basePrice ?? "",
      brandId: product.brandId ?? "",
      categoryId: product.categoryId ?? "",
    });

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Tên sản phẩm không được để trống.");
      return;
    }

    if (form.basePrice === "" || Number(form.basePrice) < 0) {
      setError("Giá cơ bản phải lớn hơn hoặc bằng 0.");
      return;
    }

    if (!form.brandId) {
      setError("Vui lòng chọn Brand.");
      return;
    }

    if (!form.categoryId) {
      setError("Vui lòng chọn Category.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice),
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);

        setSuccess("Cập nhật sản phẩm thành công.");
      } else {
        await api.post("/products", payload);

        setSuccess("Thêm sản phẩm thành công.");
      }

      resetForm();

      await loadData();
    } catch (err) {
      console.error("Không thể lưu sản phẩm:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể lưu sản phẩm.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/products/${product.id}`);

      setSuccess(`Đã xóa sản phẩm "${product.name}".`);

      if (editingId === product.id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      console.error("Không thể xóa sản phẩm:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể xóa sản phẩm.";

      setError(message);
    }
  };

  const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString("vi-VN")} ₫`;
  };

  return (
    <section className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Admin Products
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-950">
            Quản lý sản phẩm
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-500">
            Thêm, chỉnh sửa và xóa các sản phẩm sneaker trong hệ thống.
          </p>
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

        <div className="mb-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                {editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
              </p>

              <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                {editingId
                  ? `Đang sửa sản phẩm #${editingId}`
                  : "Tạo sản phẩm mới"}
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

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-neutral-700"
              >
                Tên sản phẩm
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                maxLength={200}
                placeholder="Ví dụ: Nike Air Force 1"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-neutral-700"
              >
                Mô tả
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Mô tả sản phẩm..."
                className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <div>
              <label
                htmlFor="basePrice"
                className="mb-2 block text-sm font-semibold text-neutral-700"
              >
                Giá cơ bản
              </label>

              <input
                id="basePrice"
                name="basePrice"
                type="number"
                min="0"
                step="1000"
                value={form.basePrice}
                onChange={handleChange}
                placeholder="1900000"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <div>
              <label
                htmlFor="brandId"
                className="mb-2 block text-sm font-semibold text-neutral-700"
              >
                Brand
              </label>

              <select
                id="brandId"
                name="brandId"
                value={form.brandId}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">-- Chọn Brand --</option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="categoryId"
                className="mb-2 block text-sm font-semibold text-neutral-700"
              >
                Category
              </label>

              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">-- Chọn Category --</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập nhật sản phẩm"
                    : "Thêm sản phẩm"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-neutral-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Product List
              </p>

              <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                Danh sách sản phẩm
              </h2>
            </div>

            <p className="text-sm text-neutral-500">
              {products.length} sản phẩm
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-neutral-500">
                Đang tải danh sách sản phẩm...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-neutral-500">Chưa có sản phẩm nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      ID
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      Sản phẩm
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      Brand
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                      Giá
                    </th>

                    <th className="px-5 py-4 text-right text-sm font-semibold text-neutral-500">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-neutral-100 last:border-b-0"
                    >
                      <td className="px-5 py-4 text-sm text-neutral-500">
                        #{product.id}
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-neutral-950">
                            {product.name}
                          </p>

                          <p className="mt-1 max-w-md truncate text-sm text-neutral-500">
                            {product.description || "Không có mô tả"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        {product.brandName || product.brandId}
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        {product.categoryName || product.categoryId}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-neutral-950">
                        {formatPrice(product.basePrice)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/products/${product.id}/variants`}
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50"
                          >
                            Variants
                          </Link>

                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:bg-neutral-50"
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50"
                          >
                            Xóa
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
    </section>
  );
}

export default AdminProductPage;
