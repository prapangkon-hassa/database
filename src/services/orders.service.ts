import type { StoreData } from "@/types";
export const getOrders = (data: StoreData) =>
  data.orders.filter((o) => o.customerId === data.currentCustomerId);
export const getOrderById = (data: StoreData, id: string) =>
  data.orders.find((o) => o.orderId === id);
export const getMerchantOrders = (data: StoreData, id: string) =>
  data.orders.filter((o) => o.items.some((i) => i.merchantId === id));
