import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CustomSelect from "../components/CustomSelect.jsx";

import {
  deleteProductImage,
  getProductImages,
  uploadProductImage,
} from "../services/productImageService.js";

import api from "../services/api.js";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

const sortImages = (images) => {
  return [...images].sort((first, second) => {
    if (first.primary && !second.primary) {
      return -1;
    }

    if (!first.primary && second.primary) {
      return 1;
    }

    return Number(first.displayOrder || 0) - Number(second.displayOrder || 0);
  });
};

function AdminProductPage() {
  const { language } = useThemeLanguage();
  const t = translations[language];

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [editingImages, setEditingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [editingImagesLoading, setEditingImagesLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    brandId: "",
    categoryId: "",
  });

  const fetchData = useCallback(async () => {
    const [productsResponse, brandsResponse, categoriesResponse] =
      await Promise.all([
        api.get("/products"),
        api.get("/brands"),
        api.get("/categories"),
      ]);

    return {
      products: Array.isArray(productsResponse.data)
        ? productsResponse.data
        : productsResponse.data?.content || [],

      brands: Array.isArray(brandsResponse.data) ? brandsResponse.data : [],

      categories: Array.isArray(categoriesResponse.data)
        ? categoriesResponse.data
        : [],
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchData();

        if (cancelled) {
          return;
        }

        setProducts(data.products);
        setBrands(data.brands);
        setCategories(data.categories);
      } catch (err) {
        console.error("Không thể tải dữ liệu Product:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          translations[language].adminProducts.loadError;

        if (!cancelled) {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchData, language]);

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

  const loadImagesForEditor = useCallback(
    async (productId) => {
      try {
        setEditingImagesLoading(true);

        const imageData = await getProductImages(productId);
        const images = Array.isArray(imageData) ? sortImages(imageData) : [];

        setEditingImages(images);

        setProductImages((current) => ({
          ...current,
          [productId]: images[0]?.imageUrl || "",
        }));

        return images;
      } catch (err) {
        console.error("Không thể tải hình ảnh sản phẩm:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          t.adminProducts.imageLoadError;

        setError(message);

        return [];
      } finally {
        setEditingImagesLoading(false);
      }
    },
    [t.adminProducts.imageLoadError],
  );

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(t.adminProducts.fileReadError));

      reader.readAsDataURL(file);
    });
  };

  const handleImageSelection = async (event) => {
    const files = Array.from(event.target.files || []);

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const availableSlots = 8 - selectedImages.length;

    if (availableSlots <= 0) {
      setError(t.adminProducts.maxImagesSelection);
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);

    const invalidFiles = selectedFiles.filter(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024,
    );

    if (invalidFiles.length > 0) {
      setError(t.adminProducts.invalidImage);
    }

    const validFiles = selectedFiles.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length === 0) {
      return;
    }

    try {
      const previews = await Promise.all(
        validFiles.map(async (file) => ({
          file,
          previewUrl: await readFileAsDataUrl(file),
        })),
      );

      setSelectedImages((current) => [...current, ...previews]);
    } catch (err) {
      console.error("Không thể tạo preview ảnh:", err);
      setError(t.adminProducts.previewError);
    }
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleDeleteImage = async (image) => {
    if (!editingId) {
      return;
    }

    const confirmed = window.confirm(
      `${t.adminProducts.confirmDeleteImage} #${editingId}?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteProductImage(editingId, image.id);

      await loadImagesForEditor(editingId);

      setSuccess(t.adminProducts.imageDeleteSuccess);
    } catch (err) {
      console.error("Không thể xóa hình ảnh:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t.adminProducts.imageDeleteError;

      setError(message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleBrandChange = (value) => {
    setForm((current) => ({
      ...current,
      brandId: value,
    }));
  };

  const handleCategoryChange = (value) => {
    setForm((current) => ({
      ...current,
      categoryId: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setEditingImages([]);
    setSelectedImages([]);

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
    setSelectedImages([]);

    void loadImagesForEditor(product.id);

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
      setError(t.adminProducts.validation.nameRequired);
      return;
    }

    if (form.basePrice === "" || Number(form.basePrice) < 0) {
      setError(t.adminProducts.validation.priceInvalid);
      return;
    }

    if (!form.brandId) {
      setError(t.adminProducts.validation.brandRequired);
      return;
    }

    if (!form.categoryId) {
      setError(t.adminProducts.validation.categoryRequired);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice),
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
    };

    const filesToUpload = [...selectedImages];

    try {
      setSaving(true);

      let savedProductId = editingId;
      let createdProduct = null;

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        const response = await api.post("/products", payload);

        createdProduct = response.data;
        savedProductId = response.data?.id;
      }

      if (!savedProductId) {
        throw new Error(t.adminProducts.saveIdError);
      }

      let uploadedCount = 0;
      let failedCount = 0;

      if (filesToUpload.length > 0) {
        setImageUploading(true);

        for (const item of filesToUpload) {
          try {
            await uploadProductImage(savedProductId, item.file);
            uploadedCount += 1;
          } catch (err) {
            failedCount += 1;

            console.error(
              `Không thể tải ảnh lên cho sản phẩm #${savedProductId}:`,
              err,
            );
          }
        }

        setImageUploading(false);
      }

      const data = await fetchData();

      setProducts(data.products);
      setBrands(data.brands);
      setCategories(data.categories);

      setEditingId(savedProductId);
      setSelectedImages([]);

      if (createdProduct) {
        setForm({
          name: createdProduct.name || payload.name,
          description: createdProduct.description ?? payload.description,
          basePrice: createdProduct.basePrice ?? payload.basePrice,
          brandId: createdProduct.brandId ?? payload.brandId,
          categoryId: createdProduct.categoryId ?? payload.categoryId,
        });
      }

      await loadImagesForEditor(savedProductId);

      if (failedCount > 0) {
        setError(
          t.adminProducts.savePartialError
            .replace("{uploaded}", uploadedCount)
            .replace("{total}", filesToUpload.length)
            .replace("{failed}", failedCount),
        );

        setSuccess("");
      } else if (filesToUpload.length > 0) {
        setSuccess(
          editingId
            ? t.adminProducts.updateSuccessWithImages.replace(
                "{count}",
                uploadedCount,
              )
            : t.adminProducts.createSuccessWithImages.replace(
                "{count}",
                uploadedCount,
              ),
        );
      } else {
        setSuccess(
          editingId
            ? t.adminProducts.updateSuccess
            : t.adminProducts.createSuccess,
        );
      }
    } catch (err) {
      console.error("Không thể lưu sản phẩm:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t.adminProducts.saveError;

      setError(message);
    } finally {
      setImageUploading(false);
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `${t.adminProducts.confirmDeleteProduct} "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/products/${product.id}`);

      setSuccess(t.adminProducts.deleteSuccess.replace("{name}", product.name));

      if (editingId === product.id) {
        resetForm();
      }

      const data = await fetchData();

      setProducts(data.products);
      setBrands(data.brands);
      setCategories(data.categories);
    } catch (err) {
      console.error("Không thể xóa sản phẩm:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t.adminProducts.deleteError;

      setError(message);
    }
  };

  const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString(
      language === "en" ? "en-US" : "vi-VN",
    )} ₫`;
  };

  const brandOptions = [
    {
      value: "",
      label:
        t.adminProducts.form.selectBrand ||
        (language === "en" ? "Select brand" : "Chọn thương hiệu"),
      imageUrl: null,
    },
    ...brands.map((brand) => ({
      value: String(brand.id),
      label: brand.name,
      imageUrl: brand.imageUrl || null,
    })),
  ];

  const categoryOptions = [
    {
      value: "",
      label:
        t.adminProducts.form.selectCategory ||
        (language === "en" ? "Select category" : "Chọn danh mục"),
      imageUrl: null,
    },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.name,
      imageUrl: category.imageUrl || null,
    })),
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Page heading */}
        <div className="border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                {t.adminProducts.eyebrow}
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                {t.adminProducts.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                {t.adminProducts.description}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {t.adminProducts.productsLabel}
              </p>

              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {products.length} {t.adminProducts.productCount}
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
                  {editingId
                    ? t.adminProducts.form.editEyebrow
                    : t.adminProducts.form.newEyebrow}
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  {editingId
                    ? `${t.adminProducts.form.editTitle} #${editingId}`
                    : t.adminProducts.form.createTitle}
                </h2>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="self-start rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:text-neutral-950"
                >
                  {t.adminProducts.form.cancelEdit}
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
                {t.adminProducts.form.name}
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                maxLength={200}
                placeholder={t.adminProducts.form.namePlaceholder}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                {t.adminProducts.form.description}
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder={t.adminProducts.form.descriptionPlaceholder}
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="basePrice"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                {t.adminProducts.form.basePrice}
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
            <div className="relative">
              <label
                htmlFor="brandId"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                {t.adminProducts.form.brand}
              </label>

              <CustomSelect
                value={String(form.brandId ?? "")}
                onChange={handleBrandChange}
                options={brandOptions}
                placeholder={
                  language === "en" ? "Select brand" : "Chọn thương hiệu"
                }
              />
            </div>

            {/* Category */}
            <div className="relative">
              <label
                htmlFor="categoryId"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                {t.adminProducts.form.category}
              </label>

              <CustomSelect
                value={String(form.categoryId ?? "")}
                onChange={handleCategoryChange}
                options={categoryOptions}
                placeholder={
                  language === "en" ? "Select category" : "Chọn danh mục"
                }
              />
            </div>

            {/* Product Images */}
            <div className="md:col-span-2">
              <div className="rounded-[1.25rem] border border-neutral-200 bg-neutral-50/70 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                      {t.adminProducts.images.eyebrow}
                    </p>

                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                      {t.adminProducts.images.title}
                    </h3>

                    <p className="mt-2 max-w-2xl text-xs leading-6 text-neutral-500">
                      {t.adminProducts.images.description}
                    </p>
                  </div>

                  <label
                    htmlFor="productImages"
                    className={`inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:text-neutral-950 ${
                      saving || imageUploading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  >
                    {t.adminProducts.images.choose}
                  </label>

                  <input
                    id="productImages"
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={saving || imageUploading}
                    onChange={handleImageSelection}
                    className="sr-only"
                  />
                </div>

                {editingId && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        {t.adminProducts.images.uploaded}
                      </p>

                      {editingImagesLoading && (
                        <p className="text-[11px] text-neutral-400">
                          {t.adminProducts.images.loading}
                        </p>
                      )}
                    </div>

                    {editingImages.length === 0 && !editingImagesLoading ? (
                      <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center">
                        <p className="text-sm text-neutral-500">
                          {t.adminProducts.images.noImages}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {editingImages.map((image) => (
                          <div
                            key={image.id}
                            className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
                          >
                            <div className="aspect-square bg-neutral-100">
                              <img
                                src={image.imageUrl}
                                alt={`${form.name || t.adminProducts.defaultProduct} - ${t.adminProducts.images.image} ${image.id}`}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="space-y-2 p-2.5">
                              {image.primary && (
                                <span className="inline-flex rounded-full bg-neutral-950 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                                  {t.adminProducts.images.primary}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteImage(image)}
                                disabled={saving || imageUploading}
                                className="w-full rounded-lg border border-red-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {t.adminProducts.images.delete}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedImages.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                          {t.adminProducts.images.pending}
                        </p>

                        <p className="mt-1 text-[11px] text-neutral-400">
                          {selectedImages.length}{" "}
                          {t.adminProducts.images.selected}
                        </p>
                      </div>

                      {imageUploading && (
                        <p className="text-xs font-medium text-neutral-500">
                          {t.adminProducts.images.uploading}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {selectedImages.map((item, index) => (
                        <div
                          key={`${item.file.name}-${item.file.lastModified}-${index}`}
                          className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
                        >
                          <div className="aspect-square bg-neutral-100">
                            <img
                              src={item.previewUrl}
                              alt={`${t.adminProducts.images.preview} ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="p-2.5">
                            <p className="truncate text-[10px] font-medium text-neutral-700">
                              {item.file.name}
                            </p>

                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              disabled={saving || imageUploading}
                              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-neutral-600 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {t.adminProducts.images.remove}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                    ? imageUploading
                      ? t.adminProducts.form.savingWithImages
                      : t.adminProducts.form.saving
                    : editingId
                      ? t.adminProducts.form.update
                      : t.adminProducts.form.create}
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
                  {t.adminProducts.list.eyebrow}
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  {t.adminProducts.list.title}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                {imageLoading && (
                  <p className="text-xs text-neutral-400">
                    {t.adminProducts.images.loading}
                  </p>
                )}

                <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                  {products.length} {t.adminProducts.productCount}
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
              <p className="text-sm text-neutral-500">
                {t.adminProducts.list.empty}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="w-20 px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.adminProducts.list.id}
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.adminProducts.list.product}
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.adminProducts.list.brand}
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.adminProducts.list.category}
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.adminProducts.list.price}
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                        {t.adminProducts.list.actions}
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
                                  {product.description ||
                                    t.adminProducts.list.noDescription}
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

                          <td className="px-5 py-5 align-middle">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/products/${product.id}/variants`}
                                className="inline-flex h-12 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950"
                              >
                                {t.adminProducts.list.variants}
                              </Link>

                              <button
                                type="button"
                                onClick={() => startEdit(product)}
                                className="inline-flex h-12 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                              >
                                {t.adminProducts.list.edit}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(product)}
                                className="inline-flex h-12 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-xs font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50"
                              >
                                {t.adminProducts.list.delete}
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
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/products/${product.id}/variants`)
                          }
                          className="block w-full rounded-lg border border-neutral-200 bg-white py-2 text-center text-xs font-semibold leading-none text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950"
                        >
                          {t.adminProducts.list.variants}
                        </button>

                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="block w-full rounded-lg border border-neutral-200 bg-white py-2 text-center text-xs font-semibold leading-none text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                        >
                          {t.adminProducts.list.edit}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="block w-full rounded-lg border border-red-200 bg-white py-2 text-center text-xs font-semibold leading-none text-red-600 transition-all duration-200 hover:bg-red-50"
                        >
                          {t.adminProducts.list.delete}
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
