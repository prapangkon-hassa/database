// ข้อมูลรวมที่ React Context ใช้ใน demo ไม่ใช่ตารางฐานข้อมูล
import type { CartItem } from "./cart";
import type { OrderRecord } from "./order";
import type { Product, ProductVariant } from "./product";
import type { Review } from "./review";

export interface StoreData {
  products: Product[];
  variants: ProductVariant[];
  orders: OrderRecord[];
  reviews: Review[];
  cart: CartItem[];
}
