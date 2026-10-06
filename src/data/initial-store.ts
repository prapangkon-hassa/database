import { mockOrders } from "@/data/mock-orders";
import { mockProducts } from "@/data/mock-products";
import { mockReviews } from "@/data/mock-reviews";
import { mockVariants } from "@/data/mock-variants";
import { StoreData } from "@/types";

// รวมข้อมูลตั้งต้นสำหรับ StoreProvider เท่านั้น
export const initialData: StoreData = {
  products: mockProducts,
  variants: mockVariants,
  orders: mockOrders,
  reviews: mockReviews,
  cart: [],
};
