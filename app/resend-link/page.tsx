"use client";

import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ResendLink() {
  const { showToast } = useStore();
  const [email, setEmail] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const cleanRef = orderRef.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    setTimeout(() => {
      setLoading(false);
      
      // Simulation test rules:
      // Valid order formats must match "ORD-" followed by numbers
      const isValidRef = /^ORD-\d{6}$/.test(cleanRef);

      if (!isValidRef) {
        setErrorMsg("Order reference not found. Correct format is ORD-XXXXXX");
        showToast("Invalid order reference provided.", "error");
      } else {
        setSuccess(true);
        showToast("New download links dispatched successfully!", "success");
      }
    }, 2000);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto pt-16 pb-24 animate-fadeIn">
      {/* Back button */}
      <Link 
        href="/" 
        className="btn-ghost inline-flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-primary mb-6 pl-0"
      >
        <ArrowLeft className="w-4.5 h-4.5" />
        Back to Storefront
      </Link>

      <div className="bg-bg-surface border border-border-default rounded-xl p-6 md:p-8 shadow-sm">
        
        {success ? (
          <div className="text-center py-4 flex flex-col items-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-success-bg border border-success-text/35 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-success-text" />
            </div>
            
            <h2 className="font-syne font-bold text-[20px] text-text-primary mb-2">
              Dispatch Sent
            </h2>
            <p className="text-[12px] text-text-secondary leading-relaxed mb-6">
              We've processed your recovery request. If a matching order exists for <span className="text-text-primary font-medium">{email}</span>, a fresh signed download link has been dispatched to your inbox.
            </p>

            <button
              onClick={() => {
                setSuccess(false);
                setEmail("");
                setOrderRef("");
              }}
              className="btn-primary w-full h-10 text-[11px] uppercase font-syne font-medium"
            >
              Request Another Recovery
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-md bg-bg-elevated border border-border-default flex items-center justify-center mb-3">
                <Mail className="w-4.5 h-4.5 text-text-secondary" />
              </div>
              <h2 className="font-syne font-bold text-[20px] text-text-primary uppercase tracking-wide">
                Lost download?
              </h2>
              <p className="text-[12px] text-text-secondary mt-1.5 leading-relaxed max-w-[280px]">
                Enter the email address and unique order reference reference from your transaction receipt.
              </p>
            </div>

            <hr className="border-border-subtle" />

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input h-10"
              />
            </div>

            <div>
              <label className="label">Order Reference</label>
              <input
                type="text"
                required
                placeholder="e.g. ORD-849204"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                className={`input h-10 font-mono ${
                  errorMsg ? "border-danger-text focus:border-danger-text" : ""
                }`}
              />
              {errorMsg && (
                <p className="text-[11px] text-danger-text mt-1.5 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-11 w-full flex items-center justify-center gap-2 text-[12px] uppercase font-syne font-medium mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Retrieving details...
                </>
              ) : (
                "Send me new link"
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
