"use client";

import React, { useState } from "react";
import { useStore, CheckoutState } from "../context/StoreContext";
import { useUser } from "@clerk/nextjs";
import { X, Check, CreditCard, User, Tag, ShoppingCart, Loader2, ArrowRight, Disc } from "lucide-react";

export default function CheckoutModal() {
  const {
    checkout,
    closeCheckout,
    setCheckoutStep,
    applyDiscount,
    updateCheckoutDetails,
    completeCheckout,
    showToast
  } = useStore();

  const { isSignedIn, user } = useUser();
  
  const [promoCode, setPromoCode] = useState("");
  const [password, setPassword] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // If checkout closed, return null
  if (!checkout.isOpen || !checkout.beat) return null;

  const beat = checkout.beat;
  const basePrice = checkout.licenseType === "non-exclusive" ? beat.nonExclusivePrice : beat.exclusivePrice;
  
  // Calculate discount and total
  const discountAmount = checkout.discountApplied ? (basePrice * checkout.discountPercentage) / 100 : 0;
  
  // Bulk discounts simulation: automatically apply 10% if purchasing exclusive or buying more than one (or mock it here)
  const isBulkDiscount = checkout.licenseType === "exclusive" && beat.nonExclusiveSold > 5;
  const bulkDiscountAmount = isBulkDiscount ? basePrice * 0.05 : 0; // 5% bulk modifier
  
  const finalPrice = Math.max(0, basePrice - discountAmount - bulkDiscountAmount);

  // Handle promo code submit
  const handlePromoApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyDiscount(promoCode);
  };

  // Step 1 check
  const handleStep1Submit = () => {
    if (isSignedIn && user) {
      // Auto fill and skip to Step 3
      updateCheckoutDetails({
        customerName: user.fullName || "Logged In Customer",
        customerEmail: user.primaryEmailAddress?.emailAddress || "",
        step: 3
      });
    } else {
      setCheckoutStep(2);
    }
  };

  // Step 2 details submit
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkout.customerName || !checkout.customerEmail) {
      showToast("Please enter your name and email.", "error");
      return;
    }
    setCheckoutStep(3);
  };

  // Simulate payment processing step
  const handlePaymentSimulate = () => {
    setPaymentProcessing(true);
    showToast("Opening Paystack secure payment window...", "neutral");

    setTimeout(() => {
      showToast("Paystack payment successful! Confirming your order...", "success");
      
      // Simulate database/webhook confirmation spinner delay
      setTimeout(() => {
        setPaymentProcessing(false);
        completeCheckout();
      }, 2000);
    }, 2500);
  };

  return (
    <div 
      className="modal-overlay"
      onClick={paymentProcessing ? undefined : closeCheckout}
    >
      <div 
        className="modal-panel max-w-[480px] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-border-subtle pb-4 mb-5">
          <span className="font-syne font-medium text-[15px] text-text-primary uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-text-secondary" />
            {checkout.step === 4 ? "Purchase Successful" : `Checkout — Step ${checkout.step} of 3`}
          </span>
          {!paymentProcessing && (
            <button 
              onClick={closeCheckout}
              className="btn-icon w-8 h-8 rounded-md border border-border-strong hover:border-border-focus"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          )}
        </div>

        {/* STEP 1: LICENSE CONFIRMATION */}
        {checkout.step === 1 && (
          <div className="animate-fadeIn">
            {/* Beat Review summary card */}
            <div className="flex gap-4 p-4 bg-bg-elevated border border-border-default rounded-lg mb-5">
              <div 
                className={`w-14 h-14 rounded-md bg-gradient-to-br ${beat.coverColor} border border-border-default flex-shrink-0 flex items-center justify-center`}
              >
                <Disc className="w-6 h-6 text-text-secondary/65" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-syne font-semibold text-[14px] text-text-primary truncate">
                  {beat.title}
                </h3>
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                  {beat.genre} · {beat.bpm} BPM
                </p>
                <span className="inline-block mt-2 font-syne text-[11px] font-medium bg-bg-overlay border border-border-subtle text-text-secondary px-2 py-0.5 rounded-[var(--radius-sm)] capitalize">
                  {checkout.licenseType} License
                </span>
              </div>
            </div>

            {/* Discount Code Form */}
            <form onSubmit={handlePromoApply} className="mb-6">
              <label className="label">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. DRILL20, FREEBEAT"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className={`input flex-1 h-10 ${
                    checkout.discountApplied 
                      ? "border-success-text focus:border-success-text" 
                      : checkout.discountError 
                      ? "border-danger-text focus:border-danger-text" 
                      : ""
                  }`}
                />
                <button 
                  type="submit" 
                  className="btn-secondary h-10 px-4 text-[12px] uppercase font-syne font-medium flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Apply
                </button>
              </div>
              {checkout.discountApplied && (
                <p className="text-[11px] text-success-text mt-1.5 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Promo applied: {checkout.discountPercentage}% OFF (Saved ${discountAmount.toFixed(2)})
                </p>
              )}
              {checkout.discountError && (
                <p className="text-[11px] text-danger-text mt-1.5 font-medium">
                  {checkout.discountError}
                </p>
              )}
            </form>

            {/* Pricing Summary */}
            <div className="border-t border-b border-border-subtle py-4 mb-6 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[13px] text-text-secondary">
                <span>Base Price ({checkout.licenseType})</span>
                <span className="font-mono">${basePrice.toFixed(2)}</span>
              </div>

              {checkout.discountApplied && (
                <div className="flex justify-between items-center text-[13px] text-success-text font-medium">
                  <span>Promo discount ({checkout.discountPercentage}%)</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {isBulkDiscount && (
                <div className="flex justify-between items-center text-[13px] text-success-text font-medium">
                  <span>Bulk Discount Applied (5%)</span>
                  <span className="font-mono">-${bulkDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-[15px] text-text-primary font-bold pt-2 border-t border-dashed border-border-subtle">
                <span>Total Amount</span>
                <span className="font-mono">${finalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Step Button */}
            <button
              onClick={handleStep1Submit}
              className="btn-primary h-11 w-full flex items-center justify-center gap-2 text-[12px] uppercase font-syne font-medium"
            >
              PROCEED TO CLIENT DETAILS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: CUSTOMER DETAILS */}
        {checkout.step === 2 && (
          <form onSubmit={handleStep2Submit} className="animate-fadeIn flex flex-col gap-4">
            <div className="p-4 bg-bg-elevated border border-border-default rounded-lg text-text-secondary text-[12px] leading-relaxed mb-1 flex items-center gap-3">
              <User className="w-5 h-5 text-text-muted flex-shrink-0" />
              <div>
                <span>Purchasing as a guest. All licenses and download links will be safely delivered to your email.</span>
              </div>
            </div>

            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                required
                value={checkout.customerName}
                onChange={(e) => updateCheckoutDetails({ customerName: e.target.value })}
                className="input h-10"
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                required
                value={checkout.customerEmail}
                onChange={(e) => updateCheckoutDetails({ customerEmail: e.target.value })}
                className="input h-10"
              />
            </div>

            {/* Create Account Choice */}
            <div className="mt-2 p-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checkout.createAccount}
                  onChange={(e) => updateCheckoutDetails({ createAccount: e.target.checked })}
                  className="w-4 h-4 accent-text-primary rounded border-border-strong bg-bg-elevated"
                />
                <span className="font-syne text-[12px] text-text-secondary">
                  Create an account using this email
                </span>
              </label>
            </div>

            {checkout.createAccount && (
              <div className="animate-slideUp">
                <label className="label">Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  required={checkout.createAccount}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input h-10"
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setCheckoutStep(1)}
                className="btn-secondary h-11 px-5 text-[12px] uppercase font-syne"
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary h-11 flex-1 flex items-center justify-center gap-2 text-[12px] uppercase font-syne font-medium"
              >
                PROCEED TO PAYMENT
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PAYMENT GATEWAY SIMULATOR */}
        {checkout.step === 3 && (
          <div className="animate-fadeIn text-center py-4 flex flex-col items-center">
            {paymentProcessing ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <Loader2 className="w-10 h-10 text-text-primary animate-spin" />
                <div>
                  <h3 className="font-syne font-semibold text-[15px] text-text-primary">
                    Confirming your payment...
                  </h3>
                  <p className="text-[12px] text-text-muted mt-1 max-w-[280px]">
                    Paystack webhook secure handshake in progress. Please do not close this window.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-success-bg border border-success-text/25 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-success-text" />
                </div>

                <h3 className="font-syne font-bold text-[18px] text-text-primary mb-2">
                  Secure Checkout Mapped
                </h3>
                <p className="text-[12px] text-text-secondary mb-6 max-w-[320px] mx-auto leading-relaxed">
                  We integrate Paystack payment gateways directly. Click below to launch secure payment simulation popup window.
                </p>

                {/* Confirm pricing once more */}
                <div className="bg-bg-elevated border border-border-default rounded-lg px-4 py-3 w-full mb-6 flex justify-between items-center text-[13px]">
                  <span className="text-text-secondary uppercase tracking-wider text-[11px] font-syne">Total to Pay</span>
                  <span className="font-mono font-bold text-text-primary text-[15px]">${finalPrice.toFixed(2)}</span>
                </div>

                <div className="flex gap-3 w-full">
                  {!isSignedIn && (
                    <button
                      onClick={() => setCheckoutStep(2)}
                      className="btn-secondary h-11 px-5 text-[12px] uppercase font-syne"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={handlePaymentSimulate}
                    className="btn-primary h-11 flex-1 flex items-center justify-center gap-2 text-[12px] uppercase font-syne font-medium"
                  >
                    PAY WITH PAYSTACK SIMULATOR
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 4: TRANSACTION SUCCESS */}
        {checkout.step === 4 && (
          <div className="animate-fadeIn text-center py-6 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-success-bg border border-success-text/30 flex items-center justify-center mb-4 animate-[bounce_1s_ease_infinite]">
              <Check className="w-6 h-6 text-success-text stroke-[3px]" />
            </div>

            <h2 className="font-syne font-bold text-[22px] text-text-primary mb-1">
              You're all set.
            </h2>
            <p className="text-[13px] text-text-secondary mb-6 max-w-[300px] leading-relaxed">
              We've successfully processed your payment and sent the high-quality files and contract agreements to{" "}
              <span className="text-text-primary font-medium">{checkout.customerEmail || "your email"}</span>.
            </p>

            {/* Order Reference in DM Mono */}
            <div className="bg-bg-surface border border-border-strong rounded-md px-6 py-3.5 mb-6 w-full text-center">
              <span className="label text-[10px] text-text-muted tracking-widest block mb-1">Order Reference Reference</span>
              <span className="font-mono text-[14px] text-text-primary font-semibold tracking-wider">
                {checkout.orderRef}
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {checkout.createAccount ? (
                <button
                  onClick={() => {
                    closeCheckout();
                    window.location.href = "/dashboard";
                  }}
                  className="btn-primary h-11 text-[12px] uppercase font-syne font-medium"
                >
                  Visit Your Dashboard
                </button>
              ) : (
                <button
                  onClick={closeCheckout}
                  className="btn-primary h-11 text-[12px] uppercase font-syne font-medium"
                >
                  Continue Browsing Storefront
                </button>
              )}
              
              <button
                onClick={closeCheckout}
                className="btn-ghost py-2 text-[12px] text-text-muted hover:text-text-primary"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
