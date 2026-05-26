import React from "react";
import Link from "next/link";
import { getDiscountCodes } from "../actions";
import { Plus, Tag, Calendar, AlertCircle, Eye, EyeOff } from "lucide-react";
import { DiscountCodeToggle } from "./DiscountCodeToggle";
import { DeleteDiscountCodeButton } from "./DeleteDiscountCodeButton";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function DiscountCodesPage() {
  const codes = await getDiscountCodes();

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Promotions", href: "/admin/promotions" },
        { label: "Discount Codes" },
      ]} />
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-text-secondary" />
            <h1 className="font-syne font-bold text-3xl text-text-primary uppercase tracking-wide">
              Discount Codes
            </h1>
          </div>
          <p className="text-sm text-text-secondary">
            {codes.length} {codes.length === 1 ? "code" : "codes"} created
          </p>
        </div>
        <Link
          href="/admin/promotions/discount-codes/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-opacity-90 text-white font-syne font-medium text-sm rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Code
        </Link>
      </div>

      {/* Codes Table */}
      {codes.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="font-syne font-medium text-text-secondary mb-1">No discount codes yet</p>
          <p className="text-xs text-text-muted mb-6">
            Create your first promotional code to get started
          </p>
          <Link
            href="/admin/promotions/discount-codes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-opacity-90 text-white font-syne font-medium text-sm rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Discount Code
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Code
                </th>
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Discount
                </th>
                <th className="text-center py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Usage
                </th>
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Expires
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
              {codes.map((code) => (
                <tr
                  key={code.id}
                  className={`border-b border-border-subtle hover:bg-bg-hover transition-colors ${
                    isExpired(code.expiresAt) ? "opacity-60" : ""
                  }`}
                >
                  {/* Code */}
                  <td className="py-3 px-4">
                    <code className="font-dm-mono text-sm font-bold text-text-primary bg-bg-elevated px-3 py-1 rounded">
                      {code.code}
                    </code>
                  </td>

                  {/* Discount */}
                  <td className="py-3 px-4">
                    <p className="font-syne font-medium text-sm text-text-primary">
                      {code.type === "PERCENTAGE" ? `${code.value}%` : `$${code.value.toFixed(2)}`}
                    </p>
                    <p className="text-xs text-text-muted">
                      {code.type === "PERCENTAGE" ? "Percentage off" : "Fixed discount"}
                    </p>
                  </td>

                  {/* Usage */}
                  <td className="py-3 px-4 text-center">
                    {code.usageLimit ? (
                      <div>
                        <p className="font-dm-mono text-sm font-bold text-text-primary">
                          {code.usageCount}/{code.usageLimit}
                        </p>
                        <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-accent transition-all"
                            style={{
                              width: `${(code.usageCount / code.usageLimit) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <p className="font-dm-mono text-sm text-text-secondary">Unlimited</p>
                    )}
                  </td>

                  {/* Expires */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-text-secondary" />
                      <span
                        className={`text-xs ${
                          isExpired(code.expiresAt)
                            ? "text-[var(--badge-danger-text)]"
                            : "text-text-secondary"
                        }`}
                      >
                        {formatDate(code.expiresAt)}
                        {isExpired(code.expiresAt) && " (Expired)"}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-syne text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider ${
                        code.active
                          ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                          : "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]"
                      }`}
                    >
                      {code.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DiscountCodeToggle codeId={code.id} isActive={code.active} />
                      <Link
                        href={`/admin/promotions/discount-codes/${code.id}`}
                        className="text-xs text-accent hover:text-text-primary transition-colors font-syne font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteDiscountCodeButton codeId={code.id} />
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
