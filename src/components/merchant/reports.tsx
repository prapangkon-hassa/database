"use client";
import { useStore } from "@/context/store-provider";
import { money } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/ui/feedback";
export default function Reports() {
  const { data, ready } = useStore();
  if (!ready) return <LoadingSkeleton />;
  const rows = data.report;
  const gross = rows.reduce((n, r) => n + Number(r.gross_sales), 0);
  const shipping = rows.reduce((n, r) => n + Number(r.shipping_fees), 0);
  const orders = data.orders.filter((o) => o.status !== "Cancelled");
  const discount = orders.reduce((n, o) => n + o.discountAmount, 0);
  return (
    <div className="section merchant-section">
      <div className="page-heading">
        <span className="eyebrow">SALES REPORT</span>
        <h1>Merchant sales summary</h1>
        <p>All non-cancelled orders · refreshed from database</p>
      </div>
      <div className="panel form-section">
        <div className="summary-row">
          <span>Gross product sales</span>
          <b>{money(gross)}</b>
        </div>
        <div className="summary-row">
          <span>Discounts</span>
          <b>{money(discount)}</b>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <b>{money(shipping)}</b>
        </div>
        <div className="summary-total">
          <span>Order value (includes unpaid COD)</span>
          <b>{money(gross - discount + shipping)}</b>
        </div>
        <p>{orders.length} orders</p>
      </div>
      <div className="table-wrap panel mt-6">
        <table>
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Category</th>
              <th>Orders</th>
              <th>Units</th>
              <th>Gross sales</th>
              <th>Shipping</th>
              <th>Best selling product</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.merchant_id + "-" + r.category_id}>
                <td>{r.merchant_name}</td>
                <td>{r.category_name}</td>
                <td>{r.order_count}</td>
                <td>{r.units_sold}</td>
                <td>{money(Number(r.gross_sales))}</td>
                <td>{money(Number(r.shipping_fees))}</td>
                <td>
                  {r.best_product_name} ({r.best_product_units} units)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p>No sales yet.</p>}
      </div>
      <p className="muted mt-4">
        Shipping is allocated by item quantity across categories within each
        merchant shipment. Gross sales exclude discounts and shipping. An order
        can appear in several category rows.
      </p>
    </div>
  );
}
