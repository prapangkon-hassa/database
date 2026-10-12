import type { StoreData } from "@/types";
export const getProducts = (data: StoreData) => data.products;
export const getProductById = (data: StoreData, id: string) =>
  data.products.find((p) => p.productId === id);
export function getProductInventory(data: StoreData, productId: string) {
  const variants = data.variants.filter((v) => v.productId === productId);
  return {
    variants,
    totalStock: variants.reduce((n, v) => n + v.stockQuantity, 0),
    inStock: variants.some((v) => v.status === "active" && v.stockQuantity > 0),
  };
}
