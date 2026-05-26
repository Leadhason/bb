"use client";

import React from "react";
import { useStore } from "../context/StoreContext";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function ToastManager() {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        // Border styles based on type
        let borderStyle = "";
        let icon = <Info className="w-4 h-4 text-text-secondary" />;

        if (toast.type === "success") {
          borderStyle = "border-l-[3px] border-l-success-text";
          icon = <CheckCircle className="w-4 h-4 text-success-text" />;
        } else if (toast.type === "error") {
          borderStyle = "border-l-[3px] border-l-danger-text";
          icon = <AlertTriangle className="w-4 h-4 text-danger-text" />;
        }

        return (
          <div
            key={toast.id}
            className={`toast ${borderStyle} transition-all duration-150 relative pr-10`}
          >
            {icon}
            <span className="font-syne text-[13px] text-text-primary">
              {toast.message}
            </span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded-md transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
