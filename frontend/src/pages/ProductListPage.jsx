import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getBrands,
  getCategories,
  getSizes,
} from "../services/catalogService.js";

import api from "../services/api.js";
import { getProducts } from "../services/productService.js";

function ProductListPage() {
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
  const [imageLoading, setImageLoading] = useState(false);
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

    loadFilterData();
  }, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        setProductImages({});

        const data = await getProducts(filters);

        const productList = Array.isArray(data) ? data : data?.content || [];

        if (!active) {
          return;
        }

        setProducts(productList);

        if (productList.length > 0) {
          setImageLoading(true);

          const imageResults = await Promise.all(
            productList.map(async (product) => {
              try {
                const response = await api.get(
                  `/products/${product.id}/images`,
                );

                const images = Array.isArray(response.data)
                  ? response.data
                  : response.data?.content || [];

                const sortedImages = [...images].sort((a, b) => {
                  if (a.primary && !b.primary) {
                    return -1;
                  }

                  if (!a.primary && b.primary) {
                    return 1;
                  }

                  return (
                    Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
                  );
                });

                return {
                  productId: product.id,
                  imageUrl: sortedImages[0]?.imageUrl || "",
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

          imageResults.forEach((item) => {
            imageMap[item.productId] = item.imageUrl;
          });

          setProductImages(imageMap);
          setImageLoading(false);
        } else {
          setImageLoading(false);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            "Không thể tải danh sách sản phẩm.",
        );

        setProducts([]);
        setProductImages({});
        setImageLoading(false);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

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

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN");
  };

  const getProductImage = (product) => {
    return productImages[product.id] || "";
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      {/* Page heading */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                Collection
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                Sneaker Collection
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                Tìm kiếm và lọc sneaker theo thương hiệu, danh mục, size và mức
                giá để tìm được lựa chọn phù hợp.
              </p>
            </div>

            {!loading && !error && (
              <div className="shrink-0">
                <p className="text-sm text-neutral-400">
                  <span className="font-semibold text-neutral-950">
                    {products.length}
                  </span>{" "}
                  sản phẩm
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
                Refine
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">
                Bộ lọc sản phẩm
              </h2>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="self-start text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950 sm:self-auto"
              >
                Xóa tất cả
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
                Tìm kiếm
              </label>

              <input
                id="keyword"
                name="keyword"
                type="text"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="Nhập tên sneaker..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100"
              />
            </div>

            {/* Brand */}
            <div>
              <label
                htmlFor="brandId"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                Thương hiệu
              </label>

              <select
                id="brandId"
                name="brandId"
                value={filters.brandId}
                onChange={handleFilterChange}
                disabled={filterLoading}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Tất cả thương hiệu</option>

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
                Danh mục
              </label>

              <select
                id="categoryId"
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                disabled={filterLoading}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Tất cả danh mục</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

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
                value={filters.sizeId}
                onChange={handleFilterChange}
                disabled={filterLoading}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-950 transition-all duration-200 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Tất cả size</option>

                {sizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min price */}
            <div>
              <label
                htmlFor="minPrice"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                Giá từ
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
                Giá đến
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
                ? `${activeFilterCount} bộ lọc đang áp dụng`
                : "Hiển thị toàn bộ sản phẩm"}
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Đặt lại
            </button>
          </div>
        </div>

        {/* Results header */}
        <div className="mt-10 flex items-end justify-between border-b border-neutral-200 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Available now
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
              Sản phẩm
            </h2>
          </div>

          {imageLoading && (
            <p className="text-xs text-neutral-400">Đang tải hình ảnh...</p>
          )}
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
              Không tìm thấy sản phẩm.
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Hãy thử thay đổi từ khóa hoặc bộ lọc đang sử dụng.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const imageUrl = getProductImage(product);

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
                >
                  {/* Product image */}
                  <Link
                    to={`/products/${product.id}`}
                    className="motion-image relative block aspect-square overflow-hidden bg-neutral-100"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_35%_30%,#ffffff,transparent_28%),linear-gradient(135deg,#f5f5f5,#e5e5e5)]">
                        <div className="text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                            Sneaker
                          </p>

                          <p className="mt-2 max-w-32 text-sm font-semibold text-neutral-500">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 backdrop-blur">
                      {product.brandName || "Brand"}
                    </div>
                  </Link>

                  {/* Product info */}
                  <div className="p-5">
                    <div className="min-h-[72px]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                        {product.categoryName || "Category"}
                      </p>

                      <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-6 tracking-[-0.015em] text-neutral-950">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.13em] text-neutral-400">
                          Giá từ
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
                      className="group/button mt-5 flex items-center justify-between rounded-xl bg-neutral-950 px-4 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-neutral-800"
                    >
                      <span>Xem chi tiết</span>

                      <span className="transition-transform duration-300 group-hover/button:translate-x-1">
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

export default ProductListPage;
