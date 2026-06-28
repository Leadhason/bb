"use client";

import React, { useState } from "react";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteUnpublishedBeats } from "./actions";
import { useStore } from "../../../context/StoreContext";
import { useRouter } from "next/navigation";

export function DeleteUnpublishedBeatsButton({ count }: { count: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useStore();
  const router = useRouter();

  const handleDeleteAll = async () => {
    setIsLoading(true);
    try {
      const result = await deleteUnpublishedBeats();
      if (result.success) {
        showToast(result.message || `Successfully deleted draft beats`, "success");
        setShowConfirm(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete unpublished beats", "error");
      }
    } catch (error) {
      showToast("An error occurred during deletion", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (count === 0) return null;

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-badge-danger-bg border border-badge-danger-text/20 p-2 px-3 rounded-lg animate-fadeIn z-10 text-xs">
        <AlertTriangle className="w-4 h-4 text-badge-danger-text flex-shrink-0" />
        <span className="font-syne font-medium text-text-primary">
          Permanently delete {count} draft{count > 1 ? "s" : ""}? This cannot be undone.
        </span>
        <div className="flex gap-2 ml-3">
          <button
            onClick={handleDeleteAll}
            disabled={isLoading}
            className="btn-primary !bg-badge-danger-text !text-white h-7 px-3 text-[11px] font-syne font-semibold flex items-center gap-1 rounded"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Delete"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="btn-secondary h-7 px-3 text-[11px] font-syne font-medium rounded border border-border-strong hover:border-border-focus"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn-secondary h-10 px-4 text-xs font-syne font-medium flex items-center gap-2 text-badge-danger-text border border-badge-danger-text/30 hover:bg-badge-danger-bg/25 rounded-md transition-colors"
      title="Delete all draft beats permanently"
    >
      <Trash2 className="w-4 h-4" />
      Clear Drafts ({count})
    </button>
  );
}
