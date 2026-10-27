// รูปแบบข้อมูลที่สอดคล้องกับตาราง payments
export type PaymentMethod =
  "QR Payment" | "Credit/Debit Card" | "Cash on Delivery";

export interface Payment {
  paymentId: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "Pending" | "Paid" | "Refunded" | "Failed";
  paidAt: string | null;
  amount: number;
  transactionRef: string | null;
  createdAt: string;
}
