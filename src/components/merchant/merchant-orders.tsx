"use client";
import { Modal } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/display";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { useStore } from "@/context/store-provider";
import { date, money } from "@/lib/utils";
import { get_merchant_orders } from "@/services/orders.service";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ShipmentActions } from "@/components/shipments/shipment-actions";

export default function MerchantOrders() {
  const { data, ready } = useStore();
  const { merchants } = data;
  const [merchant, set_merchant] = useState("all");
  const [filter, set_filter] = useState("All");
  const [selected, set_selected] = useState<string | null>(null);
  const orders = (merchant === "all" ? data.orders : get_merchant_orders(data, merchant)).filter(
    (o) =>
      filter === "All" ||
      (filter === "Completed"
        ? o.status === "Completed"
        : o.status !== "Completed" &&
          o.shipments.some(
            (s) => (merchant === "all" || s.merchant_id === merchant) && s.shipping_status === filter,
          )),
  );
  const order = data.orders.find((o) => o.order_id === selected);
  const shipments = order?.shipments.filter((s) => merchant === "all" || s.merchant_id === merchant) ?? [];
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
          merchant
          <select
            value={merchant}
            onChange={(e) => {
              set_merchant(e.target.value);
              set_selected(null);
            }}
            aria-label="Select merchant"
          >
            <option value="all">All merchants — ทุกร้าน</option>
            {merchants.map((m) => (
              <option key={m.merchant_id} value={m.merchant_id}>
                {m.merchant_name}
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
            onClick={() => set_filter(s)}
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
                <th>order / date</th>
                <th>customer</th>
                <th>Items</th>
                <th>{merchant === "all" ? "Items subtotal" : "merchant subtotal"}</th>
                <th>payment</th>
                <th>order status</th>
                <th>merchant / shipment</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const items = o.items.filter((i) => merchant === "all" || i.merchant_id === merchant);
                const visible_shipments = o.shipments.filter((s) => merchant === "all" || s.merchant_id === merchant);
                return (
                  <tr key={o.order_id}>
                    <td>
                      <button
                        className="text-link"
                        onClick={() => set_selected(o.order_id)}
                      >
                        {o.order_id}
                      </button>
                      <small className="block muted mt-1">
                        {date(o.order_date)}
                      </small>
                    </td>
                    <td>{o.address.full_name}</td>
                    <td>{items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td>{money(items.reduce((n, i) => n + i.subtotal, 0))}</td>
                    <td>
                      <StatusBadge status={o.payment.payment_status} />
                    </td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td>
                      {visible_shipments.map((s) => (
                        <div key={s.shipment_id} className="mb-2">
                          <small className="block">{merchants.find((m) => m.merchant_id === s.merchant_id)?.merchant_name}</small>
                          <StatusBadge status={s.shipping_status} />
                        </div>
                      ))}
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={"Manage " + o.order_id}
                        onClick={() => set_selected(o.order_id)}
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
      {order && (
        <Modal
          title={"order " + order.order_id}
          on_close={() => set_selected(null)}
        >
          <div className="row between wrap mb-5">
            <span>
              order <StatusBadge status={order.status} />
            </span>
          </div>
          <p className="muted">
            {order.address.full_name} · {order.address.phone}
          </p>
          <p className="muted text-sm mb-4">{order.address.address_line}</p>
          {order.items
            .filter((i) => merchant === "all" || i.merchant_id === merchant)
            .map((i) => (
              <div className="summary-row" key={i.order_item_id}>
                <span>
                  {i.product_name}
                  {merchant === "all" && <small className="block">{merchants.find((m) => m.merchant_id === i.merchant_id)?.merchant_name}</small>}
                  <small className="block">
                    {i.variant_name} · {money(i.unit_price)} × {i.quantity}
                  </small>
                </span>
                <b>{money(i.subtotal)}</b>
              </div>
            ))}
          <div className="summary-row">
            <span>Whole order total</span>
            <b>{money(order.total_amount)}</b>
          </div>
          <div className="summary-row">
            <span>{order.payment.payment_method}</span>
            <StatusBadge status={order.payment.payment_status} />
          </div>
          {shipments.map((shipment) => (
            <section key={shipment.shipment_id} className="mt-5" aria-label={"shipment " + shipment.shipment_id}>
              <div className="row between wrap">
                <b>{merchants.find((m) => m.merchant_id === shipment.merchant_id)?.merchant_name}</b>
                <StatusBadge status={shipment.shipping_status} />
              </div>
              <small className="muted">shipment #{shipment.shipment_id}</small>
              {shipment.tracking_number && <p className="notice">{shipment.carrier} · {shipment.tracking_number}</p>}
              {!["Cancelled", "Completed"].includes(order.status) && <ShipmentActions shipment={shipment} />}
            </section>
          ))}
        </Modal>
      )}
    </div>
  );
}
