import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProductById, getProductImages } from "../services/productDetailService.js";

const productCache = new Map();

async function loadProductPreview(productId) {
  if (productCache.has(productId)) {
    return productCache.get(productId);
  }

  const promise = Promise.all([
    getProductById(productId),
    getProductImages(productId),
  ])
    .then(([product, imageData]) => {
      const images = Array.isArray(imageData) ? [...imageData] : [];

      images.sort((first, second) => {
        if (first.primary && !second.primary) {
          return -1;
        }

        if (!first.primary && second.primary) {
          return 1;
        }

        return Number(first.displayOrder || 0) - Number(second.displayOrder || 0);
      });

      return {
        product,
        imageUrl: images[0]?.imageUrl || "",
      };
    })
    .catch((error) => {
      productCache.delete(productId);
      throw error;
    });

  productCache.set(productId, promise);

  return promise;
}

function ProductChatCard({ productId, note, mine = false, language = "vi" }) {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(false);

        const data = await loadProductPreview(productId);

        if (!active) {
          return;
        }

        setProduct(data.product);
        setImageUrl(data.imageUrl);
      } catch (requestError) {
        console.error("Không thể tải preview sản phẩm trong chat:", requestError);

        if (!active) {
          return;
        }

        setProduct(null);
        setImageUrl("");
        setError(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [productId]);

  const openProduct = () => {
    navigate(`/products/${productId}`);
  };

  const fallbackText =
    language === "en" ? "Product is no longer available." : "Sản phẩm không còn khả dụng.";

  if (loading) {
    return (
      <div
        className={`w-[280px] max-w-full overflow-hidden rounded-2xl border p-3 shadow-sm ${
          mine ? "border-white/15 bg-white/10" : "border-neutral-200 bg-white"
        }`}
      >
        <div className="h-32 animate-pulse rounded-xl bg-neutral-200/80" />
        <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-neutral-200/80" />
        <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-neutral-200/70" />
        <div className="mt-4 h-9 animate-pulse rounded-xl bg-neutral-200/70" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className={`w-[280px] max-w-full rounded-2xl border px-4 py-3 text-sm ${
          mine
            ? "border-white/15 bg-white/10 text-white/75"
            : "border-neutral-200 bg-white text-neutral-500"
        }`}
      >
        {fallbackText}
      </div>
    );
  }

  const price = Number(product.basePrice || 0).toLocaleString("vi-VN");

  return (
    <button
      type="button"
      onClick={openProduct}
      className={`group block w-[280px] max-w-full overflow-hidden rounded-2xl border text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        mine
          ? "border-white/15 bg-white text-neutral-950"
          : "border-neutral-200 bg-white text-neutral-950"
      }`}
    >
      <div className="relative aspect-[1.18] overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center">
            <span className="text-xs font-medium text-neutral-400">
              Sneaker
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-600 backdrop-blur">
          {product.brandName || "Product"}
        </span>
      </div>

      <div className="p-4">
        <p className="line-clamp-2 text-sm font-semibold leading-5">
          {product.name}
        </p>

        <p className="mt-2 text-sm font-semibold text-neutral-950">
          {price} ₫
        </p>

        {note && (
          <p className="mt-3 rounded-xl bg-neutral-50 px-3 py-2 text-xs leading-5 text-neutral-500">
            {note}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] font-semibold text-neutral-500">
          <span>{language === "en" ? "Product" : "Sản phẩm"} #{productId}</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            {language === "en" ? "View details →" : "Xem chi tiết →"}
          </span>
        </div>
      </div>
    </button>
  );
}

export default ProductChatCard;
