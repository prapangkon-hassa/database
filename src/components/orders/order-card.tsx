"use client";
import { StatusBadge } from "@/components/ui/display";
import { date, money } from "@/lib/utils";
import { OrderRecord } from "@/types";
import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";

export function OrderCard({ order }: { order: OrderRecord }) {
  return (
    <article className="panel order-card">
      <div className="row between wrap">
        <div className="row gap-3">
          <span className="order-icon">
            <Package size={21} />
          </span>
          <div>
            <h3>{order.orderId}</h3>
            <p className="muted text-sm">
              {date(order.orderDate)} ·{" "}
              {order.items.reduce((n, i) => n + i.quantity, 0)} items
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="order-card-body">
        <div className="order-thumbnails">
          {order.items.map((i) => (
            <img key={i.orderItemId} src={i.imageUrl} alt={i.productName} />
          ))}
        </div>
        <div>
          <span className="muted text-xs block mb-1">PAYMENT</span>
          <StatusBadge status={order.payment.paymentStatus} />
        </div>
        <div>
          <span className="muted text-xs block mb-1">ORDER TOTAL</span>
          <b>{money(order.totalAmount)}</b>
        </div>
        <Link className="button secondary" href={"/orders/" + order.orderId}>
          View details <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
