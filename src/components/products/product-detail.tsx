"use client";
import { RatingStars } from "@/components/ui/display";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useStore } from "@/context/store-provider";
import { categories } from "@/data/mock-categories";
import { customers } from "@/data/mock-customers";
import { merchants } from "@/data/mock-merchants";
import { date, money } from "@/lib/utils";
import { ArrowLeft, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function ProductDetail({ id }: { id: string }) {
  const { data, ready, addToCart } = useStore();
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState(1);
  const p = data.products.find((p) => p.productId === id && p.active);
  const variants = data.variants.filter((v) => v.productId === id);
  const v = variants.find((v) => v.variantId === selected) ?? variants[0];
  const reviews = data.reviews.filter((r) => r.productId === id);
  const rating = reviews.length
    ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length
    : 0;
  if (!ready) return <LoadingSkeleton />;
  if (!p || !v)
    return (
      <EmptyState
        title="Product not found"
        description="This product may no longer be available."
      >
        <Link href="/" className="button">
          Explore products
        </Link>
      </EmptyState>
    );
  const inCart =
    data.cart.find((c) => c.variantId === v.variantId)?.quantity ?? 0;
  const available = v.stockQuantity - inCart;
  function add(buy = false) {
    if (addToCart(v.variantId, quantity) && buy) router.push("/checkout");
  }
  return (
    <div className="container section">
      <Link href="/#catalog" className="back-link">
        <ArrowLeft size={15} /> Back to products
      </Link>
      <div className="detail-grid">
        <div className="detail-image">
          <img
            src={p.imageUrl}
            alt={p.name}
            onError={(e) => {
              e.currentTarget.src = "/products/tote.svg";
            }}
          />
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {
              categories.find((c) => c.categoryId === p.categoryId)
                ?.categoryName
            }
          </span>
          <h1>{p.name}</h1>
          <p className="muted">
            By{" "}
            {merchants.find((m) => m.merchantId === p.merchantId)?.merchantName}
          </p>
          <div className="my-4">
            <RatingStars rating={rating} count={reviews.length} />
            <span className="muted text-sm ml-2">customer reviews</span>
          </div>
          <div className="detail-price">{money(v.price)}</div>
          <p className="description">{p.description}</p>
          <label className="field">
            Select a variant
            <select
              value={v.variantId}
              onChange={(e) => {
                setSelected(e.target.value);
                setQuantity(1);
              }}
            >
              {variants.map((v) => (
                <option key={v.variantId} value={v.variantId}>
                  {v.variantName}
                </option>
              ))}
            </select>
          </label>
          <div className="variant-meta">
            <span>Color: {v.color || "—"}</span>
            <span>Size: {v.size || "—"}</span>
            <span>SKU: {v.sku}</span>
          </div>
          <p
            className={"stock my-4 " + (!v.stockQuantity ? "unavailable" : "")}
          >
            {v.stockQuantity ? v.stockQuantity + " available" : "Out of stock"}
            {inCart > 0 ? " · " + inCart + " in your cart" : ""}
          </p>
          <div className="row gap-4 mb-5">
            <span className="text-sm">Quantity</span>
            <QuantitySelector
              value={quantity}
              max={available}
              onChange={setQuantity}
            />
          </div>
          <div className="actions">
            <button
              className="button grow"
              disabled={available < quantity}
              onClick={() => add()}
            >
              <ShoppingBag size={17} /> Add to cart
            </button>
            <button
              className="button secondary grow"
              disabled={available < quantity}
              onClick={() => add(true)}
            >
              Buy now
            </button>
          </div>
          <div className="detail-promises">
            <span>
              <Truck size={17} /> Free shipping over ฿3,000
            </span>
            <span>
              <ShieldCheck size={17} /> Carefully selected quality
            </span>
          </div>
        </div>
      </div>
      <section className="reviews-section">
        <div className="row between">
          <h2>
            Customer reviews{" "}
            <span className="muted text-lg">({reviews.length})</span>
          </h2>
          <RatingStars rating={rating} />
        </div>
        {reviews.length ? (
          reviews.map((r) => (
            <article className="review" key={r.reviewId}>
              <div className="row between">
                <b>
                  {customers.find((c) => c.customerId === r.customerId)
                    ?.firstName ?? "Customer"}
                </b>
                <span className="muted text-sm">{date(r.createdAt)}</span>
              </div>
              <RatingStars rating={r.rating} />
              <p>{r.comment}</p>
            </article>
          ))
        ) : (
          <EmptyState
            title="A fresh find"
            description="No reviews yet. Complete a purchase to share your thoughts."
          />
        )}
      </section>
    </div>
  );
}
