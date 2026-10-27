// รูปแบบข้อมูลที่สอดคล้องกับตาราง payments
export type payment_method =
  "QR payment" | "Credit/Debit Card" | "Cash on Delivery";

export interface payment {
  payment_id: string;
  order_id: string;
  payment_method: payment_method;
  payment_status: "Pending" | "Paid" | "Refunded" | "Failed";
  paid_at: string | null;
  amount: number;
  transaction_ref: string | null;
  created_at: string;
}
