import { money, shippingFee } from "@/lib/utils";
import { LockKeyhole } from "lucide-react";

export function OrderSummary({
  subtotal,
  children,
}: {
  subtotal: number;
  children?: React.ReactNode;
}) {
  return (
    <aside className="panel summary">
      <h2>Order summary</h2>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>{money(subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>
          {shippingFee(subtotal) ? money(shippingFee(subtotal)) : "Free"}
        </span>
      </div>
      <div className="summary-row">
        <span>Discount</span>
        <span>{money(0)}</span>
      </div>
      <div className="summary-total">
        <b>Total</b>
        <b>{money(subtotal + shippingFee(subtotal))}</b>
      </div>
      {children}
      <p className="summary-note">
        <LockKeyhole size={14} /> Demo checkout · No real payment
      </p>
    </aside>
  );
}
