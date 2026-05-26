"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBulkDiscountRule } from "../../actions";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export function BulkDiscountForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    minQuantity: 3,
    discountPercent: 10,
    stackable: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "minQuantity" || name === "discountPercent"
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (formData.minQuantity < 2) {
        throw new Error("Minimum quantity must be at least 2 beats");
      }

      if (formData.discountPercent <= 0 || formData.discountPercent > 100) {
        throw new Error("Discount percentage must be between 1% and 100%");
      }

      await createBulkDiscountRule({
        minQuantity: formData.minQuantity,
        discountPercent: formData.discountPercent,
        stackable: formData.stackable,
      });

      router.push("/admin/promotions/bulk-discounts");
    } catch (err: any) {
      setError(err.message || "Failed to create bulk discount rule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Back Button */}
      <Link
        href="/admin/promotions/bulk-discounts"
        className="inline-flex items-center gap-2 text-accent hover:text-text-primary transition-colors font-syne font-medium text-sm mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Bulk Discounts
      </Link>

      <form
        onSubmit={handleSubmit}
        className="bg-bg-surface border border-border-subtle rounded-lg p-8 space-y-6"
      >
        <h2 className="font-syne font-semibold text-lg text-text-primary">
          Create Bulk Discount Rule
        </h2>

        {error && (
          <div className="p-4 bg-[var(--badge-danger-bg)] bg-opacity-20 border border-[var(--badge-danger-text)] rounded-md">
            <p className="text-sm text-[var(--badge-danger-text)] font-medium">{error}</p>
          </div>
        )}

        {/* Rule Description */}
        <div className="bg-bg-elevated rounded-lg p-4 border border-border-subtle">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Rule</p>
          <p className="text-sm font-syne font-medium text-text-primary">
            Buy <span className="text-accent font-bold">{formData.minQuantity}+</span> beats, get{" "}
            <span className="text-accent font-bold">{formData.discountPercent}%</span> off
            {formData.stackable && (
              <span className="text-xs text-text-secondary ml-2">(stackable with codes)</span>
            )}
          </p>
        </div>

        {/* Minimum Quantity */}
        <div>
          <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
            Minimum Quantity
          </label>
          <input
            type="number"
            name="minQuantity"
            value={formData.minQuantity}
            onChange={handleChange}
            min="2"
            max="100"
            className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-dm-mono text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
            disabled={loading}
          />
          <p className="text-xs text-text-muted mt-1">
            Discount applies when customer purchases this many beats or more
          </p>
        </div>

        {/* Discount Percentage */}
        <div>
          <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
            Discount Percentage
          </label>
          <input
            type="number"
            name="discountPercent"
            value={formData.discountPercent}
            onChange={handleChange}
            min="1"
            max="100"
            step="1"
            className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-dm-mono text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
            disabled={loading}
          />
          <p className="text-xs text-text-muted mt-1">
            Percentage discount applied to the entire order
          </p>
        </div>

        {/* Stackable Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="stackable"
            id="stackable"
            checked={formData.stackable}
            onChange={handleChange}
            className="w-4 h-4 rounded bg-bg-elevated border border-border-subtle cursor-pointer"
            disabled={loading}
          />
          <label
            htmlFor="stackable"
            className="flex-1 cursor-pointer font-syne font-medium text-sm text-text-primary"
          >
            Stackable with discount codes
          </label>
        </div>
        <p className="text-xs text-text-muted">
          If enabled, customers can use both a discount code AND qualify for this bulk discount. If disabled, only the larger discount applies.
        </p>

        {/* Example */}
        <div className="bg-bg-elevated rounded-lg p-4 border border-border-subtle">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Example</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            A customer adds 3 beats at $10 each (total: $30). With your {formData.discountPercent}% bulk discount:
            <br />
            <span className="font-bold text-accent">
              Final price: ${(30 * (1 - formData.discountPercent / 100)).toFixed(2)}
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-accent hover:bg-opacity-90 text-white font-syne font-medium text-sm py-2 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Bulk Discount
          </button>
          <Link
            href="/admin/promotions/bulk-discounts"
            className="flex-1 bg-bg-elevated hover:bg-bg-hover border border-border-default text-text-primary font-syne font-medium text-sm py-2 rounded-md transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
