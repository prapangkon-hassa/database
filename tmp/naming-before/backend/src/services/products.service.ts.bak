import { getPool } from "../lib/db.js";
import { inventoryQuery } from "../queries/products.query.js";
import type { PoolClient } from "pg";
export async function getInventory(productId?: string, client?: PoolClient) {
  const { rows } = await (client ?? getPool()).query(inventoryQuery, [
    productId ?? null,
  ]);
  const products = new Map();
  const variants = [];
  for (const row of rows) {
    const {
      variantId,
      variantName,
      sku,
      price,
      stockQuantity,
      variantStatus,
      ...product
    } = row;
    products.set(product.productId, product);
    if (variantId)
      variants.push({
        variantId,
        productId: product.productId,
        variantName,
        sku,
        price: Number(price),
        stockQuantity,
        status: variantStatus,
      });
  }
  return { products: [...products.values()], variants };
}
