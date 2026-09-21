import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getProductById,
  getProductImages,
  getProductVariants,
} from "../services/productDetailService.js";

import { addItem } from "../store/cartSlice.js";

function ProductDetailPage() {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const { actionLoading, error: cartError } = useSelector(
    (state) => state.cart,
  );

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);

  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProductDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const [productData, variantData, imageData] = await Promise.all([
          getProductById(id),
          getProductVariants(id),
          getProductImages(id),
        ]);

        setProduct(productData);
        setVariants(Array.isArray(variantData) ? variantData : []);

        const sortedImages = Array.isArray(imageData)
          ? [...imageData].sort(
              (first, second) =>
                Number(first.displayOrder || 0) -
                Number(second.displayOrder || 0),
            )
          : [];

        setImages(sortedImages);
        setActiveImageIndex(0);

        // Tự động chọn variant đầu tiên còn hàng.
        const firstAvailableVariant = Array.isArray(variantData)
          ? variantData.find((variant) => variant.stock > 0)
          : null;

        if (firstAvailableVariant) {
          setSelectedSizeId(firstAvailableVariant.sizeId);
          setSelectedColorId(firstAvailableVariant.colorId);
        } else if (Array.isArray(variantData) && variantData.length > 0) {
          // Nếu tất cả đều hết hàng thì vẫn chọn variant đầu tiên
          // để người dùng xem được giá và tình trạng tồn kho.
          setSelectedSizeId(variantData[0].sizeId);
          setSelectedColorId(variantData[0].colorId);
        } else {
          setSelectedSizeId(null);
          setSelectedColorId(null);
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Không thể tải thông tin sản phẩm.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
  }, [id]);

  const sizes = useMemo(() => {
    const map = new Map();

    variants.forEach((variant) => {
      if (!map.has(variant.sizeId)) {
        map.set(variant.sizeId, {
          id: variant.sizeId,
          name: variant.sizeName,
        });
      }
    });

    return Array.from(map.values());
  }, [variants]);

  const colors = useMemo(() => {
    const map = new Map();

    variants.forEach((variant) => {
      if (!map.has(variant.colorId)) {
        map.set(variant.colorId, {
          id: variant.colorId,
          name: variant.colorName,
          hexCode: variant.colorHexCode,
        });
      }
    });

    return Array.from(map.values());
  }, [variants]);

  const selectedVariant = useMemo(() => {
    if (selectedSizeId === null || selectedColorId === null) {
      return null;
    }

    return (
      variants.find(
        (variant) =>
          variant.sizeId === selectedSizeId &&
          variant.colorId === selectedColorId,
      ) || null
    );
  }, [variants, selectedSizeId, selectedColorId]);

  const isSizeAvailable = (sizeId) => {
    return variants.some((variant) => variant.sizeId === sizeId);
  };

  const isColorAvailable = (colorId) => {
    return variants.some((variant) => variant.colorId === colorId);
  };

  const handleSizeChange = (sizeId) => {
    setSelectedSizeId(sizeId);

    // Ưu tiên giữ nguyên màu hiện tại nếu tồn tại variant tương ứng.
    const matchingVariant = variants.find(
      (variant) =>
        variant.sizeId === sizeId && variant.colorId === selectedColorId,
    );

    if (matchingVariant) {
      return;
    }

    // Nếu không tồn tại, chọn màu đầu tiên có variant với size mới.
    const firstVariantForSize = variants.find(
      (variant) => variant.sizeId === sizeId,
    );

    if (firstVariantForSize) {
      setSelectedColorId(firstVariantForSize.colorId);
    }
  };

  const handleColorChange = (colorId) => {
    setSelectedColorId(colorId);

    // Ưu tiên giữ nguyên size hiện tại nếu tồn tại variant tương ứng.
    const matchingVariant = variants.find(
      (variant) =>
        variant.sizeId === selectedSizeId && variant.colorId === colorId,
    );

    if (matchingVariant) {
      return;
    }

    // Nếu không tồn tại, chọn size đầu tiên có variant với màu mới.
    const firstVariantForColor = variants.find(
      (variant) => variant.colorId === colorId,
    );

    if (firstVariantForColor) {
      setSelectedSizeId(firstVariantForColor.sizeId);
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN");
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      return;
    }

    if (selectedVariant.stock <= 0) {
      return;
    }

    // Cart API yêu cầu người dùng phải đăng nhập.
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    const result = await dispatch(
      addItem({
        productVariantId: selectedVariant.id,
        quantity: 1,
      }),
    );

    if (addItem.fulfilled.match(result)) {
      navigate("/cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 h-5 w-32 animate-pulse rounded bg-neutral-200" />

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-[1.75rem] bg-neutral-200" />

            <div className="space-y-5 pt-2">
              <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
              <div className="h-12 w-4/5 animate-pulse rounded bg-neutral-200" />
              <div className="h-8 w-40 animate-pulse rounded bg-neutral-200" />
              <div className="h-24 w-full animate-pulse rounded bg-neutral-200" />

              <div className="border-t border-neutral-200 pt-7">
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
                <div className="mt-4 flex gap-3">
                  <div className="h-12 w-16 animate-pulse rounded-xl bg-neutral-200" />
                  <div className="h-12 w-16 animate-pulse rounded-xl bg-neutral-200" />
                  <div className="h-12 w-16 animate-pulse rounded-xl bg-neutral-200" />
                </div>
              </div>

              <div className="h-14 w-full animate-pulse rounded-xl bg-neutral-200" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f7f6]">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <Link
              to="/products"
              className="mt-5 inline-flex items-center text-sm font-semibold text-neutral-900 transition-colors duration-200 hover:text-neutral-500"
            >
              ← Quay lại danh sách sản phẩm
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currentImage = images[activeImageIndex];
  const currentPrice = selectedVariant?.price || product.basePrice;
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-28">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            Quay lại sản phẩm
          </Link>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Gallery */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_15px_50px_rgba(0,0,0,0.05)]">
              {currentImage ? (
                <div className="motion-image">
                  <img
                    key={currentImage.id}
                    src={currentImage.imageUrl}
                    alt={product.name}
                    className="aspect-square h-full w-full object-cover transition-all duration-500"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-neutral-100">
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
                      Sneaker Store
                    </p>

                    <p className="mt-2 text-sm font-medium text-neutral-500">
                      Chưa có hình ảnh
                    </p>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-white/70 bg-white/90 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-700 backdrop-blur">
                {product.brandName || "Brand"}
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.map((image, index) => {
                  const isActive = activeImageIndex === index;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
                        isActive
                          ? "border-neutral-950 shadow-sm"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        className={`aspect-square w-full object-cover transition-transform duration-300 ${
                          isActive ? "scale-100" : "group-hover:scale-[1.04]"
                        }`}
                      />

                      {isActive && (
                        <span className="absolute inset-x-3 bottom-2 h-0.5 rounded-full bg-neutral-950" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product information */}
          <div className="lg:sticky lg:top-28">
            <div className="border-b border-neutral-200 pb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                {product.categoryName || "Collection"}
              </p>

              <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2">
                <p className="text-3xl font-semibold tracking-tight text-neutral-950">
                  {formatPrice(currentPrice)} ₫
                </p>

                {selectedVariant && (
                  <p className="pb-1 text-xs text-neutral-400">
                    Variant #{selectedVariant.id}
                  </p>
                )}
              </div>

              {product.description && (
                <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
                  {product.description}
                </p>
              )}
            </div>

            {/* Size */}
            <div className="border-b border-neutral-200 py-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Chọn size
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    Kích thước có sẵn trong sản phẩm
                  </p>
                </div>

                {selectedVariant && (
                  <span
                    className={`text-xs font-medium ${
                      selectedVariant.stock > 0
                        ? "text-neutral-500"
                        : "text-neutral-400"
                    }`}
                  >
                    Tồn kho: {selectedVariant.stock}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {sizes.map((size) => {
                  const active = selectedSizeId === size.id;
                  const available = isSizeAvailable(size.id);

                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => handleSizeChange(size.id)}
                      disabled={!available}
                      className={`min-w-[64px] rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        active
                          ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                          : available
                            ? "border-neutral-200 bg-white text-neutral-900 hover:-translate-y-0.5 hover:border-neutral-950 hover:shadow-sm"
                            : "cursor-not-allowed border-neutral-100 bg-neutral-100 text-neutral-300"
                      }`}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div className="border-b border-neutral-200 py-7">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  Chọn màu
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Màu sắc của variant được chọn
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {colors.map((color) => {
                  const active = selectedColorId === color.id;
                  const available = isColorAvailable(color.id);

                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleColorChange(color.id)}
                      disabled={!available}
                      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : available
                            ? "border-neutral-200 bg-white text-neutral-900 hover:-translate-y-0.5 hover:border-neutral-950"
                            : "cursor-not-allowed border-neutral-100 bg-neutral-100 text-neutral-300"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 shrink-0 rounded-full border transition-transform duration-200 group-hover:scale-105 ${
                          active ? "border-white/70" : "border-neutral-300"
                        }`}
                        style={{
                          backgroundColor: color.hexCode || "#FFFFFF",
                        }}
                      />

                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Variant status */}
            <div className="py-7">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Trạng thái
                  </p>

                  <p className="mt-1 text-sm font-medium text-neutral-950">
                    {selectedVariant
                      ? selectedVariant.stock > 0
                        ? "Sẵn sàng đặt hàng"
                        : "Variant này đã hết hàng"
                      : "Chưa chọn variant"}
                  </p>
                </div>

                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    selectedVariant?.stock > 0
                      ? "bg-neutral-950"
                      : "bg-neutral-300"
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={actionLoading || isOutOfStock}
                className={`mt-4 flex w-full items-center justify-between rounded-xl px-5 py-4 text-sm font-semibold transition-all duration-300 ${
                  !isOutOfStock
                    ? "bg-neutral-950 text-white hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-400"
                }`}
              >
                <span>
                  {actionLoading
                    ? "Đang thêm vào giỏ..."
                    : isOutOfStock
                      ? "Hết hàng"
                      : "Thêm vào giỏ hàng"}
                </span>

                {!isOutOfStock && !actionLoading && (
                  <span className="transition-transform duration-300 hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

              {cartError && (
                <p className="mt-3 text-sm text-red-600">{cartError}</p>
              )}

              {!isAuthenticated && !isOutOfStock && (
                <p className="mt-3 text-center text-xs text-neutral-400">
                  Bạn sẽ được yêu cầu đăng nhập trước khi thêm sản phẩm vào giỏ.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;
