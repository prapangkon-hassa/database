// รูปแบบข้อมูลที่สอดคล้องกับตาราง products และ product_variants
export interface Product {
  productId: string;
  merchantId: string;
  categoryId: string;
  name: string;
  description: string;
  active: boolean;
}

export interface ProductVariant {
  variantId: string;
  productId: string;
  variantName: string;
  sku: string;
  price: number;
  stockQuantity: number;
  originalStockQuantity?: number;
  status: "active" | "inactive";
}

export interface ProductInput extends Omit<Product, "productId"> {
  variants: ProductVariant[];
}
