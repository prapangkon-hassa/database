"use client";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCartLines } from "@/components/cart/use-cart-lines";
import { EmptyState, LoadingSkeleton } from "@/components/ui/feedback";
import { useStore } from "@/context/store-provider";
import { money } from "@/lib/utils";
import { CheckoutInput, PaymentMethod } from "@/types";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const fields: {
  key: keyof Omit<CheckoutInput, "paymentMethod">;
  label: string;
  type?: string;
  autoComplete: string;
}[] = [
  { key: "fullName", label: "Full name", autoComplete: "name" },
  {
    key: "email",
    label: "Email address",
    type: "email",
    autoComplete: "email",
  },
  { key: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
  { key: "addressLine", label: "Address line", autoComplete: "street-address" },
  { key: "district", label: "District", autoComplete: "address-level2" },
  { key: "province", label: "Province", autoComplete: "address-level1" },
  { key: "postalCode", label: "Postal code", autoComplete: "postal-code" },
];

export function CheckoutPage() {
  const { ready, checkout } = useStore();
  const lines = useCartLines();
  const [form, setForm] = useState<CheckoutInput>({
    fullName: "",
    email: "",
    phone: "",
    addressLine: "",
    district: "",
    province: "",
    postalCode: "",
    paymentMethod: "" as PaymentMethod,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState("");
  const subtotal = lines.reduce((n, i) => n + i.quantity * i.variant.price, 0);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const next: Record<string, string> = {};
    fields.forEach((f) => {
      if (!form[f.key].trim()) next[f.key] = f.label + " is required.";
    });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      next.email = "Enter a valid email address.";
    if (!form.paymentMethod) next.paymentMethod = "Choose a payment method.";
    setErrors(next);
    if (Object.keys(next).length) {
      setTimeout(
        () =>
          document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        0,
      );
      return;
    }
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      // TODO POST /api/orders/checkout. Display the ASP.NET result/errors here.
      setOrderId(checkout(form));
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Could not place your order. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <div className="container section">
        <LoadingSkeleton />
      </div>
    );
  if (orderId)
    return (
      <div className="container section">
        <div className="success-panel panel">
          <CheckCircle2 size={54} />
          <span className="eyebrow">A FEW GOOD THINGS ARE ON THEIR WAY</span>
          <h1>Thank you, {form.fullName.split(" ")[0]}.</h1>
          <p>
            Your demo order <b>{orderId}</b> has been placed.
          </p>
          <p className="muted">
            No real payment was taken. Payment is pending.
          </p>
          <Link className="button" href={"/orders/" + orderId}>
            View your order <ArrowRight size={16} />
          </Link>
          <Link className="text-link" href="/">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  if (!lines.length)
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add an item before checking out."
      >
        <Link className="button" href="/">
          Explore products
        </Link>
      </EmptyState>
    );
  function field(f: (typeof fields)[number]) {
    return (
      <label
        className={"field " + (f.key === "addressLine" ? "col-span-full" : "")}
        key={f.key}
      >
        {f.label}
        <input
          type={f.type ?? "text"}
          autoComplete={f.autoComplete}
          aria-label={f.label}
          value={form[f.key]}
          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          aria-invalid={!!errors[f.key]}
          aria-describedby={errors[f.key] ? "error-" + f.key : undefined}
          required
        />
        {errors[f.key] && (
          <small id={"error-" + f.key} className="field-error">
            {errors[f.key]}
          </small>
        )}
      </label>
    );
  }
  return (
    <div className="container section">
      <Link href="/cart" className="back-link">
        <ArrowLeft size={15} /> Back to cart
      </Link>
      <div className="page-heading">
        <span className="eyebrow">ONE LAST STEP</span>
        <h1>
          Checkout<span className="heading-dot">.</span>
        </h1>
        <p>A few details, and we’ll take it from here.</p>
      </div>
      <form noValidate onSubmit={submit} className="checkout-grid">
        <div className="space-y-6">
          <section className="panel form-section">
            <h2>
              <span className="step-number">1</span> Customer information
            </h2>
            <div className="form-grid">{fields.slice(0, 3).map(field)}</div>
          </section>
          <section className="panel form-section">
            <h2>
              <span className="step-number">2</span> Shipping address
            </h2>
            <div className="form-grid">{fields.slice(3).map(field)}</div>
          </section>
          <section className="panel form-section">
            <h2>
              <span className="step-number">3</span> Payment method
            </h2>
            <fieldset
              aria-describedby={
                errors.paymentMethod ? "payment-error" : undefined
              }
            >
              <legend className="sr-only">Choose a payment method</legend>
              {(
                [
                  "QR Payment",
                  "Credit/Debit Card",
                  "Cash on Delivery",
                ] as PaymentMethod[]
              ).map((method) => (
                <label className="payment-option" key={method}>
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={() => setForm({ ...form, paymentMethod: method })}
                  />
                  <span>{method}</span>
                  <small>Demo</small>
                </label>
              ))}
            </fieldset>
            {errors.paymentMethod && (
              <small id="payment-error" className="field-error">
                {errors.paymentMethod}
              </small>
            )}
          </section>
        </div>
        <OrderSummary subtotal={subtotal}>
          <div className="checkout-items">
            {lines.map((i) => (
              <div key={i.variantId}>
                <div className="row between gap-4">
                  <span>
                    {i.product.name} × {i.quantity}
                  </span>
                  <b>{money(i.variant.price * i.quantity)}</b>
                </div>
                <small>
                  {i.variant.variantName} · {money(i.variant.price)} each
                </small>
              </div>
            ))}
          </div>
          {errors.submit && (
            <p role="alert" className="field-error mb-4">
              {errors.submit}
            </p>
          )}
          <button disabled={busy} className="button w-full" type="submit">
            {busy ? "Placing your order…" : "Place order"}
            {!busy && <ArrowRight size={16} />}
          </button>
        </OrderSummary>
      </form>
    </div>
  );
}
