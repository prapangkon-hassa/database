// รูปแบบข้อมูลที่สอดคล้องกับตาราง shipments
export type shipping_status = "Pending" | "Processing" | "Shipped" | "Delivered";

export interface shipment {
  shipment_id: string;
  order_id: string;
  merchant_id: string;
  tracking_number: string;
  carrier: string;
  shipping_status: shipping_status;
  shipping_cost: number;
  shipped_at: string | null;
  delivered_at: string | null;
}
