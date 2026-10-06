"use client";
import { Modal } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/display";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { useStore } from "@/context/store-provider";
import { merchants } from "@/data/mock-merchants";
import { date, money } from "@/lib/utils";
import { getMerchantOrders } from "@/services/orders.service";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ShipmentActions } from "@/components/shipments/shipment-actions";

export default function MerchantOrders() {
  const { data, ready } = useStore();
  const [merchant, setMerchant] = useState("m1");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const orders = getMerchantOrders(data, merchant).filter(
    (o) =>
      filter === "All" ||
      (filter === "Completed"
        ? o.status === "Completed"
        : o.status !== "Completed" &&
          o.shipments.some(
            (s) => s.merchantId === merchant && s.shippingStatus === filter,
          )),
  );
  const order = data.orders.find((o) => o.orderId === selected);
  const shipment = order?.shipments.find((s) => s.merchantId === merchant);
  return (
    <div className="section merchant-section">
      <div className="page-heading row between wrap">
        <div>
          <span className="eyebrow">EVERY ORDER, MOVING FORWARD</span>
          <h1>
            Orders & shipments<span className="heading-dot">.</span>
          </h1>
          <p>Keep your customers’ good things on their way.</p>
        </div>
        <label className="filter-select">
          Merchant
          <select
            value={merchant}
            onChange={(e) => {
              setMerchant(e.target.value);
              setSelected(null);
            }}
            aria-label="Select merchant"
          >
            {merchants.map((m) => (
              <option key={m.merchantId} value={m.merchantId}>
                {m.merchantName}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="tabs">
        {[
          "All",
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Completed",
        ].map((s) => (
          <button
            key={s}
            className={filter === s ? "selected" : ""}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="muted text-sm mb-4">
        Filter by shipment progress, or by completed orders.
      </p>
      {!ready ? (
        <LoadingSkeleton />
      ) : !orders.length ? (
        <EmptyState
          title="No orders to show"
          description="Try another status or merchant."
        />
      ) : (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Order / date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Merchant subtotal</th>
                <th>Payment</th>
                <th>Order status</th>
                <th>Shipment</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const items = o.items.filter((i) => i.merchantId === merchant);
                const s = o.shipments.find((s) => s.merchantId === merchant);
                return (
                  <tr key={o.orderId}>
                    <td>
                      <button
                        className="text-link"
                        onClick={() => setSelected(o.orderId)}
                      >
                        {o.orderId}
                      </button>
                      <small className="block muted mt-1">
                        {date(o.orderDate)}
                      </small>
                    </td>
                    <td>{o.address.fullName}</td>
                    <td>{items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td>{money(items.reduce((n, i) => n + i.subtotal, 0))}</td>
                    <td>
                      <StatusBadge status={o.payment.paymentStatus} />
                    </td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td>
                      <StatusBadge status={s?.shippingStatus ?? "Pending"} />
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={"Manage " + o.orderId}
                        onClick={() => setSelected(o.orderId)}
                      >
                        <ArrowRight size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {order && shipment && (
        <Modal
          title={"Order " + order.orderId}
          onClose={() => setSelected(null)}
        >
          <div className="row between wrap mb-5">
            <span>
              Order <StatusBadge status={order.status} />
            </span>
            <span>
              Shipment <StatusBadge status={shipment.shippingStatus} />
            </span>
          </div>
          <p className="muted">
            {order.address.fullName} · {order.address.phone}
          </p>
          <p className="muted text-sm mb-4">
            {order.address.addressLine}, {order.address.district},{" "}
            {order.address.province} {order.address.postalCode}
          </p>
          {order.items
            .filter((i) => i.merchantId === merchant)
            .map((i) => (
              <div className="summary-row" key={i.orderItemId}>
                <span>
                  {i.productName}
                  <small className="block">
                    {i.variantName} · {money(i.unitPrice)} × {i.quantity}
                  </small>
                </span>
                <b>{money(i.subtotal)}</b>
              </div>
            ))}
          <div className="summary-row">
            <span>Whole order total</span>
            <b>{money(order.totalAmount)}</b>
          </div>
          <div className="summary-row">
            <span>{order.payment.paymentMethod}</span>
            <StatusBadge status={order.payment.paymentStatus} />
          </div>
          {shipment.trackingNumber && (
            <p className="notice">
              {shipment.carrier} · {shipment.trackingNumber}
            </p>
          )}
          {!["Cancelled", "Completed"].includes(order.status) && (
            <ShipmentActions key={shipment.shipmentId} shipment={shipment} />
          )}
        </Modal>
      )}
    </div>
  );
}
