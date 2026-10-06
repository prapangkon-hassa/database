// รูปแบบข้อมูลที่สอดคล้องกับตาราง shipments
export type ShippingStatus = "Pending" | "Processing" | "Shipped" | "Delivered";

export interface Shipment {
  shipmentId: string;
  orderId: string;
  merchantId: string;
  trackingNumber: string;
  carrier: string;
  shippingStatus: ShippingStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
}
