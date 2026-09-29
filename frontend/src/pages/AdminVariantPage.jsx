import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import CustomSelect from "../components/CustomSelect.jsx";

import api from "../services/api.js";
import { createColor, createSize } from "../services/adminOptionService.js";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

function AdminVariantPage() {
  const { productId } = useParams();

  const { language } = useThemeLanguage();
  const t = translations[language];

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteVariant, setDeleteVariant] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    sizeId: "",
    colorId: "",
    price: "",
    stock: "",
  });

  // =========================================================
  // SIZE / COLOR MANAGEMENT
  // =========================================================

  const [newSizeName, setNewSizeName] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  const [addingSize, setAddingSize] = useState(false);
  const [addingColor, setAddingColor] = useState(false);

  const fetchData = useCallback(async () => {
    const [productResponse, variantsResponse, sizesResponse, colorsResponse] =
      await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/products/${productId}/variants`),
        api.get("/sizes"),
        api.get("/colors"),
      ]);

    return {
      product: productResponse.data,

      variants: Array.isArray(variantsResponse.data)
        ? variantsResponse.data
        : variantsResponse.data?.content || [],

      sizes: Array.isArray(sizesResponse.data) ? sizesResponse.data : [],

      colors: Array.isArray(colorsResponse.data) ? colorsResponse.data : [],
    };
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchData();

        if (cancelled) {
          return;
        }

        setProduct(data.product);
        setVariants(data.variants);
        setSizes(data.sizes);
        setColors(data.colors);
      } catch (err) {
        console.error("Không thể tải dữ liệu Variant:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          t.adminVariants.loadError;

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
  }, [fetchData, productId, language, t.adminVariants.loadError]);

  // =========================================================
  // FORM VARIANT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSizeChange = (value) => {
    setForm((current) => ({
      ...current,
      sizeId: value,
    }));
  };

  const handleColorChange = (value) => {
    setForm((current) => ({
      ...current,
      colorId: value,
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

  // =========================================================
  // ADD SIZE
  // =========================================================

  const handleCreateSize = async (event) => {
    event.preventDefault();

    const name = newSizeName.trim();

    if (!name) {
      setError(t.adminVariants.validation.sizeRequired);
      setSuccess("");
      return;
    }

    try {
      setAddingSize(true);
      setError("");
      setSuccess("");

      const createdSize = await createSize(name);

      setSizes((currentSizes) => {
        const nextSizes = [...currentSizes, createdSize];

        return nextSizes.sort((first, second) =>
          String(first.name).localeCompare(String(second.name), undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        );
      });

      setNewSizeName("");

      setSuccess(
        t.adminVariants.success.sizeCreated.replace("{name}", createdSize.name),
      );
    } catch (err) {
      console.error("Không thể thêm Size:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t.adminVariants.errors.sizeCreate;

      setError(message);
    } finally {
      setAddingSize(false);
    }
  };

  // =========================================================
  // ADD COLOR
  // =========================================================

  const colorPalette = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Gray", hex: "#808080" },
    { name: "Red", hex: "#EF4444" },
    { name: "Orange", hex: "#F97316" },
    { name: "Yellow", hex: "#EAB308" },
    { name: "Green", hex: "#22C55E" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Navy", hex: "#1E3A8A" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Pink", hex: "#EC4899" },
    { name: "Brown", hex: "#92400E" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "Cream", hex: "#FFFDD0" },
    { name: "Olive", hex: "#808000" },
    { name: "Burgundy", hex: "#800020" },
  ];

  const handleCreateColor = async (event) => {
    event.preventDefault();

    const name = newColorName.trim();
    const hexCode = newColorHex.trim().toUpperCase();

    if (!name) {
      setError(t.adminVariants.validation.colorRequired);
      setSuccess("");
      return;
    }

    if (!/^#[0-9A-F]{6}$/.test(hexCode)) {
      setError(t.adminVariants.validation.hexInvalid);
      setSuccess("");
      return;
    }

    try {
      setAddingColor(true);
      setError("");
      setSuccess("");

      const createdColor = await createColor(name, hexCode);

      setColors((currentColors) => {
        const nextColors = [...currentColors, createdColor];

        return nextColors.sort((first, second) =>
          String(first.name).localeCompare(String(second.name), undefined, {
            sensitivity: "base",
          }),
        );
      });

      setNewColorName("");
      setNewColorHex("#000000");

      setSuccess(
        t.adminVariants.success.colorCreated.replace(
          "{name}",
          createdColor.name,
        ),
      );
    } catch (err) {
      console.error("Không thể thêm Color:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t.adminVariants.errors.colorCreate;

      setError(message);
    } finally {
      setAddingColor(false);
    }
  };

  // =========================================================
  // SAVE VARIANT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.sizeId) {
      setError(t.adminVariants.validation.selectSize);
      return;
    }

    if (!form.colorId) {
      setError(t.adminVariants.validation.selectColor);
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError(t.adminVariants.validation.priceInvalid);
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setError(t.adminVariants.validation.stockInvalid);
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

        setSuccess(t.adminVariants.success.variantUpdated);
      } else {
        await api.post(`/products/${productId}/variants`, payload);

        setSuccess(t.adminVariants.success.variantCreated);
      }

      resetForm();

      const data = await fetchData();

      setProduct(data.product);
      setVariants(data.variants);
      setSizes(data.sizes);
      setColors(data.colors);
    } catch (err) {
      console.error("Không thể lưu Variant:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t.adminVariants.errors.variantSave;

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FORMAT / STOCK
  // =========================================================

  const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString(
      language === "en" ? "en-US" : "vi-VN",
    )} ₫`;
  };

  const getStockLabel = (stock) => {
    const value = Number(stock || 0);

    if (value === 0) {
      return t.adminVariants.stock.outOfStock;
    }

    if (language === "en") {
      return `${value} available`;
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

  // =========================================================
  // DELETE VARIANT
  // =========================================================

  const handleDeleteClick = (variant) => {
    setError("");
    setSuccess("");
    setDeleteVariant(variant);
  };

  const handleConfirmDelete = async () => {
    if (!deleteVariant) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(`/variants/${deleteVariant.id}`);

      setVariants((currentVariants) =>
        currentVariants.filter((variant) => variant.id !== deleteVariant.id),
      );

      setDeleteVariant(null);

      if (editingId === deleteVariant.id) {
        resetForm();
      }

      setSuccess(
        t.adminVariants.success.variantDeleted.replace(
          "{id}",
          deleteVariant.id,
        ),
      );
    } catch (err) {
      console.error("Không thể xóa Variant:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t.adminVariants.errors.variantDelete;

      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // CUSTOM SELECT OPTIONS
  // =========================================================

  const sizeOptions = [
    {
      value: "",
      label: t.adminVariants.form.selectSize,
    },
    ...sizes.map((size) => ({
      value: String(size.id),
      label: size.name,
    })),
  ];

  const colorOptions = [
    {
      value: "",
      label: t.adminVariants.form.selectColor,
    },
    ...colors.map((color) => ({
      value: String(color.id),
      label: color.name,
    })),
  ];

  // =========================================================
  // RENDER
  // =========================================================

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

            {t.adminVariants.backToProducts}
          </Link>

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                {t.adminVariants.eyebrow}
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                {t.adminVariants.title}
              </h1>

              {product && (
                <div className="mt-5">
                  <h2 className="truncate text-xl font-semibold text-neutral-950">
                    {product.name}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-400">
                    <span>
                      {t.adminVariants.productId}:{" "}
                      <span className="font-semibold text-neutral-600">
                        #{product.id}
                      </span>
                    </span>

                    <span>
                      {variants.length} {t.adminVariants.variantCount}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {product && !loading && (
              <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {t.adminVariants.stats.variants}
                  </p>

                  <p className="mt-1 text-lg font-semibold text-neutral-950">
                    {variants.length}
                  </p>
                </div>

                <div className="border-l border-neutral-100 px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {t.adminVariants.stats.available}
                  </p>

                  <p className="mt-1 text-lg font-semibold text-neutral-950">
                    {availableCount}
                  </p>
                </div>

                <div className="border-l border-neutral-100 px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {t.adminVariants.stats.stock}
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
            {/* Size & Color Management */}
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {t.adminVariants.options.eyebrow}
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  {t.adminVariants.options.title}
                </h2>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-neutral-400">
                  {t.adminVariants.options.description}
                </p>
              </div>

              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-2">
                {/* Add Size */}
                <form
                  onSubmit={handleCreateSize}
                  className="rounded-[1.25rem] border border-neutral-200 bg-neutral-50/70 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                        Size
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-neutral-950">
                        {t.adminVariants.size.title}
                      </h3>
                    </div>

                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-semibold text-neutral-500">
                      {sizes.length} {t.adminVariants.size.count}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={newSizeName}
                      onChange={(event) => setNewSizeName(event.target.value)}
                      placeholder={t.adminVariants.size.placeholder}
                      maxLength={20}
                      className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm text-neutral-950 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-100"
                    />

                    <button
                      type="submit"
                      disabled={addingSize}
                      className="rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold !text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {addingSize
                        ? t.adminVariants.actions.adding
                        : t.adminVariants.size.add}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <span
                        key={size.id}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700"
                      >
                        {size.name}
                      </span>
                    ))}
                  </div>
                </form>

                {/* Add Color */}
                <form
                  onSubmit={handleCreateColor}
                  className="rounded-[1.25rem] border border-neutral-200 bg-neutral-50/70 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                        Color
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-neutral-950">
                        {t.adminVariants.color.title}
                      </h3>
                    </div>

                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-semibold text-neutral-500">
                      {colors.length} {t.adminVariants.color.count}
                    </span>
                  </div>

                  {/* Tên màu */}
                  <div className="mt-5">
                    <label
                      htmlFor="newColorName"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                    >
                      {t.adminVariants.color.name}
                    </label>

                    <input
                      id="newColorName"
                      type="text"
                      value={newColorName}
                      onChange={(event) => setNewColorName(event.target.value)}
                      placeholder={t.adminVariants.color.placeholder}
                      maxLength={50}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm text-neutral-950 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-100"
                    />
                  </div>

                  {/* Bảng chọn màu */}
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        {t.adminVariants.color.palette}
                      </label>

                      <span className="text-xs font-medium text-neutral-400">
                        {newColorHex.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                      {colorPalette.map((color) => {
                        const isSelected =
                          newColorHex.toUpperCase() === color.hex.toUpperCase();

                        return (
                          <button
                            key={color.hex}
                            type="button"
                            title={`${color.name} - ${color.hex}`}
                            onClick={() => {
                              setNewColorHex(color.hex);

                              if (!newColorName.trim()) {
                                setNewColorName(color.name);
                              }
                            }}
                            className={`group relative aspect-square rounded-xl border-2 p-1 transition-all duration-200 ${
                              isSelected
                                ? "border-neutral-950 ring-2 ring-neutral-200"
                                : "border-transparent hover:-translate-y-0.5 hover:border-neutral-300"
                            }`}
                          >
                            <span
                              className="block h-full w-full rounded-lg border border-black/10"
                              style={{
                                backgroundColor: color.hex,
                              }}
                            />

                            {isSelected && (
                              <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/10">
                                <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)]" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hex + preview */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div>
                      <label
                        htmlFor="newColorHex"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                      >
                        {t.adminVariants.color.hex}
                      </label>

                      <input
                        id="newColorHex"
                        type="text"
                        value={newColorHex}
                        onChange={(event) =>
                          setNewColorHex(event.target.value.toUpperCase())
                        }
                        placeholder="#FFFDD0"
                        maxLength={7}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm uppercase text-neutral-950 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-100"
                      />
                    </div>

                    <div className="flex items-end">
                      <div
                        className="h-[52px] w-[52px] rounded-xl border border-neutral-300 shadow-inner"
                        style={{
                          backgroundColor: /^#[0-9A-F]{6}$/.test(newColorHex)
                            ? newColorHex
                            : "#FFFFFF",
                        }}
                        title={t.adminVariants.color.preview}
                      />
                    </div>
                  </div>

                  {/* Add button */}
                  <button
                    type="submit"
                    disabled={addingColor}
                    className="mt-5 w-full rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold !text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingColor
                      ? t.adminVariants.actions.adding
                      : t.adminVariants.color.add}
                  </button>

                  {/* Existing colors */}
                  <div className="mt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      {t.adminVariants.color.existing}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <div
                          key={color.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2"
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-neutral-300"
                            style={{
                              backgroundColor: color.hexCode || "#FFFFFF",
                            }}
                          />

                          <span className="text-xs font-semibold text-neutral-700">
                            {color.name}
                          </span>

                          {color.hexCode && (
                            <span className="text-[10px] uppercase text-neutral-400">
                              {color.hexCode}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Variant Form */}
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                      {editingId
                        ? t.adminVariants.form.editEyebrow
                        : t.adminVariants.form.newEyebrow}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                      {editingId
                        ? `${t.adminVariants.form.editTitle} #${editingId}`
                        : t.adminVariants.form.createTitle}
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-neutral-400">
                      {t.adminVariants.form.description}
                    </p>
                  </div>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="self-start rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:text-neutral-950"
                    >
                      {t.adminVariants.form.cancelEdit}
                    </button>
                  )}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid gap-5 px-6 py-7 sm:px-7 md:grid-cols-2 xl:grid-cols-4"
              >
                {/* Size */}
                <div className="relative">
                  <label
                    htmlFor="sizeId"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Size
                  </label>

                  <CustomSelect
                    value={String(form.sizeId ?? "")}
                    onChange={handleSizeChange}
                    options={sizeOptions}
                    placeholder={
                      language === "en" ? "Select size" : "Chọn size"
                    }
                    disabled={saving}
                  />
                </div>

                {/* Color */}
                <div className="relative">
                  <label
                    htmlFor="colorId"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Color
                  </label>

                  <CustomSelect
                    value={String(form.colorId ?? "")}
                    onChange={handleColorChange}
                    options={colorOptions}
                    placeholder={
                      language === "en" ? "Select color" : "Chọn màu"
                    }
                    disabled={saving}
                  />
                </div>

                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    {t.adminVariants.form.price}
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
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={saving}
                  />
                </div>

                {/* Stock */}
                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
                  >
                    {t.adminVariants.form.stock}
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
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={saving}
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="group flex w-full items-center justify-between rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      {saving
                        ? t.adminVariants.actions.saving
                        : editingId
                          ? t.adminVariants.form.update
                          : t.adminVariants.form.create}
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

            {/* Variant List */}
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <div className="border-b border-neutral-100 px-6 py-6 sm:px-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                      {t.adminVariants.list.eyebrow}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                      {t.adminVariants.list.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                      {variants.length} {t.adminVariants.variantCount}
                    </span>

                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      {availableCount} {t.adminVariants.list.available}
                    </span>

                    {outOfStockCount > 0 && (
                      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                        {outOfStockCount} {t.adminVariants.list.outOfStock}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {variants.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-neutral-700">
                    {t.adminVariants.list.emptyTitle}
                  </p>

                  <p className="mt-2 text-xs text-neutral-400">
                    {t.adminVariants.list.emptyDescription}
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
                            {t.adminVariants.form.price}
                          </th>

                          <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            {t.adminVariants.form.stock}
                          </th>

                          <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            {t.adminVariants.list.actions}
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
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(variant)}
                                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                                >
                                  {t.adminVariants.list.edit}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(variant)}
                                  className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50"
                                >
                                  {t.adminVariants.list.delete}
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
                                {t.adminVariants.list.variantLabel} #
                                {variant.id}
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
                                {t.adminVariants.form.price}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-neutral-950">
                                {formatPrice(variant.price)}
                              </p>
                            </div>

                            <div className="rounded-xl bg-neutral-50 p-4">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                                {t.adminVariants.form.stock}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-neutral-950">
                                {Number(variant.stock || 0)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 p-4">
                          <button
                            type="button"
                            onClick={() => startEdit(variant)}
                            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                          >
                            {t.adminVariants.list.edit}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(variant)}
                            className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50"
                          >
                            {t.adminVariants.list.delete}
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

      {/* Delete confirmation modal */}
      {deleteVariant && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/45 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteVariant(null);
            }
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="px-6 py-6 sm:px-7 sm:py-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {t.adminVariants.modal.eyebrow}
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
                {t.adminVariants.modal.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                {t.adminVariants.modal.description}{" "}
                <span className="font-semibold text-neutral-800">
                  #{deleteVariant.id}
                </span>
                {" — Size "}
                <span className="font-semibold text-neutral-800">
                  {deleteVariant.sizeName || deleteVariant.sizeId}
                </span>
                {" / "}
                <span className="font-semibold text-neutral-800">
                  {deleteVariant.colorName || deleteVariant.colorId}
                </span>
                ?
              </p>

              <p className="mt-3 text-xs leading-5 text-neutral-400">
                {t.adminVariants.modal.warning}
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteVariant(null)}
                  className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.adminVariants.modal.cancel}
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-medium !text-white transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting
                    ? t.adminVariants.modal.deleting
                    : t.adminVariants.modal.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVariantPage;
