"use client";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { useStore } from "@/context/store-provider";
import { getOrders } from "@/services/orders.service";
import Link from "next/link";
import { useState } from "react";
import { OrderCard } from "./order-card";

export function OrdersPage() {
  const { data, ready } = useStore();
  const [filter, setFilter] = useState("All");
  const orders = getOrders(data).filter(
    (o) => filter === "All" || o.status === filter,
  );
  return (
    <div className="container section">
      <div className="page-heading">
        <span className="eyebrow">FROM OUR DOOR TO YOURS</span>
        <h1>
          My orders<span className="heading-dot">.</span>
        </h1>
        <p>Track your deliveries and revisit your favorite finds.</p>
      </div>
      <div className="tabs">
        {["All", "Processing", "Shipped", "Completed"].map((s) => (
          <button
            key={s}
            className={filter === s ? "selected" : ""}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {!ready ? (
        <LoadingSkeleton />
      ) : orders.length ? (
        <div className="space-y-5">
          {orders.map((o) => (
            <OrderCard order={o} key={o.orderId} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No orders here yet"
          description="Your orders will appear here once you find something you love."
        >
          <Link className="button" href="/">
            Explore products
          </Link>
        </EmptyState>
      )}
    </div>
  );
}
