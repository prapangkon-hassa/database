import { ArrowUpRight } from "lucide-react";
import { SiteLink as Link } from "./site-link";

export function Footer() {
  return (
    <footer>
      <div className="row between wrap">
        <div>
          <Link className="brand" href="/">
            form<span className="brand-dot">.</span>
          </Link>
          <p>Good things, made for everyday.</p>
        </div>
        <div className="footer-links">
          <Link href="/#catalog">Explore products</Link>
          <Link href="/orders">Track your order</Link>
          <Link href="/merchant/products">
            Merchant panel <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Form · E-Commerce & Fulfillment</span>
        <span>University project · Frontend demo</span>
      </div>
    </footer>
  );
}
