import React from "react";
import Link from "next/link";
import { Tag, Zap, Plus } from "lucide-react";
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
        <Link href="/admin/promotions/discount-codes">
          <div className="bg-bg-surface border border-border-subtle hover:border-border-strong rounded-lg p-8 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-md bg-bg-elevated flex items-center justify-center group-hover:bg-accent group-hover:bg-opacity-20 transition-colors">
                <Tag className="w-6 h-6 text-accent" />
              </div>
              <Plus className="w-5 h-5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h2 className="font-syne font-semibold text-lg text-text-primary mb-2 group-hover:text-accent transition-colors">
              Discount Codes
            </h2>
            <p className="text-sm text-text-secondary">
              Create and manage promotional codes with percentage or fixed discounts
            </p>
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-muted font-dm-mono">
                DRILL20, FREEBEAT, and more
              </p>
            </div>
          </div>
        </Link>

        {/* Bulk Discounts Card */}
        <Link href="/admin/promotions/bulk-discounts">
          <div className="bg-bg-surface border border-border-subtle hover:border-border-strong rounded-lg p-8 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-md bg-bg-elevated flex items-center justify-center group-hover:bg-accent group-hover:bg-opacity-20 transition-colors">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <Plus className="w-5 h-5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h2 className="font-syne font-semibold text-lg text-text-primary mb-2 group-hover:text-accent transition-colors">
              Bulk Discounts
            </h2>
            <p className="text-sm text-text-secondary">
              Set rules like "Buy 3+ beats, get 10% off" that apply automatically at checkout
            </p>
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-muted">
                Optionally stackable with discount codes
              </p>
            </div>
          </div>
        </Link>

        {/* Giveaways Card */}
        <Link href="/admin/beats">
          <div className="bg-bg-surface border border-border-subtle hover:border-border-strong rounded-lg p-8 transition-all cursor-pointer group md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-md bg-bg-elevated flex items-center justify-center group-hover:bg-accent group-hover:bg-opacity-20 transition-colors">
                <span className="text-lg font-bold text-accent">$0</span>
              </div>
              <Plus className="w-5 h-5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h2 className="font-syne font-semibold text-lg text-text-primary mb-2 group-hover:text-accent transition-colors">
              Beat Giveaways
            </h2>
            <p className="text-sm text-text-secondary">
              Set a beat's price to $0 in the beat editor to give it away for free. Customers will receive the WAV download without payment.
            </p>
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-muted">
                Edit any beat → Toggle "Free beat (giveaway)" checkbox
              </p>
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
