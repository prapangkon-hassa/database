// รูปแบบข้อมูลที่สอดคล้องกับตาราง payments
export type PaymentMethod =
  "QR Payment" | "Credit/Debit Card" | "Cash on Delivery";

export interface Payment {
  paymentId: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "Pending" | "Paid" | "Refunded";
  paidAt: string | null;
}
