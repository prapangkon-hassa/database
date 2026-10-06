// หมวด shipments: mock service ของ frontend; จุดเปลี่ยนเป็น REST API ในอนาคต
import { ShippingStatus, StoreData } from "@/types";

export function updateShipmentStatus(
  data: StoreData,
  id: string,
  status: ShippingStatus,
  carrier = "",
  trackingNumber = "",
): StoreData {
  // TODO PUT /api/shipments/{id}/status.
  // The future SQL Server trigger automatically updates the parent order to
  // Completed when all required shipment items are delivered. Never do that here.
  const current = data.orders
    .flatMap((o) => o.shipments)
    .find((s) => s.shipmentId === id);
  if (!current) throw new Error("Shipment not found.");
  const allowed: Record<ShippingStatus, ShippingStatus | undefined> = {
    Pending: "Processing",
    Processing: "Shipped",
    Shipped: "Delivered",
    Delivered: undefined,
  };
  if (allowed[current.shippingStatus] !== status)
    throw new Error("This shipment cannot move to that status.");
  if (status === "Shipped" && (!carrier.trim() || !trackingNumber.trim()))
    throw new Error("Carrier and tracking number are required.");
  const now = new Date().toISOString();
  return {
    ...data,
    orders: data.orders.map((o) => ({
      ...o,
      shipments: o.shipments.map((s) =>
        s.shipmentId === id
          ? {
              ...s,
              shippingStatus: status,
              carrier: carrier || s.carrier,
              trackingNumber: trackingNumber || s.trackingNumber,
              shippedAt: status === "Shipped" ? now : s.shippedAt,
              deliveredAt: status === "Delivered" ? now : s.deliveredAt,
            }
          : s,
      ),
    })),
  };
}
