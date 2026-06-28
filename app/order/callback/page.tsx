"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useStore } from "../../../context/StoreContext";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const { clearCart } = useStore();
  
  const [status, setStatus] = useState<"verifying" | "success" | "timeout" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setErrorMsg("No payment reference detected in the URL. Please verify your receipt or contact support.");
      return;
    }

    let pollCount = 0;
    const maxPolls = 15; // Poll for max 22.5 seconds (15 * 1.5s)
    let timeoutId: NodeJS.Timeout;

    const checkOrder = async () => {
      try {
        const response = await fetch(`/api/orders/verify?reference=${reference}`);
        const data = await response.json();

        if (response.ok && data.success && data.orderRef) {
          setStatus("success");
          setRedirectUrl(`/order/${data.orderRef}`);
          clearCart();
          
          // Redirect after 1.5 seconds so user sees the success state
          setTimeout(() => {
            router.push(`/order/${data.orderRef}`);
          }, 1500);
        } else {
          pollCount++;
          if (pollCount >= maxPolls) {
            setStatus("timeout");
          } else {
            // Poll again
            timeoutId = setTimeout(checkOrder, 1500);
          }
        }
      } catch (err) {
        console.error("Order validation polling error:", err);
        pollCount++;
        if (pollCount >= maxPolls) {
          setStatus("error");
          setErrorMsg("Failed to connect to the verification server. Please try refreshing.");
        } else {
          timeoutId = setTimeout(checkOrder, 1500);
        }
      }
    };

    checkOrder();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [reference, router]);

  return (
    <div className="w-full max-w-[440px] mx-auto pt-20 pb-24 px-4 animate-fadeIn text-center">
      <div className="bg-bg-surface border border-border-default rounded-xl p-6 md:p-8 shadow-sm flex flex-col items-center">
        
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="w-10 h-10 text-text-primary animate-spin" />
            <div>
              <h2 className="font-syne font-semibold text-[16px] text-text-primary uppercase tracking-wider">
                Verifying Transaction
              </h2>
              <p className="text-[12px] text-text-muted mt-2 max-w-[300px] leading-relaxed">
                Confirming Paystack secure gateway handshake and preparing your download assets. Please do not close or reload this window.
              </p>
            </div>
            <span className="font-mono text-[10px] text-text-disabled mt-2">
              Ref: {reference}
            </span>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-6 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-success-bg border border-success-text/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-text" />
            </div>
            <div>
              <h2 className="font-syne font-bold text-[18px] text-text-primary uppercase tracking-wide">
                Payment Confirmed
              </h2>
              <p className="text-[12px] text-text-secondary mt-1.5 leading-relaxed">
                Redirecting you to your private download page...
              </p>
            </div>
          </div>
        )}

        {status === "timeout" && (
          <div className="flex flex-col items-center gap-4 py-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-warning-bg border border-warning-text/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-warning-text" />
            </div>
            <div>
              <h2 className="font-syne font-semibold text-[16px] text-text-primary uppercase tracking-wider">
                Handshake Delay
              </h2>
              <p className="text-[12px] text-text-secondary mt-2 max-w-[300px] leading-relaxed">
                Your payment was received, but the database registration is taking slightly longer than expected. 
                Don't worry — your WAV download link has been dispatched to your email!
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-4">
              <Link href="/" className="btn-primary h-10 w-full flex items-center justify-center text-[11px] uppercase font-syne font-medium">
                Return to storefront
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-secondary h-10 w-full text-[11px] uppercase font-syne"
              >
                Retry verification
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-danger-bg border border-danger-text/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-danger-text" />
            </div>
            <div>
              <h2 className="font-syne font-semibold text-[16px] text-text-primary uppercase tracking-wider">
                Verification Failed
              </h2>
              <p className="text-[12px] text-text-secondary mt-2 leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <Link href="/" className="btn-primary h-10 w-full flex items-center justify-center text-[11px] uppercase font-syne font-medium mt-4">
              Back to storefront
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[440px] mx-auto pt-20 pb-24 px-4 text-center">
        <Loader2 className="w-8 h-8 text-text-muted animate-spin mx-auto" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
