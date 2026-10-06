// หมวด checkout: mock service ของ frontend; จุดเปลี่ยนเป็น REST API ในอนาคต
import { currentCustomer } from "@/data/mock-customers";
import { shippingFee, uid } from "@/lib/utils";
import { CheckoutInput, StoreData } from "@/types";

export function checkout(data: StoreData, input: CheckoutInput) {
  // TODO POST /api/orders/checkout -> ASP.NET Core -> ADO.NET -> sp_checkout_order.
  // Future frontend sends variant IDs/quantities, never trusted prices or totals.
  // The stored procedure handles stock, payment, discounts and COMMIT/ROLLBACK.
  const required = [
    input.fullName,
    input.email,
    input.phone,
    input.addressLine,
    input.district,
    input.province,
    input.postalCode,
  ];
  if (
    required.some((v) => !v.trim()) ||
    !/^\S+@\S+\.\S+$/.test(input.email) ||
    !["QR Payment", "Credit/Debit Card", "Cash on Delivery"].includes(
      input.paymentMethod,
    )
  )
    throw new Error("Please complete the checkout form.");
  if (!data.cart.length) throw new Error("Your cart is empty.");
  const orderId = uid("EF");
  const items = data.cart.map((item, i) => {
    const v = data.variants.find((v) => v.variantId === item.variantId);
    const p = data.products.find((p) => p.productId === v?.productId);
    if (
      !v ||
      !p?.active ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > v.stockQuantity
    )
      throw new Error(
        "An item is no longer available. Please check your cart.",
      );
    return {
      orderItemId: orderId + "-" + i,
      orderId,
      variantId: v.variantId,
      productId: p.productId,
      merchantId: p.merchantId,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl,
      productName: p.name,
      variantName: v.variantName,
      quantity: item.quantity,
      unitPrice: v.price,
      subtotal: v.price * item.quantity,
    };
  });
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const shipping = shippingFee(subtotal);
  const now = new Date().toISOString();
  const order: StoreData["orders"][number] = {
    orderId,
    customerId: currentCustomer.customerId,
    orderDate: now,
    status: "Pending",
    subtotal,
    shippingFee: shipping,
    discountAmount: 0,
    totalAmount: subtotal + shipping,
    items,
    address: input,
    payment: {
      paymentId: uid("pay"),
      orderId,
      paymentMethod: input.paymentMethod,
      paymentStatus: "Pending",
      paidAt: null,
    },
    shipments: [...new Set(items.map((i) => i.merchantId))].map(
      (merchantId) => ({
        shipmentId: uid("s"),
        orderId,
        merchantId,
        carrier: "",
        trackingNumber: "",
        shippingStatus: "Pending",
        shippedAt: null,
        deliveredAt: null,
      }),
    ),
  };
  return {
    orderId,
    data: {
      ...data,
      cart: [],
      orders: [order, ...data.orders],
      variants: data.variants.map((v) => ({
        ...v,
        stockQuantity:
          v.stockQuantity -
          (items.find((i) => i.variantId === v.variantId)?.quantity ?? 0),
      })),
    },
  };
}
