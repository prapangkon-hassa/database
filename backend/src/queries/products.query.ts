export const inventoryQuery = `
 SELECT p.product_id::text AS "productId",p.merchant_id::text AS "merchantId",
 p.category_id::text AS "categoryId",p.product_name AS name,coalesce(p.description,'') description,
 (p.status='active') active,v.variant_id::text AS "variantId",v.variant_name AS "variantName",
 v.sku,v.price,v.stock_quantity AS "stockQuantity",v.status AS "variantStatus"
 FROM products p LEFT JOIN product_variants v USING(product_id)
 WHERE ($1::bigint IS NULL OR p.product_id=$1::bigint)
 ORDER BY p.product_id,v.variant_id`;
