// หมวด products: mock service ของ frontend; จุดเปลี่ยนเป็น REST API ในอนาคต
import { uid } from "@/lib/utils";
import { ProductInput, StoreData } from "@/types";
import { cleanCart } from "./cart.service";

// TODO GET /api/products: เปลี่ยนการอ่าน array เป็นการรับข้อมูลจาก ASP.NET Core
export const getProducts = (data: StoreData) => data.products;

// TODO GET /api/products/{id}
export const getProductById = (data: StoreData, id: string) =>
  data.products.find((p) => p.productId === id);

export function saveProduct(
  data: StoreData,
  input: ProductInput,
  id?: string,
): StoreData {
  // TODO POST /api/products or PUT /api/products/{id}
  if (
    !input.name.trim() ||
    !input.categoryId ||
    !input.variants.length ||
    input.variants.some(
      (v) =>
        !v.sku.trim() ||
        !Number.isFinite(v.price) ||
        v.price < 0 ||
        !Number.isInteger(v.stockQuantity) ||
        v.stockQuantity < 0,
    )
  )
    throw new Error("Please check the product fields.");
  const productId = id ?? uid("p");
  const { variants, ...fields } = input;
  const normalized = variants.map((v) => ({
    ...v,
    productId,
    variantId: v.variantId || uid("v"),
  }));
  const other = data.variants.filter((v) => v.productId !== productId);
  const skus = [...other, ...normalized].map((v) => v.sku.trim().toLowerCase());
  if (new Set(skus).size !== skus.length)
    throw new Error("Each variant must have a unique SKU.");
  const product = { ...fields, productId };
  const next = {
    ...data,
    products: id
      ? data.products.map((p) => (p.productId === id ? product : p))
      : [...data.products, product],
    variants: [...other, ...normalized],
  };
  return { ...next, cart: cleanCart(next) };
}

export const createProduct = (data: StoreData, input: ProductInput) =>
  saveProduct(data, input);

export const updateProduct = (
  data: StoreData,
  id: string,
  input: ProductInput,
) => saveProduct(data, input, id);

export function deleteProduct(data: StoreData, id: string): StoreData {
  // TODO DELETE /api/products/{id}. Historical order items keep purchase snapshots.
  const next = {
    ...data,
    products: data.products.filter((p) => p.productId !== id),
    variants: data.variants.filter((v) => v.productId !== id),
  };
  return { ...next, cart: cleanCart(next) };
}
