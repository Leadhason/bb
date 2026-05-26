import React from "react";
import { BulkDiscountForm } from "./BulkDiscountForm";
import { Zap } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function NewBulkDiscountPage() {
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Promotions", href: "/admin/promotions" },
        { label: "Bulk Discounts", href: "/admin/promotions/bulk-discounts" },
        { label: "New Rule" },
      ]} />
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-text-secondary" />
          <h1 className="font-syne font-bold text-3xl text-text-primary uppercase tracking-wide">
            New Bulk Discount
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Create an automatic discount rule for multiple purchases
        </p>
      </div>

      {/* Form */}
      <BulkDiscountForm />
    </div>
  );
}
