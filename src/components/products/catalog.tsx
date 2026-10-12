"use client";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { useStore } from "@/context/store-provider";
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
import { SiteLink as Link } from "@/components/layout/site-link";
import { useState } from "react";
import { ProductGrid } from "./product-grid";

export default function Catalog() {
  const { data, ready } = useStore();
  const { categories, merchants } = data;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [merchant, setMerchant] = useState("all");
  const [sort, setSort] = useState("featured");
  const [limit, setLimit] = useState(24);
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
          <span className="eyebrow">YOUR EVERYDAY, UPGRADED</span>
          <h1>
            More to discover.
            <br />
            <span>More to love.</span>
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
        <div className="hero-art">
          <div className="hero-market-card">
            <span className="hero-shopping-icon">
              <ShoppingBag size={32} aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow">ONE PLACE. EVERYDAY FINDS.</span>
              <h2>Meet your marketplace.</h2>
            </div>
            <div className="hero-market-stats">
              <div>
                <strong>{ready ? merchants.length : "—"}</strong>
                <span>Merchants</span>
              </div>
              <div>
                <strong>{ready ? categories.length : "—"}</strong>
                <span>Categories</span>
              </div>
            </div>
            <Link href="/orders" className="hero-tracking-link">
              <PackageCheck size={21} /> Track your orders{" "}
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="hero-delivery-card">
            <Truck size={26} aria-hidden="true" />
            <div>
              <b>Free delivery</b>
              <span>On orders ฿3,000+</span>
            </div>
          </div>
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
            const Icon = icons[i % icons.length];
            return (
              <button
                key={c.categoryId}
                className={category === c.categoryId ? "selected" : ""}
                aria-pressed={category === c.categoryId}
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
            Showing <b>{Math.min(limit, products.length)}</b> of{" "}
            {products.length} products
          </span>
          <span>Good finds. Fair prices.</span>
        </div>
        {!ready ? (
          <LoadingSkeleton />
        ) : products.length ? (
          <>
            <ProductGrid products={products.slice(0, limit)} />
            {products.length > limit && (
              <button
                className="button secondary mt-6"
                onClick={() => setLimit(limit + 24)}
              >
                Show more products
              </button>
            )}
          </>
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
          <p>{merchants.length} merchants in the marketplace.</p>
        </div>
        <Link href="/merchant/products" className="button secondary">
          Merchant workspace <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
