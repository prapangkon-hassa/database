// รูปแบบข้อมูลที่สอดคล้องกับตาราง orders และ order_items
import type { Address } from "./checkout";
import type { Payment } from "./payment";
import type { Shipment } from "./shipment";

export type OrderStatus =
  | "Pending"
  | "Paid"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export interface Order {
  orderId: string;
  customerId: string;
  orderDate: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
}

export interface OrderItem {
  orderItemId: string;
  orderId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productId: string;
  merchantId: string;
  categoryId: string;
  imageUrl: string;
}

export interface OrderRecord extends Order {
  items: OrderItem[];
  payment: Payment;
  shipments: Shipment[];
  address: Address;
}
