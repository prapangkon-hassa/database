// ข้อมูลจากฟอร์ม checkout ที่จะส่งให้ API
import type { PaymentMethod } from "./payment";

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface CheckoutInput extends Address {
  paymentMethod: PaymentMethod;
}
