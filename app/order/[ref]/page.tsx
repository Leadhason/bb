import React from "react";
import prisma from "@/lib/prisma";
import { Check, Download, AlertTriangle, Clock, ArrowRight, Disc } from "lucide-react";
import Link from "next/link";
import DownloadButtonClient from "./DownloadButtonClient";

interface PageProps {
  params: Promise<{ ref: string }>;
}

export default async function OrderPage(props: PageProps) {
  const params = await props.params;
  const { ref } = params;

  // 1. Fetch order details
  const order = await prisma.order.findUnique({
    where: { reference: ref },
    include: {
      beat: true,
      customer: true,
    },
  });

  if (!order) {
    return (
      <div className="w-full max-w-[480px] mx-auto py-24 px-4 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-danger-bg border border-danger-text/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6 text-danger-text" />
        </div>
        <h1 className="font-syne font-bold text-[24px] text-text-primary uppercase tracking-wide">
          Order Not Found
        </h1>
        <p className="text-[13px] text-text-secondary mt-2 mb-8 leading-relaxed">
          The order reference <span className="font-mono text-text-primary">{ref}</span> does not match any transaction in our system. If you believe this is an error, please check your receipt or contact support.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2 text-[12px] uppercase font-syne font-medium px-6 py-2.5">
          Back to storefront
        </Link>
      </div>
    );
  }

  // 2. Calculate limits and status
  const totalAttempts = 3;
  const remainingAttempts = Math.max(0, totalAttempts - order.downloadAttempts);
  const expiresAt = new Date(order.linkExpiresAt);
  const isExpired = expiresAt < new Date();
  const isLimitReached = order.downloadAttempts >= totalAttempts;
  const canDownload = !isExpired && !isLimitReached;

  // Formatting variables
  const formattedPrice = Number(order.amountUsd) > 0 
    ? `$${Number(order.amountUsd).toFixed(2)} USD`
    : "Free Giveaway";
  
  const licenseText = order.licenseType === "EXCLUSIVE" ? "Exclusive License" : "Non-Exclusive License";
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate human readable time remaining
  let timeRemainingText = "";
  if (!isExpired) {
    const diffMs = expiresAt.getTime() - Date.now();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours >= 1) {
      timeRemainingText = `Expires in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      timeRemainingText = `Expires in ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
    }
  } else {
    timeRemainingText = "Link expired";
  }

  return (
    <div className="w-full max-w-[500px] mx-auto pt-12 pb-24 px-4 animate-fadeIn">
      <div className="bg-bg-surface border border-border-default rounded-xl p-6 md:p-8 shadow-sm text-center flex flex-col items-center">
        
        {/* Success Checkmark Banner */}
        <div className="w-12 h-12 rounded-full bg-success-bg border border-success-text/30 flex items-center justify-center mb-4">
          <Check className="w-6 h-6 text-success-text stroke-[3px]" />
        </div>

        <h1 className="font-syne font-bold text-[22px] text-text-primary tracking-wide">
          You're all set.
        </h1>
        <p className="text-[13px] text-text-secondary mt-1.5 max-w-[320px] leading-relaxed">
          Your payment was processed successfully. You can download your WAV master files below. We've also emailed copies to <span className="text-text-primary font-medium">{order.customer.email}</span>.
        </p>

        <hr className="w-full border-border-subtle my-6" />

        {/* Beat Details Card */}
        <div className="bg-bg-elevated border border-border-default rounded-lg p-4 w-full flex items-center gap-4 text-left mb-6">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex-shrink-0 flex items-center justify-center border border-border-subtle">
            <Disc className="w-6 h-6 text-text-secondary/60" />
          </div>
          <div className="min-w-0">
            <h3 className="font-syne font-semibold text-[15px] text-text-primary truncate">
              {order.beat.title}
            </h3>
            <p className="text-[11px] text-text-secondary uppercase tracking-wider font-mono mt-0.5">
              {licenseText} · {order.beat.bpm} BPM · {order.beat.key}
            </p>
          </div>
        </div>

        {/* Download Action Section */}
        <div className="w-full mb-6 flex flex-col items-center">
          <DownloadButtonClient 
            orderRef={order.reference} 
            isEnabled={canDownload} 
          />

          <div className="flex justify-between w-full max-w-[360px] mt-3 font-mono text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {isExpired ? "Expired" : timeRemainingText}
            </span>
            <span>
              {remainingAttempts} of {totalAttempts} downloads remaining
            </span>
          </div>

          {!canDownload && (
            <div className="mt-4 p-3 bg-danger-bg/25 border border-danger-text/25 rounded-md text-left w-full text-[12px] text-danger-text leading-relaxed">
              {isExpired ? (
                <span>⚠️ This download link has expired (48-hour limit reached). You can recover it by requesting a new link on the <Link href="/resend-link" className="underline hover:text-text-primary font-medium">Link Recovery Page</Link>.</span>
              ) : (
                <span>⚠️ You have reached the download attempt limit (maximum 3 times) for this order. Please contact support if you require assistance.</span>
              )}
            </div>
          )}
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-bg-elevated/50 border border-border-subtle rounded-lg px-4 py-3.5 w-full text-left text-[12px] flex flex-col gap-2.5">
          <div className="flex justify-between">
            <span className="text-text-secondary uppercase tracking-wider text-[10px] font-syne">Order Reference</span>
            <span className="font-mono text-text-primary font-semibold">{order.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary uppercase tracking-wider text-[10px] font-syne">Price Paid</span>
            <span className="font-mono text-text-primary font-semibold">{formattedPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary uppercase tracking-wider text-[10px] font-syne">Date</span>
            <span className="text-text-primary">{formattedDate}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2.5 w-full mt-8">
          <Link href="/" className="btn-secondary h-10 w-full flex items-center justify-center gap-1.5 text-[11px] uppercase font-syne font-medium">
            Continue Browsing Storefront
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
