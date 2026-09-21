import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProductImages } from "../services/productDetailService.js";
import api from "../services/api.js";

function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productImages, setProductImages] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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

      setProducts(
        Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.content || [],
      );

      setBrands(Array.isArray(brandsResponse.data) ? brandsResponse.data : []);

      setCategories(
        Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [],
      );
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

  useEffect(() => {
    let active = true;

    const loadProductImages = async () => {
      if (products.length === 0) {
        setProductImages({});
        setImageLoading(false);
        return;
      }

      try {
        setImageLoading(true);

        const results = await Promise.all(
          products.map(async (product) => {
            try {
              const imageData = await getProductImages(product.id);

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
                productId: product.id,
                imageUrl: images[0]?.imageUrl || "",
              };
            } catch {
              return {
                productId: product.id,
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
  }, [products]);

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
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Page heading */}
        <div className="border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                Admin Products
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                Quản lý sản phẩm
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                Thêm, chỉnh sửa và xóa sản phẩm sneaker trong hệ thống.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Products
              </p>

              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {products.length} sản phẩm
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}
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

        {/* Product form */}
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {editingId ? "Edit Product" : "New Product"}
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  {editingId
                    ? `Đang sửa sản phẩm #${editingId}`
                    : "Tạo sản phẩm mới"}
                </h2>
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
            className="grid gap-5 px-6 py-7 sm:px-7 md:grid-cols-2"
          >
            {/* Name */}
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
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
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
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
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="basePrice"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
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
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            {/* Brand */}
            <div>
              <label
                htmlFor="brandId"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                Brand
              </label>

              <select
                id="brandId"
                name="brandId"
                value={form.brandId}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              >
                <option value="">-- Chọn Brand --</option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="categoryId"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                Category
              </label>

              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              >
                <option value="">-- Chọn Category --</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="group flex w-full items-center justify-between rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>
                  {saving
                    ? "Đang lưu..."
                    : editingId
                      ? "Cập nhật sản phẩm"
                      : "Thêm sản phẩm"}
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

        {/* Product list */}
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  Product List
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  Danh sách sản phẩm
                </h2>
              </div>

              <div className="flex items-center gap-4">
                {imageLoading && (
                  <p className="text-xs text-neutral-400">
                    Đang tải hình ảnh...
                  </p>
                )}

                <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                  {products.length} sản phẩm
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[1.25rem] border border-neutral-200"
                >
                  <div className="aspect-[4/3] animate-pulse bg-neutral-100" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
                    <div className="h-5 w-4/5 animate-pulse rounded bg-neutral-100" />
                    <div className="h-3 w-28 animate-pulse rounded bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-neutral-500">Chưa có sản phẩm nào.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="w-20 px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        ID
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Sản phẩm
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Brand
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Category
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Giá
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => {
                      const imageUrl = productImages[product.id];

                      return (
                        <tr
                          key={product.id}
                          className="group border-b border-neutral-100 last:border-b-0 transition-colors duration-200 hover:bg-neutral-50/70"
                        >
                          <td className="px-5 py-5 text-sm font-medium text-neutral-400">
                            #{product.id}
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-4">
                              <div className="motion-image flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                                  />
                                ) : (
                                  <span className="px-1 text-center text-[8px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                                    Sneaker
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-neutral-950">
                                  {product.name}
                                </p>

                                <p className="mt-1 max-w-md truncate text-xs text-neutral-400">
                                  {product.description || "Không có mô tả"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5 text-sm text-neutral-600">
                            {product.brandName || product.brandId}
                          </td>

                          <td className="px-5 py-5 text-sm text-neutral-600">
                            {product.categoryName || product.categoryId}
                          </td>

                          <td className="px-5 py-5 text-sm font-semibold text-neutral-950">
                            {formatPrice(product.basePrice)}
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex justify-end gap-2">
                              <Link
                                to={`/admin/products/${product.id}/variants`}
                                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950"
                              >
                                Variants
                              </Link>

                              <button
                                type="button"
                                onClick={() => startEdit(product)}
                                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                              >
                                Sửa
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(product)}
                                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="grid gap-4 p-5 lg:hidden">
                {products.map((product) => {
                  const imageUrl = productImages[product.id];

                  return (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="motion-image flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.05]"
                            />
                          ) : (
                            <span className="px-1 text-center text-[8px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                              Sneaker
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[10px] font-medium text-neutral-400">
                              #{product.id}
                            </span>

                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[9px] font-semibold text-neutral-600">
                              {product.brandName || product.brandId}
                            </span>
                          </div>

                          <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-5 text-neutral-950">
                            {product.name}
                          </h3>

                          <p className="mt-2 text-xs text-neutral-400">
                            {product.categoryName || product.categoryId}
                          </p>

                          <p className="mt-3 text-sm font-semibold text-neutral-950">
                            {formatPrice(product.basePrice)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 p-4">
                        <Link
                          to={`/admin/products/${product.id}/variants`}
                          className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-center text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950"
                        >
                          Variants
                        </Link>

                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 transition-all duration-200 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminProductPage;
