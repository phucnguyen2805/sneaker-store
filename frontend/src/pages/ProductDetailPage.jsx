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
                (first.displayOrder || 0) - (second.displayOrder || 0),
            )
          : [];

        setImages(sortedImages);

        // Tự động chọn variant đầu tiên còn hàng.
        const firstAvailableVariant = variantData.find(
          (variant) => variant.stock > 0,
        );

        if (firstAvailableVariant) {
          setSelectedSizeId(firstAvailableVariant.sizeId);
          setSelectedColorId(firstAvailableVariant.colorId);
        } else if (variantData.length > 0) {
          // Nếu tất cả đều hết hàng thì vẫn chọn variant đầu tiên
          // để người dùng thấy thông tin giá/stock của variant đó.
          setSelectedSizeId(variantData[0].sizeId);
          setSelectedColorId(variantData[0].colorId);
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

    // Ưu tiên variant đúng cả Size + Color hiện tại,
    // kể cả khi variant đó đang hết hàng.
    const matchingVariant = variants.find(
      (variant) =>
        variant.sizeId === sizeId && variant.colorId === selectedColorId,
    );

    if (matchingVariant) {
      return;
    }

    // Nếu Size mới không có Color hiện tại,
    // chuyển sang Color đầu tiên có variant với Size đó.
    const firstVariantForSize = variants.find(
      (variant) => variant.sizeId === sizeId,
    );

    if (firstVariantForSize) {
      setSelectedColorId(firstVariantForSize.colorId);
    }
  };

  const handleColorChange = (colorId) => {
    setSelectedColorId(colorId);

    // Ưu tiên variant đúng cả Size + Color hiện tại,
    // kể cả khi stock = 0.
    const matchingVariant = variants.find(
      (variant) =>
        variant.sizeId === selectedSizeId && variant.colorId === colorId,
    );

    if (matchingVariant) {
      return;
    }

    // Nếu Color mới không có Size hiện tại,
    // chuyển sang Size đầu tiên có variant với Color đó.
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
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">Đang tải sản phẩm...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">{error}</p>

          <Link
            to="/products"
            className="mt-4 inline-block text-sm font-semibold text-neutral-900 underline"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </section>
    );
  }

  if (!product) {
    return null;
  }

  const currentImage = images[activeImageIndex];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <Link
          to="/products"
          className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
        >
          ← Quay lại sản phẩm
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
            {currentImage ? (
              <img
                src={currentImage.imageUrl}
                alt={product.name}
                className="aspect-square h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center">
                <span className="text-sm text-neutral-400">
                  Chưa có hình ảnh
                </span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`overflow-hidden rounded-xl border-2 bg-neutral-100 transition-all duration-200 ${
                    activeImageIndex === index
                      ? "border-neutral-950"
                      : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {product.brandName}
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-950">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-neutral-950">
            {formatPrice(selectedVariant?.price || product.basePrice)} ₫
          </p>

          <p className="mt-6 text-base leading-7 text-neutral-600">
            {product.description}
          </p>

          <div className="my-8 h-px bg-neutral-200" />

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">
                Chọn size
              </h2>

              {selectedVariant && (
                <span className="text-sm text-neutral-500">
                  Tồn kho: {selectedVariant.stock}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {sizes.map((size) => {
                const active = selectedSizeId === size.id;
                const available = isSizeAvailable(size.id);

                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleSizeChange(size.id)}
                    className={`min-w-16 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : available
                          ? "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
                          : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
                    }`}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-neutral-900">Chọn màu</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {colors.map((color) => {
                const active = selectedColorId === color.id;
                const available = isColorAvailable(color.id);

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleColorChange(color.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "border-neutral-950"
                        : available
                          ? "border-neutral-300 hover:border-neutral-900"
                          : "cursor-not-allowed border-neutral-200 opacity-40"
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-neutral-300"
                      style={{
                        backgroundColor: color.hexCode || "#FFFFFF",
                      }}
                    />

                    {color.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10">
            {selectedVariant?.stock > 0 ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={actionLoading}
                className="w-full rounded-xl bg-neutral-950 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? "Đang thêm vào giỏ..." : "Thêm vào giỏ hàng"}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-neutral-200 px-6 py-4 text-sm font-semibold text-neutral-400"
              >
                Hết hàng
              </button>
            )}
          </div>
          {cartError && (
            <p className="mt-3 text-sm text-red-600">{cartError}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductDetailPage;
