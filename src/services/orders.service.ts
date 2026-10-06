// หมวด orders: mock service ของ frontend; จุดเปลี่ยนเป็น REST API ในอนาคต
import { currentCustomer } from "@/data/mock-customers";
import { StoreData } from "@/types";

// TODO GET /api/orders: API ต้องคืนเฉพาะออเดอร์ของลูกค้าที่เข้าสู่ระบบ
export const getOrders = (data: StoreData) =>
  data.orders.filter((o) => o.customerId === currentCustomer.customerId);

// TODO GET /api/orders/{id}
export const getOrderById = (data: StoreData, id: string) =>
  data.orders.find((o) => o.orderId === id);

// TODO GET /api/merchant/orders: API ต้องตรวจสิทธิ์ร้านค้า
export const getMerchantOrders = (data: StoreData, id: string) =>
  data.orders.filter((o) => o.items.some((item) => item.merchantId === id));
