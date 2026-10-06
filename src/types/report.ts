// รูปแบบผลลัพธ์จาก API รายงาน ไม่ใช่ตารางใหม่
export interface MerchantReport {
  totalSales: number;
  totalOrders: number;
  shippingFees: number;
  bestSeller: string;
  categories: {
    category: string;
    orders: number;
    units: number;
    sales: number;
  }[];
  topProducts: { product: string; quantity: number; revenue: number }[];
  merchants: {
    merchant: string;
    sales: number;
    orders: number;
    shipping: number;
  }[];
}
