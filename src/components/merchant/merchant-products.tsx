"use client";
import { MetricCard } from "@/components/merchant/metric-card";
import { ConfirmDialog, Modal } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/display";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { useStore } from "@/context/store-provider";
import { money } from "@/lib/utils";
import { get_product_inventory } from "@/services/products.service";
import { product } from "@/types";
import {
  Archive,
  Eye,
  Layers,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductForm } from "./product-form";
export default function MerchantProducts() {
  const { data, ready, delete_product } = useStore();
  const { categories, merchants } = data;
  const [merchant, set_merchant] = useState("all");
  const [search, set_search] = useState("");
  const [editing, set_editing] = useState<product | null | undefined>(undefined);
  const [deleting, set_deleting] = useState<product | null>(null);
  const [view, set_view] = useState<product | null>(null);
  const all = data.products.filter((p) => merchant === "all" || p.merchant_id === merchant);
  const products = all.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const variants = data.variants.filter((v) =>
    all.some((p) => p.product_id === v.product_id),
  );
  return (
    <div className="section merchant-section">
      <div className="page-heading row between wrap">
        <div>
          <span className="eyebrow">YOUR STOREFRONT, IN GOOD SHAPE</span>
          <h1>
            Products<span className="heading-dot">.</span>
          </h1>
          <p>Manage your catalog, variants, and stock.</p>
        </div>
        <button className="button" onClick={() => set_editing(null)}>
          <Plus size={17} /> Add product
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-7">
        <MetricCard
          label="Total products"
          value={String(all.length)}
          detail="Products in your catalog"
          icon={<Package size={19} />}
        />
        <MetricCard
          label="Active listings"
          value={String(all.filter((p) => p.active).length)}
          detail="Available in the storefront"
          icon={<Layers size={19} />}
        />
        <MetricCard
          label="Units in stock"
          value={
            ready
              ? String(variants.reduce((n, v) => n + v.stock_quantity, 0))
              : "—"
          }
          detail="Across all product variants"
          icon={<Archive size={19} />}
        />
      </div>
      <div className="filter-bar">
        <label className="search-input">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => set_search(e.target.value)}
            placeholder="Search your products…"
            aria-label="Search merchant products"
          />
        </label>
        <label className="filter-select">
          merchant
          <select
            value={merchant}
            onChange={(e) => set_merchant(e.target.value)}
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
      {!ready ? (
        <LoadingSkeleton />
      ) : !products.length ? (
        <EmptyState
          title="No products here"
          description="Add a new product or try a different search."
        />
      ) : (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>product</th>
                <th>merchant</th>
                <th>category</th>
                <th>Variants</th>
                <th>Price range</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const {
                  variants: vs,
                  total_stock,
                  in_stock,
                } = get_product_inventory(data, p.product_id);
                return (
                  <tr key={p.product_id}>
                    <td>
                      <div className="table-product">
                        <b>{p.name}</b>
                      </div>
                    </td>
                    <td>{merchants.find((m) => m.merchant_id === p.merchant_id)?.merchant_name}</td>
                    <td>
                      {
                        categories.find((c) => c.category_id === p.category_id)
                          ?.category_name
                      }
                    </td>
                    <td>{vs.length} variants</td>
                    <td className="whitespace-nowrap">
                      {money(Math.min(...vs.map((v) => v.price)))} –{" "}
                      {money(Math.max(...vs.map((v) => v.price)))}
                    </td>
                    <td>
                      {total_stock}
                      <small
                        className={
                          "stock block " + (!in_stock ? "unavailable" : "")
                        }
                      >
                        {in_stock ? "In Stock" : "Out of Stock"}
                      </small>
                    </td>
                    <td>
                      <StatusBadge status={p.active ? "Active" : "Inactive"} />
                    </td>
                    <td>
                      <div className="row gap-1">
                        <button
                          className="icon-button"
                          aria-label={"View " + p.name}
                          onClick={() => set_view(p)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={"Edit " + p.name}
                          onClick={() => set_editing(p)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={"Delete " + p.name}
                          onClick={() => set_deleting(p)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted text-xs mt-4">
        Demo workspace · Select a merchant to explore their catalog.
      </p>
      {editing !== undefined && (
        <ProductForm
          product={editing ?? undefined}
          merchant_id={merchant === "all" ? "" : merchant}
          on_close={() => set_editing(undefined)}
        />
      )}{" "}
      {deleting && (
        <ConfirmDialog
          title="Delete this product?"
          description={
            "“" +
            deleting.name +
            "” will be deleted only if it has no order history. For sold products, set status to inactive."
          }
          on_close={() => set_deleting(null)}
          on_confirm={async () => {
            await delete_product(deleting.product_id);
            set_deleting(null);
          }}
        />
      )}
      {view && (
        <Modal title={view.name} on_close={() => set_view(null)}>
          <p className="muted mb-5">{view.description}</p>
          <StatusBadge status={view.active ? "Active" : "Inactive"} />
          <div className="table-wrap mt-5">
            <table>
              <thead>
                <tr>
                  <th>Variant</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.variants
                  .filter((v) => v.product_id === view.product_id)
                  .map((v) => (
                    <tr key={v.variant_id}>
                      <td>{v.variant_name}</td>
                      <td>{v.sku}</td>
                      <td>{money(v.price)}</td>
                      <td>{v.stock_quantity}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {view.active && (
            <Link className="button mt-5" href={"/products/" + view.product_id}>
              View storefront page
            </Link>
          )}
        </Modal>
      )}
    </div>
  );
}
