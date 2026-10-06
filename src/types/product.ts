// รูปแบบข้อมูลที่สอดคล้องกับตาราง products และ product_variants
export interface Product {
  productId: string;
  merchantId: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
}

export interface ProductVariant {
  variantId: string;
  productId: string;
  variantName: string;
  color: string;
  size: string;
  sku: string;
  price: number;
  stockQuantity: number;
}

export interface ProductInput extends Omit<Product, "productId"> {
  variants: ProductVariant[];
}
