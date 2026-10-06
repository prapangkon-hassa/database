"use client";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { ReviewForm } from "@/components/reviews/review-form";
import { ConfirmDialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/display";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { useStore } from "@/context/store-provider";
import { currentCustomer } from "@/data/mock-customers";
import { merchants } from "@/data/mock-merchants";
import { date, money } from "@/lib/utils";
import { ArrowLeft, Pencil, Star, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function OrderDetail({ id }: { id: string }) {
  const { data, ready, deleteReview } = useStore();
  const [reviewProduct, setReviewProduct] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const order = data.orders.find(
    (o) => o.orderId === id && o.customerId === currentCustomer.customerId,
  );
  if (!ready)
    return (
      <div className="container section">
        <LoadingSkeleton />
      </div>
    );
  if (!order)
    return (
      <EmptyState
        title="Order not found"
        description="We couldn’t find this order in your account."
      >
        <Link className="button" href="/orders">
          My orders
        </Link>
      </EmptyState>
    );
  return (
    <div className="container section">
      <Link href="/orders" className="back-link">
        <ArrowLeft size={15} /> All orders
      </Link>
      <div className="page-heading row between wrap">
        <div>
          <span className="eyebrow">ORDER DETAILS</span>
          <h1>{order.orderId}</h1>
          <p>Placed on {date(order.orderDate)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <section className="panel tracking-panel">
        <div className="row between wrap">
          <h2>Your order’s journey</h2>
          {order.status === "Cancelled" && (
            <span className="field-error">This order was cancelled.</span>
          )}
        </div>
        {order.status !== "Cancelled" && <OrderStatusTimeline order={order} />}
      </section>
      <div className="checkout-grid mt-6">
        <div className="space-y-6">
          <section className="panel form-section">
            <h2>Items in your order</h2>
            {order.items.map((item) => {
              const review = data.reviews.find(
                (r) =>
                  r.productId === item.productId &&
                  r.customerId === currentCustomer.customerId,
              );
              return (
                <div className="order-detail-item" key={item.orderItemId}>
                  <img src={item.imageUrl} alt={item.productName} />
                  <div className="grow">
                    <h3>{item.productName}</h3>
                    <p className="muted text-sm">{item.variantName}</p>
                    <p className="text-sm my-2">
                      {money(item.unitPrice)} × {item.quantity}
                    </p>
                    {order.status === "Completed" && (
                      <div className="row gap-3 wrap">
                        <button
                          className="text-link"
                          onClick={() => setReviewProduct(item.productId)}
                        >
                          {review ? <Pencil size={13} /> : <Star size={13} />}{" "}
                          {review ? "Edit review" : "Write review"}
                        </button>
                        {review && (
                          <button
                            className="text-link muted"
                            onClick={() => setDeleting(review.reviewId)}
                          >
                            <Trash2 size={13} /> Delete review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <b>{money(item.subtotal)}</b>
                </div>
              );
            })}
          </section>
          <section className="panel form-section">
            <h2>
              <Truck size={19} /> Shipment details
            </h2>
            {order.shipments.map((s) => (
              <div className="shipment-info" key={s.shipmentId}>
                <div className="row between wrap">
                  <b>
                    {
                      merchants.find((m) => m.merchantId === s.merchantId)
                        ?.merchantName
                    }
                  </b>
                  <StatusBadge status={s.shippingStatus} />
                </div>
                <dl className="info-list">
                  <div>
                    <dt>Carrier</dt>
                    <dd>{s.carrier || "Awaiting assignment"}</dd>
                  </div>
                  <div>
                    <dt>Tracking number</dt>
                    <dd>{s.trackingNumber || "Not yet available"}</dd>
                  </div>
                  {s.shippedAt && (
                    <div>
                      <dt>Shipped</dt>
                      <dd>{date(s.shippedAt)}</dd>
                    </div>
                  )}
                  {s.deliveredAt && (
                    <div>
                      <dt>Delivered</dt>
                      <dd>{date(s.deliveredAt)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </section>
        </div>
        <div className="space-y-6">
          <section className="panel summary">
            <h2>Payment & total</h2>
            <div className="row between mb-6">
              <span>{order.payment.paymentMethod}</span>
              <StatusBadge status={order.payment.paymentStatus} />
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span>−{money(order.discountAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{money(order.shippingFee)}</span>
            </div>
            <div className="summary-total">
              <b>Total</b>
              <b>{money(order.totalAmount)}</b>
            </div>
          </section>
          <section className="panel form-section">
            <h2>Delivering to</h2>
            <b>{order.address.fullName}</b>
            <p className="muted leading-7 mt-2">
              {order.address.addressLine}
              <br />
              {order.address.district}, {order.address.province}{" "}
              {order.address.postalCode}
              <br />
              {order.address.phone}
            </p>
          </section>
        </div>
      </div>
      {reviewProduct && (
        <ReviewForm
          key={reviewProduct}
          productId={reviewProduct}
          existing={data.reviews.find(
            (r) =>
              r.productId === reviewProduct &&
              r.customerId === currentCustomer.customerId,
          )}
          onClose={() => setReviewProduct(null)}
        />
      )}{" "}
      {deleting && (
        <ConfirmDialog
          title="Delete your review?"
          description="Your review will be removed from the product page."
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            deleteReview(deleting);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
