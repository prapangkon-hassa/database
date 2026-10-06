"use client";
import { MetricCard } from "@/components/merchant/metric-card";
import { ConfirmDialog, Modal } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/display";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { useStore } from "@/context/store-provider";
import { categories } from "@/data/mock-categories";
import { merchants } from "@/data/mock-merchants";
import { money } from "@/lib/utils";
import { getProductInventory } from "@/services/products.service";
import { Product } from "@/types";
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
  const { data, ready, deleteProduct } = useStore();
  const [merchant, setMerchant] = useState("m1");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [view, setView] = useState<Product | null>(null);
  const all = data.products.filter((p) => p.merchantId === merchant);
  const products = all.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const variants = data.variants.filter((v) =>
    all.some((p) => p.productId === v.productId),
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
        <button className="button" onClick={() => setEditing(null)}>
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
          value={ready ? String(variants.reduce((n, v) => n + v.stockQuantity, 0)) : "—"}
          detail="Across all product variants"
          icon={<Archive size={19} />}
        />
      </div>
      <div className="filter-bar">
        <label className="search-input">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your products…"
            aria-label="Search merchant products"
          />
        </label>
        <label className="filter-select">
          Merchant
          <select
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
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
                <th>Product</th>
                <th>Category</th>
                <th>Variants</th>
                <th>Price range</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const { variants: vs, totalStock, inStock } = getProductInventory(data, p.productId);
                return (
                  <tr key={p.productId}>
                    <td>
                      <div className="table-product">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          onError={(e) => {
                            e.currentTarget.src = "/products/tote.svg";
                          }}
                        />
                        <b>{p.name}</b>
                      </div>
                    </td>
                    <td>
                      {
                        categories.find((c) => c.categoryId === p.categoryId)
                          ?.categoryName
                      }
                    </td>
                    <td>{vs.length} variants</td>
                    <td className="whitespace-nowrap">
                      {money(Math.min(...vs.map((v) => v.price)))} –{" "}
                      {money(Math.max(...vs.map((v) => v.price)))}
                    </td>
                    <td>
                      {totalStock}
                      <small className={"stock block " + (!inStock ? "unavailable" : "")}>
                        {inStock ? "In Stock" : "Out of Stock"}
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
                          onClick={() => setView(p)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={"Edit " + p.name}
                          onClick={() => setEditing(p)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={"Delete " + p.name}
                          onClick={() => setDeleting(p)}
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
          merchantId={merchant}
          onClose={() => setEditing(undefined)}
        />
      )}{" "}
      {deleting && (
        <ConfirmDialog
          title="Delete this product?"
          description={
            "“" +
            deleting.name +
            "” will be removed from the catalog and any carts. Existing order history is preserved."
          }
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            deleteProduct(deleting.productId);
            setDeleting(null);
          }}
        />
      )}
      {view && (
        <Modal title={view.name} onClose={() => setView(null)}>
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
                  .filter((v) => v.productId === view.productId)
                  .map((v) => (
                    <tr key={v.variantId}>
                      <td>{v.variantName}</td>
                      <td>{v.sku}</td>
                      <td>{money(v.price)}</td>
                      <td>{v.stockQuantity}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {view.active && (
            <Link className="button mt-5" href={"/products/" + view.productId}>
              View storefront page
            </Link>
          )}
        </Modal>
      )}
    </div>
  );
}
