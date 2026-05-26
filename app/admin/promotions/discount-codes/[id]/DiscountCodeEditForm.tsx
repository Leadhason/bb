"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDiscountCode, DiscountCodeWithStats } from "../../actions";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface DiscountCodeEditFormProps {
  code: DiscountCodeWithStats;
}

export function DiscountCodeEditForm({ code }: DiscountCodeEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    code: code.code,
    type: code.type as "PERCENTAGE" | "FIXED",
    value: code.value,
    usageLimit: code.usageLimit?.toString() || "",
    expiresAt: code.expiresAt ? new Date(code.expiresAt).toISOString().split("T")[0] : "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "value" || name === "usageLimit" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.code.trim()) {
        throw new Error("Code is required");
      }

      if (formData.value <= 0) {
        throw new Error("Discount value must be greater than 0");
      }

      const payload: any = {
        code: formData.code,
        type: formData.type,
        value: formData.value,
      };

      if (formData.usageLimit) {
        payload.usageLimit = parseInt(formData.usageLimit as any);
      } else {
        payload.usageLimit = null;
      }

      if (formData.expiresAt) {
        payload.expiresAt = new Date(formData.expiresAt);
      } else {
        payload.expiresAt = null;
      }

      await updateDiscountCode(code.id, payload);
      router.push("/admin/promotions/discount-codes");
    } catch (err: any) {
      setError(err.message || "Failed to update discount code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Back Button */}
      <Link
        href="/admin/promotions/discount-codes"
        className="inline-flex items-center gap-2 text-accent hover:text-text-primary transition-colors font-syne font-medium text-sm mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Discount Codes
      </Link>

      <form
        onSubmit={handleSubmit}
        className="bg-bg-surface border border-border-subtle rounded-lg p-8 space-y-6"
      >
        <h2 className="font-syne font-semibold text-lg text-text-primary">
          Edit Discount Code
        </h2>

        {error && (
          <div className="p-4 bg-[var(--badge-danger-bg)] bg-opacity-20 border border-[var(--badge-danger-text)] rounded-md">
            <p className="text-sm text-[var(--badge-danger-text)] font-medium">{error}</p>
          </div>
        )}

        {/* Code Input */}
        <div>
          <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
            Code
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., DRILL20"
            className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-dm-mono text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-strong transition-colors uppercase"
            disabled={loading}
          />
          <p className="text-xs text-text-muted mt-1">
            Letters and numbers only. Will be converted to uppercase.
          </p>
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
              Discount Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-syne text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
              disabled={loading}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
              {formData.type === "PERCENTAGE" ? "Discount %" : "Discount $"}
            </label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              min="0"
              step={formData.type === "PERCENTAGE" ? "1" : "0.01"}
              className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-dm-mono text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
              disabled={loading}
            />
          </div>
        </div>

        {/* Usage Limit */}
        <div>
          <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
            Usage Limit (Optional)
          </label>
          <input
            type="number"
            name="usageLimit"
            value={formData.usageLimit}
            onChange={handleChange}
            placeholder="e.g., 50"
            className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-dm-mono text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-strong transition-colors"
            disabled={loading}
            min="1"
          />
          <p className="text-xs text-text-muted mt-1">
            Leave empty for unlimited uses. Current usage: {code.usageCount}
          </p>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
            Expiry Date (Optional)
          </label>
          <input
            type="date"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
            className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-dm-mono text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
            disabled={loading}
          />
          <p className="text-xs text-text-muted mt-1">
            Leave empty for no expiry.
          </p>
        </div>

        {/* Preview */}
        <div className="p-4 bg-bg-elevated rounded-md border border-border-subtle">
          <p className="text-xs text-text-muted font-syne uppercase tracking-wider mb-2">Preview</p>
          <p className="font-dm-mono text-sm text-text-primary">
            {formData.code} → {formData.type === "PERCENTAGE" ? `${formData.value}% off` : `$${formData.value} off`}
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border-subtle">
          <Link
            href="/admin/promotions/discount-codes"
            className="btn-secondary h-11 px-8 rounded-md font-medium text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary h-11 px-8 rounded-md font-medium text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
