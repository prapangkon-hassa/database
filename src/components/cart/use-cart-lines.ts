"use client";
import { useStore } from "@/context/store-provider";

export function useCartLines() {
  const { data } = useStore();
  return data.cart.flatMap((item) => {
    const variant = data.variants.find((v) => v.variant_id === item.variant_id);
    const product = data.products.find(
      (p) => p.product_id === variant?.product_id,
    );
    return variant && product ? [{ ...item, variant, product }] : [];
  });
}
