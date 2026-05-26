"use client";

import React, { useState } from "react";
import { toggleDiscountCodeActive } from "../actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface DiscountCodeToggleProps {
  codeId: string;
  isActive: boolean;
}

export function DiscountCodeToggle({ codeId, isActive }: DiscountCodeToggleProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleDiscountCodeActive(codeId, !isActive);
    } catch (error) {
      console.error("Failed to toggle discount code:", error);
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
