import api from "./api.js";

const imageCache = new Map();

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

export const getProductImages = async (productId) => {
  if (!productId) {
    return [];
  }

  if (imageCache.has(productId)) {
    return imageCache.get(productId);
  }

  const response = await api.get(`/products/${productId}/images`);

  const images = Array.isArray(response.data)
    ? response.data
    : response.data?.content || [];

  const sortedImages = sortImages(images);

  imageCache.set(productId, sortedImages);

  return sortedImages;
};

export const getPrimaryProductImage = async (productId) => {
  const images = await getProductImages(productId);

  return images[0]?.imageUrl || "";
};

export const uploadProductImage = async (productId, file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(`/products/${productId}/images`, formData);

  imageCache.delete(productId);

  return response.data;
};

export const deleteProductImage = async (productId, imageId) => {
  await api.delete(`/products/${productId}/images/${imageId}`);

  imageCache.delete(productId);
};

export const clearProductImageCache = (productId) => {
  if (productId) {
    imageCache.delete(productId);
    return;
  }

  imageCache.clear();
};
