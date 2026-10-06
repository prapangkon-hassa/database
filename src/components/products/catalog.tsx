"use client";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { useStore } from "@/context/store-provider";
import { categories } from "@/data/mock-categories";
import { merchants } from "@/data/mock-merchants";
import {
  Armchair,
  ArrowRight,
  Grid2X2,
  Headphones,
  PackageCheck,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductGrid } from "./product-grid";

export default function Catalog() {
  const { data, ready } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [merchant, setMerchant] = useState("all");
  const [sort, setSort] = useState("featured");
  const products = data.products
    .filter(
      (p) =>
        p.active &&
        (category === "all" || p.categoryId === category) &&
        (merchant === "all" || p.merchantId === merchant) &&
        (p.name + " " + p.description)
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const price = (id: string) =>
        Math.min(
          ...data.variants
            .filter((v) => v.productId === id)
            .map((v) => v.price),
        );
      return sort === "low"
        ? price(a.productId) - price(b.productId)
        : sort === "high"
          ? price(b.productId) - price(a.productId)
          : 0;
    });
  const icons = [Grid2X2, Headphones, ShoppingBag, Shirt, Armchair];
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">THE EVERYDAY COLLECTION</span>
          <h1>
            Good things.
            <br />
            <span>For your everyday.</span>
          </h1>
          <p>
            Discover thoughtful essentials for the way you live,
            <br className="desktop-break" /> work, and make yourself at home.
          </p>
          <Link className="button" href="#catalog">
            Explore the collection <ArrowRight size={16} />
          </Link>
          <span className="hero-note">Small details. A better everyday.</span>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="hero-circle" />
          <img
            className="hero-headphones"
            src="/products/hero-headphones.svg"
            alt=""
          />
          <img className="hero-mug" src="/products/hero-mug.svg" alt="" />
          <span className="hero-stamp">
            Considered design.
            <br />
            Everyday value.
          </span>
          <span className="hero-product-tag">
            Made for your daily rhythm <ArrowRight size={14} />
          </span>
        </div>
      </section>
      <section className="benefits" aria-label="Shopping benefits">
        <div>
          <Truck />
          <span>
            <b>A little less on delivery</b>
            <small>Free shipping on orders ฿3,000+</small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            <b>Shop with confidence</b>
            <small>Thoughtfully selected merchants</small>
          </span>
        </div>
        <div>
          <PackageCheck />
          <span>
            <b>With you, all the way</b>
            <small>Track every step of your order</small>
          </span>
        </div>
      </section>
      <section id="catalog" className="catalog section">
        <div className="row between wrap section-heading">
          <div>
            <span className="eyebrow">FIND YOUR NEXT FAVORITE</span>
            <h2>
              Explore our products<span className="heading-dot">.</span>
            </h2>
          </div>
          <p className="muted">The essentials, and a little inspiration.</p>
        </div>
        <div className="category-tabs" aria-label="Product categories">
          {[
            { categoryId: "all", categoryName: "All products" },
            ...categories,
          ].map((c, i) => {
            const Icon = icons[i];
            return (
              <button
                key={c.categoryId}
                className={category === c.categoryId ? "selected" : ""}
                onClick={() => setCategory(c.categoryId)}
              >
                <Icon size={17} />
                {c.categoryName}
              </button>
            );
          })}
        </div>
        <div className="filter-bar">
          <label className="search-input">
            <Search size={18} />
            <input
              id="product-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for something good…"
              aria-label="Search products"
            />
          </label>
          <label className="filter-select">
            <SlidersHorizontal size={15} />
            <select
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              aria-label="Filter by merchant"
            >
              <option value="all">All merchants</option>
              {merchants.map((m) => (
                <option key={m.merchantId} value={m.merchantId}>
                  {m.merchantName}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span>Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
        <div className="results-row">
          <span>
            Showing <b>{products.length}</b> products
          </span>
          <span>Good finds. Fair prices.</span>
        </div>
        {!ready ? (
          <LoadingSkeleton />
        ) : products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="No matches this time"
            description="Try another search or explore a different category."
          >
            <button
              className="button secondary"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setMerchant("all");
              }}
            >
              Clear filters
            </button>
          </EmptyState>
        )}
      </section>
      <section className="merchant-callout">
        <div>
          <span className="eyebrow">FROM OUR COMMUNITY</span>
          <h2>Great finds start with great merchants.</h2>
          <p>Meet TechHub Store, Everyday Market, and Urban Goods.</p>
        </div>
        <Link href="/merchant/products" className="button secondary">
          Merchant workspace <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
