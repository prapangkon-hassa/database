// ตะกร้าเป็นข้อมูลฝั่ง browser; ไม่ต้องสร้าง API หรือตาราง cart สำหรับโปรเจกต์นี้
import type { StoreData } from "@/types/store";

export function addCartItem(
  data: StoreData,
  variantId: string,
  quantity: number,
): StoreData {
  const variant = data.variants.find((item) => item.variantId === variantId);
  const product = data.products.find(
    (item) => item.productId === variant?.productId,
  );
  const existing = data.cart.find((item) => item.variantId === variantId);
  if (
    !variant ||
    !product?.active ||
    quantity < 1 ||
    (existing?.quantity ?? 0) + quantity > variant.stockQuantity
  ) {
    throw new Error("The requested quantity exceeds available stock.");
  }
  return {
    ...data,
    cart: existing
      ? data.cart.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [...data.cart, { variantId, quantity }],
  };
}

export function setCartQuantity(
  data: StoreData,
  variantId: string,
  quantity: number,
): StoreData {
  const variant = data.variants.find((item) => item.variantId === variantId);
  if (!variant || variant.stockQuantity <= 0) return data;
  return {
    ...data,
    cart: data.cart.map((item) =>
      item.variantId === variantId
        ? {
            ...item,
            quantity: Math.max(
              1,
              Math.min(Math.floor(quantity) || 1, variant.stockQuantity),
            ),
          }
        : item,
    ),
  };
}

export function removeCartItem(data: StoreData, variantId: string): StoreData {
  return {
    ...data,
    cart: data.cart.filter((item) => item.variantId !== variantId),
  };
}

export function cleanCart(data: StoreData) {
  return data.cart.flatMap((item) => {
    const v = data.variants.find((v) => v.variantId === item.variantId);
    const p = data.products.find((p) => p.productId === v?.productId);
    return v &&
      p?.active &&
      v.stockQuantity > 0 &&
      Number.isFinite(item.quantity)
      ? [
          {
            ...item,
            quantity: Math.max(
              1,
              Math.min(Math.floor(item.quantity), v.stockQuantity),
            ),
          },
        ]
      : [];
  });
}
