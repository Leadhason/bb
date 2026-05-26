import React from "react";
import { getBulkDiscountRuleById } from "../../actions";
import { BulkDiscountEditForm } from "./BulkDiscountEditForm";
import { Percent } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function EditBulkDiscountPage({
  params,
}: {
  params: { id: string };
}) {
  const rule = await getBulkDiscountRuleById(params.id);

  if (!rule) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Promotions", href: "/admin/promotions" },
        { label: "Bulk Discounts", href: "/admin/promotions/bulk-discounts" },
        { label: `${rule.minQuantity}+ at ${rule.discountPercent}%` },
      ]} />
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Percent className="w-5 h-5 text-text-secondary" />
          <h1 className="font-syne font-bold text-3xl text-text-primary uppercase tracking-wide">
            Edit Bulk Discount
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Modify the bulk discount rule settings
        </p>
      </div>

      {/* Form */}
      <BulkDiscountEditForm rule={rule} />
    </div>
  );
}
