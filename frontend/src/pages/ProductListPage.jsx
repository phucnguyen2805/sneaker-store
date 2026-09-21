import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getBrands,
  getCategories,
  getSizes,
} from '../services/catalogService.js';

import { getProducts } from '../services/productService.js';

function ProductListPage() {
  const [products, setProducts] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [filters, setFilters] = useState({
    keyword: '',
    brandId: '',
    categoryId: '',
    sizeId: '',
    minPrice: '',
    maxPrice: '',
  });

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [error, setError] = useState('');

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
            'Không thể tải dữ liệu bộ lọc.',
        );
      } finally {
        setFilterLoading(false);
      }
    };

    loadFilterData();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getProducts(filters);

        const productList = Array.isArray(data)
          ? data
          : data?.content || [];

        setProducts(productList);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Không thể tải danh sách sản phẩm.',
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
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
      keyword: '',
      brandId: '',
      categoryId: '',
      sizeId: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('vi-VN');
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Collection
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-neutral-950">
          Sneaker Collection
        </h1>

        <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-500">
          Tìm kiếm và lọc sneaker theo thương hiệu, danh mục, size và mức giá.
        </p>
      </div>

      <div className="mb-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <label
              htmlFor="keyword"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Tìm kiếm sneaker
            </label>

            <input
              id="keyword"
              name="keyword"
              type="text"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Nhập tên sneaker..."
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
            />
          </div>

          <div>
            <label
              htmlFor="brandId"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Thương hiệu
            </label>

            <select
              id="brandId"
              name="brandId"
              value={filters.brandId}
              onChange={handleFilterChange}
              disabled={filterLoading}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-100"
            >
              <option value="">Tất cả thương hiệu</option>

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
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Danh mục
            </label>

            <select
              id="categoryId"
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              disabled={filterLoading}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-100"
            >
              <option value="">Tất cả danh mục</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sizeId"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Size
            </label>

            <select
              id="sizeId"
              name="sizeId"
              value={filters.sizeId}
              onChange={handleFilterChange}
              disabled={filterLoading}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-100"
            >
              <option value="">Tất cả size</option>

              {sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="minPrice"
              className="mb-2 block text-sm font-medium text-neutral-800"
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
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
            />
          </div>

          <div>
            <label
              htmlFor="maxPrice"
              className="mb-2 block text-sm font-medium text-neutral-800"
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
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 transition-all duration-200 hover:bg-neutral-50"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-950">
          Sản phẩm
        </h2>

        {!loading && !error && (
          <p className="text-sm text-neutral-500">
            {products.length} sản phẩm
          </p>
        )}
      </div>

      {loading && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">
            Đang tải sản phẩm...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-base font-medium text-neutral-900">
            Không tìm thấy sản phẩm.
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Hãy thử thay đổi từ khóa hoặc bộ lọc.
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex aspect-square items-center justify-center bg-neutral-100">
                <span className="text-sm text-neutral-400">
                  Sneaker
                </span>
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
                  {product.brandName || 'Brand'}
                </p>

                <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-neutral-950">
                  {product.name}
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  {product.categoryName || 'Category'}
                </p>

                <p className="mt-4 text-lg font-bold text-neutral-950">
                  {formatPrice(product.basePrice)} ₫
                </p>

                <Link
                  to={`/products/${product.id}`}
                  className="mt-5 block rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-semibold text-neutral-900 transition-colors duration-200 hover:bg-neutral-950 hover:text-white"
                >
                  Xem chi tiết
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductListPage;