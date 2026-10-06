import { mockProducts } from "@/data/mock-products";
import { mockVariants } from "@/data/mock-variants";
import { OrderRecord, OrderStatus, ShippingStatus } from "@/types";
const states: OrderStatus[] = [
  "Processing",
  "Shipped",
  "Completed",
  "Pending",
  "Delivered",
];
export const mockOrders: OrderRecord[] = states.map((status, i) => {
  const orderId = "EF-2026-" + (1005 - i);
  const products = [mockProducts[i], mockProducts[(i + 3) % 12]];
  const items = products.map((p, j) => {
    const v = mockVariants.find((v) => v.productId === p.productId)!;
    const unitPrice = v.price;
    return {
      orderItemId: orderId + "-" + j,
      orderId,
      variantId: v.variantId,
      productId: p.productId,
      merchantId: p.merchantId,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl,
      productName: p.name,
      variantName: v.variantName,
      quantity: 1,
      unitPrice,
      subtotal: unitPrice,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipped = ["Shipped", "Delivered", "Completed"].includes(status);
  const delivered = ["Delivered", "Completed"].includes(status);
  return {
    orderId,
    customerId: "c1",
    orderDate: "2026-09-" + (28 - i * 3) + "T09:30:00Z",
    status,
    subtotal,
    shippingFee: 60,
    discountAmount: 0,
    totalAmount: subtotal + 60,
    items,
    address: {
      fullName: "Alex Morgan",
      email: "alex@example.com",
      phone: "0812345678",
      addressLine: "24 Sukhumvit Road",
      district: "Watthana",
      province: "Bangkok",
      postalCode: "10110",
    },
    payment: {
      paymentId: "pay" + i,
      orderId,
      paymentMethod: i === 3 ? "Cash on Delivery" : "QR Payment",
      paymentStatus: i === 3 ? "Pending" : "Paid",
      paidAt: i === 3 ? null : "2026-09-20T10:00:00Z",
    },
    shipments: [...new Set(items.map((item) => item.merchantId))].map(
      (merchantId, j) => ({
        shipmentId: "s" + i + "-" + j,
        orderId,
        merchantId,
        carrier: shipped ? "Thailand Post" : "",
        trackingNumber: shipped ? "TH" + (482930100 + i * 10 + j) : "",
        shippingStatus: (delivered
          ? "Delivered"
          : shipped
            ? "Shipped"
            : status === "Processing"
              ? "Processing"
              : "Pending") as ShippingStatus,
        shippedAt: shipped ? "2026-09-25T08:00:00Z" : null,
        deliveredAt: delivered ? "2026-09-27T12:00:00Z" : null,
      }),
    ),
  };
});
