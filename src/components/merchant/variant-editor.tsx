"use client";
import { ProductVariant } from "@/types";
import { Plus, Trash2 } from "lucide-react";

export const blankVariant = (): ProductVariant => ({
  variantId: "",
  productId: "",
  variantName: "",
  color: "",
  size: "",
  sku: "",
  price: 0,
  stockQuantity: 0,
});

export function VariantEditor({
  variants,
  onChange,
  errors,
}: {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  errors: Record<string, string>;
}) {
  function update(index: number, key: keyof ProductVariant, value: string) {
    onChange(
      variants.map((v, i) =>
        i === index
          ? {
              ...v,
              [key]:
                key === "price" || key === "stockQuantity"
                  ? value === ""
                    ? NaN
                    : Number(value)
                  : value,
            }
          : v,
      ),
    );
  }
  return (
    <section className="variant-editor">
      <div className="row between">
        <h3>Product variants</h3>
        <button
          type="button"
          className="text-link"
          onClick={() => onChange([...variants, blankVariant()])}
        >
          <Plus size={15} /> Add variant
        </button>
      </div>
      {errors.variants && (
        <small className="field-error">{errors.variants}</small>
      )}
      {variants.map((v, index) => (
        <div className="variant-row" key={index}>
          <div className="row between mb-3">
            <b className="text-sm">Variant {index + 1}</b>
            <button
              type="button"
              className="icon-button"
              aria-label={"Remove variant " + (index + 1)}
              onClick={() => onChange(variants.filter((_, i) => i !== index))}
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="form-grid">
            {(
              [
                { key: "variantName", label: "Variant name" },
                { key: "color", label: "Color (optional)" },
                { key: "size", label: "Size (optional)" },
                { key: "sku", label: "SKU" },
                { key: "price", label: "Price (THB)" },
                { key: "stockQuantity", label: "Stock quantity" },
              ] as { key: keyof ProductVariant; label: string }[]
            ).map((f) => {
              const numeric = f.key === "price" || f.key === "stockQuantity";
              const error = errors[index + "-" + f.key];
              return (
                <label key={f.key} className="field">
                  {f.label}
                  <input
                    type={numeric ? "number" : "text"}
                    aria-label={f.label}
                    value={
                      typeof v[f.key] === "number" && !Number.isFinite(v[f.key])
                        ? ""
                        : v[f.key]
                    }
                    min={numeric ? 0 : undefined}
                    step={
                      f.key === "price" ? "0.01" : numeric ? "1" : undefined
                    }
                    onChange={(e) => update(index, f.key, e.target.value)}
                    aria-invalid={!!error}
                  />
                  {error && <small className="field-error">{error}</small>}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
