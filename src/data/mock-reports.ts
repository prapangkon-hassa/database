import { MerchantReport } from "@/types";
// Deliberately static aggregates representing a reporting API response.
export const mockReport: MerchantReport = {
  totalSales: 128450,
  totalOrders: 86,
  shippingFees: 5160,
  bestSeller: "Studio Wireless Headphones",
  categories: [
    { category: "Electronics", orders: 38, units: 46, sales: 75620 },
    { category: "Accessories", orders: 21, units: 29, sales: 24810 },
    { category: "Clothing", orders: 15, units: 22, sales: 15640 },
    { category: "Home & Living", orders: 12, units: 26, sales: 12380 },
  ],
  topProducts: [
    { product: "Studio Wireless Headphones", quantity: 18, revenue: 44820 },
    { product: "Compact Mechanical Keyboard", quantity: 12, revenue: 22680 },
    { product: "Everyday Canvas Tote", quantity: 24, revenue: 14160 },
    { product: "Essential Cotton Tee", quantity: 22, revenue: 10780 },
    { product: "Ceramic Everyday Mug", quantity: 26, revenue: 8320 },
  ],
  merchants: [
    { merchant: "TechHub Store", sales: 75620, orders: 38, shipping: 2280 },
    { merchant: "Everyday Market", sales: 12380, orders: 12, shipping: 720 },
    { merchant: "Urban Goods", sales: 40450, orders: 36, shipping: 2160 },
  ],
};
