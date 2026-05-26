import React from "react";
import { DiscountCodeForm } from "./DiscountCodeForm";
import { Tag } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function NewDiscountCodePage() {
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Promotions", href: "/admin/promotions" },
        { label: "Discount Codes", href: "/admin/promotions/discount-codes" },
        { label: "New Code" },
      ]} />
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-text-secondary" />
          <h1 className="font-syne font-bold text-3xl text-text-primary uppercase tracking-wide">
            New Discount Code
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Create a promotional code for your customers
        </p>
      </div>

      {/* Form */}
      <DiscountCodeForm />
    </div>
  );
}
