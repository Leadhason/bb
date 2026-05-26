import React from "react";
import Link from "next/link";
import { getBulkDiscountRules } from "../actions";
import { Plus, Zap, AlertCircle } from "lucide-react";
import { BulkDiscountToggle } from "./BulkDiscountToggle";
import { DeleteBulkDiscountButton } from "./DeleteBulkDiscountButton";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function BulkDiscountsPage() {
  const rules = await getBulkDiscountRules();

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Promotions", href: "/admin/promotions" },
        { label: "Bulk Discounts" },
      ]} />
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-text-secondary" />
            <h1 className="font-syne font-bold text-3xl text-text-primary uppercase tracking-wide">
              Bulk Discounts
            </h1>
          </div>
          <p className="text-sm text-text-secondary">
            {rules.length} {rules.length === 1 ? "rule" : "rules"} configured
          </p>
        </div>
        <Link
          href="/admin/promotions/bulk-discounts/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-opacity-90 text-white font-syne font-medium text-sm rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
        <h3 className="font-syne font-semibold text-sm text-text-primary uppercase tracking-wider mb-3">
          How Bulk Discounts Work
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Bulk discounts apply automatically at checkout when a customer purchases multiple beats in one order. For example, "Buy 3+ beats, get 10% off" means if someone adds 3 or more beats to their cart, the 10% discount applies to the entire order. You can choose whether these discounts stack with discount codes.
        </p>
      </div>

      {/* Rules Table */}
      {rules.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="font-syne font-medium text-text-secondary mb-1">No bulk discounts yet</p>
          <p className="text-xs text-text-muted mb-6">
            Create your first bulk discount rule to encourage larger purchases
          </p>
          <Link
            href="/admin/promotions/bulk-discounts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-opacity-90 text-white font-syne font-medium text-sm rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Bulk Discount
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Minimum Quantity
                </th>
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Discount
                </th>
                <th className="text-center py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Stackable
                </th>
                <th className="text-center py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b border-border-subtle hover:bg-bg-hover transition-colors"
                >
                  {/* Min Quantity */}
                  <td className="py-3 px-4">
                    <p className="font-dm-mono text-sm font-bold text-text-primary">
                      {rule.minQuantity} beat{rule.minQuantity > 1 ? "s" : ""}{rule.minQuantity > 1 ? "+" : ""}
                    </p>
                    <p className="text-xs text-text-muted">Minimum purchase</p>
                  </td>

                  {/* Discount */}
                  <td className="py-3 px-4">
                    <p className="font-syne font-bold text-sm text-accent">
                      {rule.discountPercent}% off
                    </p>
                    <p className="text-xs text-text-muted">Automatic discount</p>
                  </td>

                  {/* Stackable */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-syne text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider ${
                        rule.stackable
                          ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                          : "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                      }`}
                    >
                      {rule.stackable ? "Yes" : "No"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-syne text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider ${
                        rule.active
                          ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                          : "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                      }`}
                    >
                      {rule.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <BulkDiscountToggle ruleId={rule.id} isActive={rule.active} />
                      <Link
                        href={`/admin/promotions/bulk-discounts/${rule.id}`}
                        className="text-xs text-accent hover:text-text-primary transition-colors font-syne font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteBulkDiscountButton ruleId={rule.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
