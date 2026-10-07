import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import CustomSelect from "../components/CustomSelect.jsx";
import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

import {
  getBrands,
  getCategories,
  getSizes,
} from "../services/catalogService.js";

import { getPrimaryProductImage } from "../services/productImageService.js";
import { getProducts } from "../services/productService.js";

function LazyProductImage({ product, imageUrl, onLoaded, t }) {
  const containerRef = useRef(null);
  const requestedRef = useRef(false);

  const supportsIntersectionObserver =
    typeof window !== "undefined" && "IntersectionObserver" in window;

  const [visible, setVisible] = useState(
    Boolean(imageUrl) || !supportsIntersectionObserver,
  );

  const [loading, setLoading] = useState(false);
  const [resolvedImageUrl, setResolvedImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);

  const displayImageUrl = imageUrl || resolvedImageUrl;

  useEffect(() => {
    if (imageUrl || !supportsIntersectionObserver) {
      return;
    }

    const element = containerRef.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        setVisible(true);
        observer.disconnect();
      },
      {
        rootMargin: "240px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [imageUrl, supportsIntersectionObserver]);

  useEffect(() => {
    if (!visible || imageUrl || requestedRef.current) {
      return;
    }

    requestedRef.current = true;

    let active = true;

    const loadImage = async () => {
      try {
        setLoading(true);
        setImageError(false);

        const image = await getPrimaryProductImage(product.id);

        if (!active) {
          return;
        }

        setResolvedImageUrl(image || "");
        setLoading(false);

        onLoaded?.(image || "");
      } catch {
        if (!active) {
          return;
        }

        setResolvedImageUrl("");
        setLoading(false);
        setImageError(true);

        onLoaded?.("");
      }
    };

    void loadImage();

    return () => {
      active = false;
    };
  }, [visible, imageUrl, onLoaded, product.id]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-neutral-100"
    >
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-neutral-100" />
      )}

      {displayImageUrl && !imageError ? (
        <img
          src={displayImageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={() => {
            setImageError(true);
          }}
          className={`h-full w-full object-cover transition-all duration-500 ease-out ${
            loading ? "scale-[1.02] opacity-0" : "scale-100 opacity-100"
          }`}
        />
      ) : (
        !loading && (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#ffffff,transparent_28%),linear-gradient(135deg,#f5f5f5,#e5e5e5)]">
            <div className="px-5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                {t.products.sneakerPlaceholder}
              </p>

              <p className="mt-2 max-w-40 text-sm font-semibold text-neutral-500">
                {product.name}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function ProductListPage() {
  const { language } = useThemeLanguage();
  const t = translations[language];

  const [products, setProducts] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [productImages, setProductImages] = useState({});

  const [filters, setFilters] = useState({
    keyword: "",
    brandId: "",
    categoryId: "",
    sizeId: "",
    minPrice: "",
    maxPrice: "",
  });

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setFilterLoading(true);

        const [brandData, categoryData, sizeData] = await Promise.all([
          getBrands(),
          getCategories(),
          getSizes(),
        ]);

        setBrands(Array.isArray(brandData) ? brandData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setSizes(Array.isArray(sizeData) ? sizeData : []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Không thể tải dữ liệu bộ lọc.",
        );
      } finally {
        setFilterLoading(false);
      }
    };

    void loadFilterData();
  }, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts(filters);

        const productList = Array.isArray(data) ? data : data?.content || [];

        if (!active) {
          return;
        }

        setProducts(productList);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            requestError.response?.data?.error ||
            "Không thể tải danh sách sản phẩm.",
        );

        setProducts([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      brandId: "",
      categoryId: "",
      sizeId: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  const handleBrandChange = (value) => {
    setFilters((current) => ({
      ...current,
      brandId: value,
    }));
  };

  const handleCategoryChange = (value) => {
    setFilters((current) => ({
      ...current,
      categoryId: value,
    }));
  };

  const handleSizeChange = (value) => {
    setFilters((current) => ({
      ...current,
      sizeId: value,
    }));
  };

  const formatPrice = (price) => {
    const locale = language === "en" ? "en-US" : "vi-VN";

    return Number(price || 0).toLocaleString(locale);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  const brandOptions = [
    {
      value: "",
      label: language === "en" ? "All brands" : "Tất cả thương hiệu",
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
      label: language === "en" ? "All categories" : "Tất cả danh mục",
      imageUrl: null,
    },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.name,
      imageUrl: category.imageUrl || null,
    })),
  ];

  const sizeOptions = [
    {
      value: "",
      label: language === "en" ? "All sizes" : "Tất cả size",
    },
    ...sizes.map((size) => ({
      value: String(size.id),
      label: size.name,
    })),
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      {/* Page heading */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                {t.products.eyebrow}
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                {t.products.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                {t.products.description}
              </p>
            </div>

            {!loading && !error && (
              <div className="shrink-0">
                <p className="text-sm text-neutral-400">
                  <span className="font-semibold text-neutral-950">
                    {products.length}
                  </span>{" "}
                  {t.products.productCount}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Filter panel */}
        <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] sm:p-6">
          <div className="flex flex-col gap-3 border-b border-neutral-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                {t.products.refine}
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                {t.products.filterTitle}
              </h2>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="motion-soft self-start text-sm font-medium text-neutral-500 hover:text-neutral-950 sm:self-auto"
              >
                {t.products.clearAll}
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Keyword */}
            <div className="lg:col-span-3">
              <label
                htmlFor="keyword"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                {t.products.search}
              </label>

              <input
                id="keyword"
                name="keyword"
                type="text"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder={t.products.searchPlaceholder}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {t.products.brand}
              </label>

              <CustomSelect
                value={filters.brandId}
                onChange={handleBrandChange}
                options={brandOptions}
                placeholder={
                  language === "en" ? "Select brand" : "Chọn thương hiệu"
                }
                disabled={filterLoading}
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {t.products.category}
              </label>

              <CustomSelect
                value={filters.categoryId}
                onChange={handleCategoryChange}
                options={categoryOptions}
                placeholder={
                  language === "en" ? "Select category" : "Chọn danh mục"
                }
                disabled={filterLoading}
              />
            </div>

            {/* Size */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                {t.products.size}
              </label>

              <CustomSelect
                value={filters.sizeId}
                onChange={handleSizeChange}
                options={sizeOptions}
                placeholder={language === "en" ? "Select size" : "Chọn size"}
                disabled={filterLoading}
                showImage={false}
              />
            </div>

            {/* Min price */}
            <div>
              <label
                htmlFor="minPrice"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                {t.products.minPrice}
              </label>

              <input
                id="minPrice"
                name="minPrice"
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            {/* Max price */}
            <div>
              <label
                htmlFor="maxPrice"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                {t.products.maxPrice}
              </label>

              <input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="5000000"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-5">
            <p className="text-xs text-neutral-400">
              {activeFilterCount > 0
                ? `${activeFilterCount} ${t.products.filtersApplied}`
                : t.products.showAllProducts}
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className="motion-soft rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.products.reset}
            </button>
          </div>
        </div>

        {/* Results header */}
        <div className="mt-10 flex items-end justify-between border-b border-neutral-200 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              {t.products.availableNow}
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
              {t.products.productTitle}
            </h2>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-white"
              >
                <div className="aspect-square animate-pulse bg-neutral-100" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />

                  <div className="h-5 w-4/5 animate-pulse rounded bg-neutral-100" />

                  <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />

                  <div className="h-5 w-28 animate-pulse rounded bg-neutral-100" />

                  <div className="h-11 w-full animate-pulse rounded-xl bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div className="mt-6 rounded-[1.5rem] border border-neutral-200 bg-white px-6 py-20 text-center">
            <p className="text-lg font-semibold text-neutral-950">
              {t.products.noProducts}
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              {t.products.noProductsDescription}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="motion-soft mt-6 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:-translate-y-0.5 hover:bg-neutral-800"
              >
                {t.products.clearFilters}
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="motion-soft group overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-white hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
              >
                {/* Product image */}
                <Link
                  to={`/products/${product.id}`}
                  className="motion-image relative block aspect-square overflow-hidden bg-neutral-100"
                >
                  <LazyProductImage
                    product={product}
                    imageUrl={productImages[product.id] || ""}
                    onLoaded={(imageUrl) => {
                      setProductImages((current) => ({
                        ...current,
                        [product.id]: imageUrl,
                      }));
                    }}
                    t={t}
                  />

                  <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 backdrop-blur">
                    {product.brandName || t.products.brandFallback}
                  </div>
                </Link>

                {/* Product info */}
                <div className="p-5">
                  <div className="min-h-[72px]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                      {product.categoryName || t.products.categoryFallback}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-6 tracking-[-0.015em] text-neutral-950">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.13em] text-neutral-400">
                        {t.products.priceFrom}
                      </p>

                      <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                        {formatPrice(product.basePrice)} ₫
                      </p>
                    </div>

                    <span className="text-xs text-neutral-400">
                      #{product.id}
                    </span>
                  </div>

                  <Link
                    to={`/products/${product.id}`}
                    className="group/button mt-5 flex items-center justify-between rounded-xl bg-neutral-950 px-4 py-3.5 text-sm font-medium !text-white transition-all duration-300 hover:bg-neutral-800"
                  >
                    <span>{t.products.viewDetail}</span>

                    <span className="transition-transform duration-300 group-hover/button:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProductListPage;
