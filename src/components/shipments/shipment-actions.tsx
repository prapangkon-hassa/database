"use client";
import { useState } from "react";
import { Truck } from "lucide-react";
import { useStore } from "@/context/store-provider";
import type { Shipment } from "@/types/shipment";

export function ShipmentActions({ shipment }: { shipment: Shipment }) {
  const { updateShipment } = useStore();
  const [carrier, setCarrier] = useState(shipment.carrier);
  const [tracking, setTracking] = useState(shipment.trackingNumber);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function change(status: Shipment["shippingStatus"]) {
    setBusy(true);
    setErrors({});
    try {
      await updateShipment(
        shipment.shipmentId,
        status,
        carrier.trim(),
        tracking.trim(),
      );
    } catch (e) {
      setErrors({ submit: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }
  async function ship() {
    const next: Record<string, string> = {};
    if (!carrier.trim()) next.carrier = "Carrier is required.";
    if (!tracking.trim()) next.tracking = "Tracking number is required.";
    setErrors(next);
    if (Object.keys(next).length) return;
    await change("Shipped");
  }
  return (
    <section className="shipment-actions">
      <h3 className="row gap-2">
        <Truck size={18} /> Update shipment
      </h3>
      <p className="muted text-sm my-3">
        Shipment status and order status are tracked separately.
      </p>
      {errors.submit && (
        <p role="alert" className="field-error">
          {errors.submit}
        </p>
      )}
      {shipment.shippingStatus === "Pending" && (
        <button
          className="button"
          disabled={busy}
          onClick={() => change("Processing")}
        >
          Mark as processing
        </button>
      )}
      {shipment.shippingStatus === "Processing" && (
        <>
          <div className="form-grid my-5">
            <label className="field">
              Carrier
              <input
                aria-label="Carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
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
                onChange={(e) => setTracking(e.target.value)}
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
      {shipment.shippingStatus === "Shipped" && (
        <button
          className="button"
          disabled={busy}
          onClick={() => change("Delivered")}
        >
          Mark as delivered
        </button>
      )}
      {shipment.shippingStatus === "Delivered" && (
        <p className="notice">
          This shipment is delivered. The order completes automatically after
          all shipments are delivered.
        </p>
      )}
    </section>
  );
}
