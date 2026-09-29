const PRODUCT_MESSAGE_PREFIX = "SNEAKER_PRODUCT:";

export const buildProductChatMessage = (productId, note = "") => {
  const numericProductId = Number(productId);

  if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
    throw new Error("Product ID không hợp lệ.");
  }

  return `${PRODUCT_MESSAGE_PREFIX}${JSON.stringify({
    productId: numericProductId,
    note: String(note || "").trim(),
  })}`;
};

export const parseProductChatMessage = (content) => {
  if (
    typeof content !== "string" ||
    !content.startsWith(PRODUCT_MESSAGE_PREFIX)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(content.slice(PRODUCT_MESSAGE_PREFIX.length));
    const productId = Number(payload?.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return null;
    }

    return {
      productId,
      note: typeof payload.note === "string" ? payload.note : "",
    };
  } catch {
    return null;
  }
};

/**
 * Lấy danh sách productId từ text AI: [productId:123]
 * Giữ thứ tự, bỏ trùng.
 */
export const extractAiProductIds = (content) => {
  if (typeof content !== "string" || !content) {
    return [];
  }

  const regex = /\[productId:(\d+)\]/gi;
  const ids = [];
  const seen = new Set();
  let match;

  while ((match = regex.exec(content)) !== null) {
    const id = Number(match[1]);

    if (Number.isInteger(id) && id > 0 && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
};

/**
 * Xóa tag [productId:N] khi hiển thị text cho đẹp.
 */
export const stripAiProductTags = (content) => {
  if (typeof content !== "string") {
    return "";
  }

  return content
    .replace(/\[productId:\d+\]/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
