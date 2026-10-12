"use client";
import { Modal } from "@/components/ui/dialog";
import { useStore } from "@/context/store-provider";
import { Product, ProductInput } from "@/types";
import { useState } from "react";
import { blankVariant, VariantEditor } from "./variant-editor";

export function ProductForm({
  product,
  merchantId,
  onClose,
}: {
  product?: Product;
  merchantId: string;
  onClose: () => void;
}) {
  const { data, saveProduct } = useStore();
  const { categories, merchants } = data;
  const [form, setForm] = useState<ProductInput>({
    merchantId: product?.merchantId ?? merchantId,
    name: product?.name ?? "",
    description: product?.description ?? "",
    categoryId: product?.categoryId ?? "",
    active: product?.active ?? true,
    variants: product
      ? data.variants
          .filter((v) => v.productId === product.productId)
          .map((v) => ({ ...v, originalStockQuantity: v.stockQuantity }))
      : [blankVariant()],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const next: Record<string, string> = {};
    if (!form.merchantId) next.merchantId = "Choose a merchant.";
    if (!form.name.trim()) next.name = "Product name is required.";
    if (!form.categoryId) next.categoryId = "Choose a category.";
    if (!form.variants.length) next.variants = "Add at least one variant.";
    form.variants.forEach((v, i) => {
      if (!v.variantName.trim())
        next[i + "-variantName"] = "Variant name is required.";
      if (!v.sku.trim()) next[i + "-sku"] = "SKU is required.";
      else if (
        data.variants.some(
          (other) =>
            other.productId !== product?.productId &&
            other.sku.toLowerCase() === v.sku.trim().toLowerCase(),
        ) ||
        form.variants.some(
          (other, j) =>
            j !== i &&
            other.sku.trim().toLowerCase() === v.sku.trim().toLowerCase(),
        )
      )
        next[i + "-sku"] = "SKU must be unique.";
      if (!Number.isFinite(v.price) || v.price < 0)
        next[i + "-price"] = "Enter a price of 0 or more.";
      if (!Number.isInteger(v.stockQuantity) || v.stockQuantity < 0)
        next[i + "-stockQuantity"] = "Enter a whole number of 0 or more.";
    });
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
    try {
      await saveProduct(
        {
          ...form,
          name: form.name.trim(),
        },
        product?.productId,
      );
      onClose();
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Could not save this product.",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={product ? "Edit product" : "Add a product"} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <label className="field col-span-full">
            Merchant
            <select
              aria-label="Product merchant"
              value={form.merchantId}
              disabled={!!product}
              onChange={(e) => setForm({ ...form, merchantId: e.target.value })}
              aria-invalid={!!errors.merchantId}
            >
              <option value="">Select a merchant</option>
              {merchants.map((m) => <option key={m.merchantId} value={m.merchantId}>{m.merchantName}</option>)}
            </select>
            {errors.merchantId && <small className="field-error">{errors.merchantId}</small>}
          </label>
          <label className="field col-span-full">
            Product name
            <input
              aria-label="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <small className="field-error">{errors.name}</small>
            )}
          </label>
          <label className="field col-span-full">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label className="field">
            Category
            <select
              aria-label="Category"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              aria-invalid={!!errors.categoryId}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <small className="field-error">{errors.categoryId}</small>
            )}
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />{" "}
            Active · visible in the storefront
          </label>
        </div>
        <VariantEditor
          variants={form.variants}
          onChange={(variants) => setForm({ ...form, variants })}
          errors={errors}
        />
        {errors.submit && (
          <p className="field-error" role="alert">
            {errors.submit}
          </p>
        )}
        <div className="actions mt-6">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button" disabled={busy}>
            {product ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
