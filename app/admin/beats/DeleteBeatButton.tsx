"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteBeat } from "./actions";
import { useStore } from "../../../context/StoreContext";
import { useRouter } from "next/navigation";

export function DeleteBeatButton({ beatId, beatTitle }: { beatId: string; beatTitle: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useStore();
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteBeat(beatId);
      if (result.success) {
        showToast(`"${beatTitle}" deleted successfully`, "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete beat", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-1">
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="btn-danger h-8 px-3 text-xs uppercase font-syne font-medium flex items-center gap-1"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isLoading}
          className="btn-ghost h-8 px-3 text-xs"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn-icon text-badge-danger-text border-badge-danger-text hover:bg-badge-danger-bg"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
