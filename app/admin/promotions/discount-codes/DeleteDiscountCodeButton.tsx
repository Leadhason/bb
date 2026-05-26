"use client";

import React, { useState } from "react";
import { deleteDiscountCode } from "../actions";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteDiscountCodeButtonProps {
  codeId: string;
}

export function DeleteDiscountCodeButton({ codeId }: DeleteDiscountCodeButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDiscountCode(codeId);
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete discount code:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-[var(--badge-danger-text)] hover:text-white hover:bg-[var(--badge-danger-bg)] px-2 py-1 rounded transition-colors font-syne font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded transition-colors font-syne font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-xs text-text-secondary hover:text-[var(--badge-danger-text)] transition-colors font-syne font-medium"
      title="Delete"
    >
      <Trash2 className="w-3 h-3" />
    </button>
  );
}
