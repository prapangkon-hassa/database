"use client";
import { RatingStars } from "@/components/ui/display";
import { useStore } from "@/context/store-provider";
import { categories } from "@/data/mock-categories";
import { merchants } from "@/data/mock-merchants";
import { money } from "@/lib/utils";
import { getProductInventory } from "@/services/products.service";
import { Product } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const { data } = useStore();
  const { variants, inStock } = getProductInventory(data, product.productId);
  const reviews = data.reviews.filter((r) => r.productId === product.productId);
  const rating = reviews.length
    ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length
    : 0;
  return (
    <article className="product-card">
      <Link className="product-image" href={"/products/" + product.productId}>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/products/tote.svg";
          }}
        />
        {!inStock ? (
          <span className="image-label sold-out">Out of Stock</span>
        ) : product.productId === "p1" ? (
          <span className="image-label">Bestseller</span>
        ) : product.productId === "p3" ? (
          <span className="image-label light">Everyday favorite</span>
        ) : null}
        <span className="image-arrow">
          <ArrowRight size={17} />
        </span>
      </Link>
      <div className="product-content">
        <div className="row between">
          <span className="eyebrow">
            {
              categories.find((c) => c.categoryId === product.categoryId)
                ?.categoryName
            }
          </span>
          <RatingStars rating={rating} count={reviews.length} />
        </div>
        <Link href={"/products/" + product.productId}>
          <h3>{product.name}</h3>
        </Link>
        <p className="merchant-name">
          {
            merchants.find((m) => m.merchantId === product.merchantId)
              ?.merchantName
          }
        </p>
        <div className="row between product-price">
          <b>{variants.length ? money(Math.min(...variants.map((v) => v.price))) : "—"}</b>
          <span className={"stock " + (!inStock ? "unavailable" : "")}>
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        <Link className="view-product" href={"/products/" + product.productId}>
          View product <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
