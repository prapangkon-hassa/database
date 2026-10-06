import { MetricCard } from "@/components/merchant/metric-card";
import { money } from "@/lib/utils";
import { getMerchantReport } from "@/services/reports.service";
import {
  ArrowUpRight,
  Award,
  Banknote,
  ShoppingBag,
  Truck,
} from "lucide-react";
export default function Reports() {
  const r = getMerchantReport();
  return (
    <div className="section merchant-section">
      <div className="page-heading row between wrap">
        <div>
          <span className="eyebrow">THE BIGGER PICTURE</span>
          <h1>
            Sales overview<span className="heading-dot">.</span>
          </h1>
          <p>A clear view of what’s working across your marketplace.</p>
        </div>
        <span className="report-period">September 2026 · Sample report</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total sales"
          value={money(r.totalSales)}
          detail="Product revenue, excluding shipping"
          icon={<Banknote size={19} />}
        />
        <MetricCard
          label="Total orders"
          value={String(r.totalOrders)}
          detail="Across all three merchants"
          icon={<ShoppingBag size={19} />}
        />
        <MetricCard
          label="Shipping fees"
          value={money(r.shippingFees)}
          detail="Total shipping collected"
          icon={<Truck size={19} />}
        />
        <MetricCard
          label="Best selling product"
          value="Studio Headphones"
          detail="18 units · ฿44,820 in sales"
          icon={<Award size={19} />}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-7">
        <section className="panel report-panel">
          <div className="row between">
            <h2>Sales by category</h2>
            <ArrowUpRight size={19} />
          </div>
          <p className="muted text-sm">
            The categories your customers come back for.
          </p>
          <div
            className="category-chart"
            aria-label="Revenue share by category"
          >
            {r.categories.map((c, i) => (
              <div
                key={c.category}
                style={{
                  width: (c.sales / r.totalSales) * 100 + "%",
                  background: ["#52654b", "#899a7f", "#c2cbb6", "#e7e9df"][i],
                }}
                title={c.category + ": " + money(c.sales)}
              />
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>Units</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {r.categories.map((c) => (
                  <tr key={c.category}>
                    <td>
                      <b>{c.category}</b>
                    </td>
                    <td>{c.orders}</td>
                    <td>{c.units}</td>
                    <td>{money(c.sales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel report-panel">
          <h2>Top products</h2>
          <p className="muted text-sm mb-6">
            A few customer favorites, ranked by revenue.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {r.topProducts.map((p, i) => (
                  <tr key={p.product}>
                    <td>
                      <span className="rank">{i + 1}</span>
                    </td>
                    <td>
                      <b>{p.product}</b>
                    </td>
                    <td>{p.quantity}</td>
                    <td>{money(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section className="panel report-panel mt-6">
        <h2>Merchant summary</h2>
        <p className="muted text-sm mb-5">Good things happen together.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Total sales</th>
                <th>Orders</th>
                <th>Shipping fees</th>
              </tr>
            </thead>
            <tbody>
              {r.merchants.map((m) => (
                <tr key={m.merchant}>
                  <td>
                    <b>{m.merchant}</b>
                  </td>
                  <td>{money(m.sales)}</td>
                  <td>{m.orders}</td>
                  <td>{money(m.shipping)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="muted text-xs mt-5">
        Illustrative monthly aggregates. This report is independent of demo
        checkout activity.
      </p>
    </div>
  );
}
