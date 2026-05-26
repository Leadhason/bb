import React from "react";
import { getDiscountCodeById } from "../../actions";
import { DiscountCodeEditForm } from "./DiscountCodeEditForm";
import { Tag } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function EditDiscountCodePage({
  params,
}: {
  params: { id: string };
}) {
  const code = await getDiscountCodeById(params.id);

  if (!code) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Promotions", href: "/admin/promotions" },
        { label: "Discount Codes", href: "/admin/promotions/discount-codes" },
        { label: code.code },
      ]} />
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-text-secondary" />
          <h1 className="font-syne font-bold text-3xl text-text-primary uppercase tracking-wide">
            Edit Discount Code
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Modify the promotional code settings
        </p>
      </div>

      {/* Form */}
      <DiscountCodeEditForm code={code} />
    </div>
  );
}
