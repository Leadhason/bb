"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { toggleBeatPublish } from "./actions";
import { useStore } from "../../../context/StoreContext";

export function PublishToggle({ beatId, isPublished }: { beatId: string; isPublished: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useStore();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const result = await toggleBeatPublish(beatId, !isPublished);
      if (result.success) {
        showToast(
          `Beat ${!isPublished ? "published" : "unpublished"} successfully`,
          "success"
        );
        // Trigger a page reload to update the list
        window.location.reload();
      } else {
        showToast(result.error || "Failed to update beat", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="btn-icon"
      title={isPublished ? "Unpublish" : "Publish"}
    >
      {isLoading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : isPublished ? (
        <Eye className="w-4 h-4" />
      ) : (
        <EyeOff className="w-4 h-4" />
      )}
    </button>
  );
}
