"use client";
import { useState } from "react";
import { Truck } from "lucide-react";
import { useStore } from "@/context/store-provider";
import type { shipment } from "@/types/shipment";

export function ShipmentActions({ shipment }: { shipment: shipment }) {
  const { update_shipment } = useStore();
  const [carrier, set_carrier] = useState(shipment.carrier);
  const [tracking, set_tracking] = useState(shipment.tracking_number);
  const [errors, set_errors] = useState<Record<string, string>>({});
  const [busy, set_busy] = useState(false);
  async function change(status: shipment["shipping_status"]) {
    set_busy(true);
    set_errors({});
    try {
      await update_shipment(
        shipment.shipment_id,
        status,
        carrier.trim(),
        tracking.trim(),
      );
    } catch (e) {
      set_errors({ submit: (e as Error).message });
    } finally {
      set_busy(false);
    }
  }
  async function ship() {
    const next: Record<string, string> = {};
    if (!carrier.trim()) next.carrier = "Carrier is required.";
    if (!tracking.trim()) next.tracking = "Tracking number is required.";
    set_errors(next);
    if (Object.keys(next).length) return;
    await change("Shipped");
  }
  return (
    <section className="shipment-actions">
      <h3 className="row gap-2">
        <Truck size={18} /> Update shipment
      </h3>
      <p className="muted text-sm my-3">
        shipment status and order status are tracked separately.
      </p>
      {errors.submit && (
        <p role="alert" className="field-error">
          {errors.submit}
        </p>
      )}
      {shipment.shipping_status === "Pending" && (
        <button
          className="button"
          disabled={busy}
          onClick={() => change("Processing")}
        >
          Mark as processing
        </button>
      )}
      {shipment.shipping_status === "Processing" && (
        <>
          <div className="form-grid my-5">
            <label className="field">
              Carrier
              <input
                aria-label="Carrier"
                value={carrier}
                onChange={(e) => set_carrier(e.target.value)}
                placeholder="e.g. Thailand Post"
                aria-invalid={!!errors.carrier}
              />
              {errors.carrier && (
                <small className="field-error">{errors.carrier}</small>
              )}
            </label>
            <label className="field">
              Tracking number
              <input
                aria-label="Tracking number"
                value={tracking}
                onChange={(e) => set_tracking(e.target.value)}
                aria-invalid={!!errors.tracking}
              />
              {errors.tracking && (
                <small className="field-error">{errors.tracking}</small>
              )}
            </label>
          </div>
          <button className="button" disabled={busy} onClick={ship}>
            Mark as shipped
          </button>
        </>
      )}
      {shipment.shipping_status === "Shipped" && (
        <button
          className="button"
          disabled={busy}
          onClick={() => change("Delivered")}
        >
          Mark as delivered
        </button>
      )}
      {shipment.shipping_status === "Delivered" && (
        <p className="notice">
          This shipment is delivered. The order completes automatically after
          all shipments are delivered.
        </p>
      )}
    </section>
  );
}
