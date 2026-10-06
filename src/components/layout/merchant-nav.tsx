"use client";
import { ArrowUpRight, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MerchantNav() {
  const path = usePathname();
  return (
    <div className="merchant-nav">
      <div className="row gap-2">
        <Store size={18} />
        <b>Merchant workspace</b>
      </div>
      <nav aria-label="Merchant navigation">
        {["products", "orders", "reports"].map((item) => (
          <Link
            key={item}
            className={path.includes(item) ? "active" : ""}
            href={"/merchant/" + item}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </Link>
        ))}
      </nav>
      <Link href="/" className="muted text-sm">
        Back to storefront <ArrowUpRight size={13} />
      </Link>
    </div>
  );
}
