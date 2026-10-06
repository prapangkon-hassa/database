"use client";
import { useStore } from "@/context/store-provider";

export function useCartLines() {
  const { data } = useStore();
  return data.cart.flatMap((item) => {
    const variant = data.variants.find((v) => v.variantId === item.variantId);
    const product = data.products.find(
      (p) => p.productId === variant?.productId,
    );
    return variant && product ? [{ ...item, variant, product }] : [];
  });
}
