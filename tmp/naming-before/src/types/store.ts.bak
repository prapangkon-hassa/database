// ข้อมูลรวมที่ React Context ใช้ใน demo ไม่ใช่ตารางฐานข้อมูล
import type { CartItem } from "./cart";
import type { OrderRecord } from "./order";
import type { Product, ProductVariant } from "./product";
import type { Review } from "./review";

import type { Merchant, Category, Customer } from "./index";
export interface SalesRow {
  merchant_id: string;
  merchant_name: string;
  category_id: number;
  category_name: string;
  order_count: number;
  units_sold: string;
  gross_sales: string;
  shipping_fees: string;
  best_product_id: string;
  best_product_name: string;
  best_product_units: string;
}
export interface StoreData {
  merchants: Merchant[];
  categories: Category[];
  customers: Customer[];
  currentCustomerId: string;
  report: SalesRow[];
  products: Product[];
  variants: ProductVariant[];
  orders: OrderRecord[];
  reviews: Review[];
  cart: CartItem[];
}
