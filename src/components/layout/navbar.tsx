"use client";
import { useStore } from "@/context/store-provider";
import { Box, ChevronDown, Search, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const { data } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [homeSection, setHomeSection] = useState("home");

  useEffect(() => {
    function syncSection() {
      setHomeSection(window.location.hash === "#catalog" ? "products" : "home");
    }

    // Home และ Products ใช้ pathname เดียวกัน จึงต้องอ่าน hash ด้วย
    syncSection();
    window.addEventListener("hashchange", syncSection);
    window.addEventListener("popstate", syncSection);
    return () => {
      window.removeEventListener("hashchange", syncSection);
      window.removeEventListener("popstate", syncSection);
    };
  }, [pathname]);

  const homeActive = pathname === "/" && homeSection === "home";
  const productsActive =
    pathname.startsWith("/products") ||
    (pathname === "/" && homeSection === "products");
  const ordersActive = pathname.startsWith("/orders");
  const count = data.cart.reduce((n, i) => n + i.quantity, 0);
  return (
    <>
      <div className="announcement">
        Everyday essentials. Thoughtfully selected.
        <span>Free shipping on orders ฿3,000+</span>
      </div>
      <header className="header">
        <div className="nav-wrap">
          <Link href="/" className="brand">
            <span className="brand-symbol">
              <Box size={22} />
            </span>
            form<span className="brand-dot">.</span>
            <span className="brand-caption">E-COMMERCE & FULFILLMENT</span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link
              className={homeActive ? "active" : ""}
              aria-current={homeActive ? "page" : undefined}
              href="/"
              onNavigate={() => setHomeSection("home")}
            >
              Home
            </Link>
            <Link
              className={productsActive ? "active" : ""}
              aria-current={productsActive ? "page" : undefined}
              href="/#catalog"
              onNavigate={() => setHomeSection("products")}
            >
              Products
            </Link>
            <Link
              className={ordersActive ? "active" : ""}
              aria-current={ordersActive ? "page" : undefined}
              href="/orders"
            >
              My Orders
            </Link>
          </nav>
          <div className="nav-tools">
            <button
              className="icon-button search-toggle"
              aria-label="Search products"
              onClick={() => {
                setHomeSection("products");
                router.push("/#catalog");
                setTimeout(
                  () => document.getElementById("product-search")?.focus(),
                  100,
                );
              }}
            >
              <Search size={20} />
            </button>
            <Link
              href="/cart"
              className="cart-link"
              aria-label={"Cart, " + count + " items"}
            >
              <ShoppingBag size={20} />
              <span>{count}</span>
            </Link>
            <details className="user-menu">
              <summary aria-label="Account menu">
                <span className="avatar">AM</span>
                <ChevronDown size={13} />
              </summary>
              <div>
                <b>Alex Morgan</b>
                <small>Demo customer</small>
                <Link href="/orders">My orders</Link>
                <Link href="/merchant/products">
                  <Store size={15} /> Merchant panel
                </Link>
              </div>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

