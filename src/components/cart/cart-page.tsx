"use client";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useStore } from "@/context/store-provider";
import { money } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { OrderSummary } from "./order-summary";
import { useCartLines } from "./use-cart-lines";

export function CartPage() {
  const { ready, setQuantity, removeItem } = useStore();
  const lines = useCartLines();
  const subtotal = lines.reduce((n, i) => n + i.quantity * i.variant.price, 0);
  if (!ready)
    return (
      <div className="container section">
        <LoadingSkeleton />
      </div>
    );
  return (
    <div className="container section">
      <Link href="/#catalog" className="back-link">
        <ArrowLeft size={15} /> Continue shopping
      </Link>
      <div className="page-heading">
        <span className="eyebrow">YOUR EVERYDAY FINDS</span>
        <h1>
          Shopping cart<span className="heading-dot">.</span>
        </h1>
        <p>
          {lines.length} selected {lines.length === 1 ? "item" : "items"} · A
          few good things, all in one place.
        </p>
      </div>
      {!lines.length ? (
        <EmptyState
          title="Your next favorite is waiting"
          description="Your cart is empty. Explore our everyday essentials."
        >
          <Link className="button" href="/#catalog">
            Explore products <ArrowRight size={16} />
          </Link>
        </EmptyState>
      ) : (
        <div className="checkout-grid">
          <div className="panel cart-list">
            {lines.map((line) => (
              <article key={line.variantId} className="cart-item">
                <Link href={"/products/" + line.product.productId}>
                  <img src={line.product.imageUrl} alt={line.product.name} />
                </Link>
                <div className="cart-info">
                  <Link href={"/products/" + line.product.productId}>
                    <h3>{line.product.name}</h3>
                  </Link>
                  <p>{line.variant.variantName}</p>
                  <span>{money(line.variant.price)} each</span>
                  <QuantitySelector
                    value={line.quantity}
                    max={line.variant.stockQuantity}
                    onChange={(n) => setQuantity(line.variantId, n)}
                  />
                </div>
                <div className="cart-right">
                  <b>{money(line.variant.price * line.quantity)}</b>
                  <button
                    className="icon-button muted"
                    aria-label={"Remove " + line.product.name}
                    onClick={() => removeItem(line.variantId)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <OrderSummary subtotal={subtotal}>
            <Link className="button w-full" href="/checkout">
              Proceed to checkout <ArrowRight size={16} />
            </Link>
            {subtotal < 3000 && (
              <p className="text-sm muted mt-4">
                You’re {money(3000 - subtotal)} away from free shipping.
              </p>
            )}
          </OrderSummary>
        </div>
      )}
    </div>
  );
}
