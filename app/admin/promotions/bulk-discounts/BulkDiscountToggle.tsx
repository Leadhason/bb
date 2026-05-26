"use client";

import React, { useState } from "react";
import { toggleBulkDiscountRuleActive } from "../actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface BulkDiscountToggleProps {
  ruleId: string;
  isActive: boolean;
}

export function BulkDiscountToggle({ ruleId, isActive }: BulkDiscountToggleProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleBulkDiscountRuleActive(ruleId, !isActive);
    } catch (error) {
      console.error("Failed to toggle bulk discount rule:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors font-syne font-medium disabled:opacity-50"
      title={isActive ? "Deactivate" : "Activate"}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isActive ? (
        <Eye className="w-3 h-3" />
      ) : (
        <EyeOff className="w-3 h-3" />
      )}
    </button>
  );
}
