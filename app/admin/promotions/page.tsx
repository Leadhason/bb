import React from "react";
import Link from "next/link";
import { Tag, Zap, Gift, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function PromotionsPage() {
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Promotions" },
      ]} />
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-text-secondary" />
          <h1 className="font-syne font-bold text-3xl text-text-primary uppercase tracking-wide">
            Promotions
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Manage discount codes, bulk discounts, and giveaways
        </p>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Discount Codes Card */}
        <Link href="/admin/promotions/discount-codes" className="group">
          <div className="bg-bg-surface border border-border-default hover:border-border-focus rounded-xl p-6 transition-all shadow-sm flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-lg bg-bg-elevated border border-border-default group-hover:border-border-focus flex items-center justify-center transition-colors">
                <Tag className="w-5 h-5 text-text-primary" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <h2 className="font-syne font-semibold text-lg text-text-primary mb-1.5">
              Discount Codes
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed flex-1">
              Create and manage promotional codes with percentage or fixed USD discounts, custom usage limits, and expiration dates.
            </p>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-mono uppercase tracking-wider">Examples:</span>
              <span className="text-[11px] text-text-secondary font-mono">DRILL20 · WELCOME15</span>
            </div>
          </div>
        </Link>

        {/* Bulk Discounts Card */}
        <Link href="/admin/promotions/bulk-discounts" className="group">
          <div className="bg-bg-surface border border-border-default hover:border-border-focus rounded-xl p-6 transition-all shadow-sm flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-lg bg-bg-elevated border border-border-default group-hover:border-border-focus flex items-center justify-center transition-colors">
                <Zap className="w-5 h-5 text-text-primary" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <h2 className="font-syne font-semibold text-lg text-text-primary mb-1.5">
              Bulk Discounts
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed flex-1">
              Configure volume-based pricing rules like "Buy 3+ beats, get 15% off" that apply automatically at checkout.
            </p>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-mono uppercase tracking-wider">Features:</span>
              <span className="text-[11px] text-text-secondary font-mono">Volume Tiers · Stackable Option</span>
            </div>
          </div>
        </Link>

        {/* Giveaways Card */}
        <Link href="/admin/beats" className="group md:col-span-2">
          <div className="bg-bg-surface border border-border-default hover:border-border-focus rounded-xl p-6 transition-all shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-lg bg-bg-elevated border border-border-default group-hover:border-border-focus flex items-center justify-center transition-colors">
                <Gift className="w-5 h-5 text-text-primary" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <h2 className="font-syne font-semibold text-lg text-text-primary mb-1.5">
              Beat Giveaways
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Set any beat's license price to $0 in the beat editor. Customers can claim and download clean WAV files without entering payment info.
            </p>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-mono uppercase tracking-wider">How to enable:</span>
              <span className="text-[11px] text-text-secondary font-mono">Beats → Edit Beat → Toggle "Free Beat (Giveaway)"</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
        <h3 className="font-syne font-semibold text-sm text-text-primary uppercase tracking-wider mb-3">
          How Promotions Work
        </h3>
        <ul className="space-y-2 text-xs text-text-secondary">
          <li className="flex gap-3">
            <span className="text-accent font-bold flex-shrink-0">1.</span>
            <span><strong>Discount Codes:</strong> Share codes with your audience. Customers enter them at checkout to get % or $ off.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent font-bold flex-shrink-0">2.</span>
            <span><strong>Bulk Discounts:</strong> Automatically apply discounts when customers buy multiple beats (e.g., 10% off for 3+).</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent font-bold flex-shrink-0">3.</span>
            <span><strong>Stackability:</strong> Choose whether bulk discounts can combine with discount codes.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent font-bold flex-shrink-0">4.</span>
            <span><strong>Giveaways:</strong> Set a beat's price to $0 to let fans download for free (still generates order records).</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
