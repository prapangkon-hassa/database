import { OrderRecord } from "@/types";
import { Check } from "lucide-react";

export function OrderStatusTimeline({ order }: { order: OrderRecord }) {
  const shipments = order.shipments;
  const all = (states: string[]) =>
    shipments.length > 0 &&
    shipments.every((s) => states.includes(s.shippingStatus));
  const steps = [
    { label: "Confirmed", done: order.status !== "Cancelled" },
    { label: "Paid", done: order.payment.paymentStatus === "Paid" },
    { label: "Packed", done: all(["Processing", "Shipped", "Delivered"]) },
    { label: "Shipped", done: all(["Shipped", "Delivered"]) },
    { label: "Delivered", done: all(["Delivered"]) },
    { label: "Completed", done: order.status === "Completed" },
  ];
  return (
    <ol className="timeline">
      {steps.map((step, i) => (
        <li key={step.label} className={step.done ? "done" : ""}>
          <span>{step.done ? <Check size={15} /> : i + 1}</span>
          <small>{step.label}</small>
        </li>
      ))}
    </ol>
  );
}
