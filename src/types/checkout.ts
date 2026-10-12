// ข้อมูลจากฟอร์ม checkout ที่จะส่งให้ API
import type { PaymentMethod } from "./payment";

export interface Address {
  fullName: string;
  phone: string;
  addressLine: string;
}

export interface CheckoutInput extends Address {
  paymentMethod: PaymentMethod;
  couponCode: string;
}
