"use client";

import React, { useEffect, useState } from "react";
import { useStore, LicenseType, Beat } from "../context/StoreContext";
import { X, Trash2, ShoppingBag, Disc, ArrowRight, Music, Tag, Check, Loader2 } from "lucide-react";

export default function CartDrawer() {
  const {
    cartItems,
    removeFromCart,
    updateCartItemLicense,
    isCartOpen,
    setIsCartOpen,
    openCheckout,
    isProducer,
    calculateCartTotals,
    checkout,
    applyDiscount,
    removeDiscount,
  } = useStore();

  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Prevent background scrolling when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  // Real promotion totals calculation
  const {
    subtotal,
    itemCount,
    bulkPercent,
    bulkDiscountAmount,
    activeBulkRule,
    nextBulkRule,
    beatsNeeded,
    promoDiscountAmount,
    stackConflict,
    total,
  } = calculateCartTotals();

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    await applyDiscount(promoInput);
    setIsApplyingPromo(false);
    setPromoInput("");
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    openCheckout(null, "non-exclusive", true);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="drawer-overlay"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="drawer-panel flex flex-col h-full">
        {/* Drawer Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-border-subtle">
          <span className="font-syne font-bold text-[16px] text-text-primary uppercase tracking-wider flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-text-secondary" />
            Your Cart ({itemCount})
          </span>
          <button
            onClick={() => setIsCartOpen(false)}
            className="btn-icon w-8 h-8 rounded-md border border-border-strong hover:border-border-focus"
            aria-label="Close cart"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Drawer Body / Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {itemCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 select-none">
              <div className="w-14 h-14 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center mb-4">
                <Disc className="w-6 h-6 text-text-muted" />
              </div>
              <h3 className="font-syne font-semibold text-[15px] text-text-primary uppercase tracking-wider">
                Your cart is empty
              </h3>
              <p className="text-[12px] text-text-secondary mt-1.5 max-w-[240px] leading-relaxed">
                Browse our catalogue and license premium Drill & Trap beats.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-secondary h-9 px-5 text-[11px] uppercase font-syne font-medium mt-6"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => {
              const itemPrice =
                item.licenseType === "non-exclusive"
                  ? item.beat.nonExclusivePrice
                  : item.beat.exclusivePrice;

              return (
                <div
                  key={`${item.beat.id}-${item.licenseType}-${index}`}
                  className="flex gap-4 p-3 bg-bg-elevated border border-border-default rounded-lg hover:border-border-strong transition-colors"
                >
                  {/* Beat Cover Art Thumbnail */}
                  <div
                    className={`w-12 h-12 rounded-md bg-gradient-to-br ${
                      item.beat.coverColor || "from-neutral-800 to-neutral-900"
                    } border border-border-default flex-shrink-0 flex items-center justify-center`}
                  >
                    <Music className="w-5 h-5 text-text-secondary/65" />
                  </div>

                  {/* Beat Info & Selection */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-syne font-semibold text-[13px] text-text-primary truncate">
                        {item.beat.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.beat.id, item.licenseType)}
                        className="text-text-muted hover:text-danger-text p-0.5 rounded transition-colors"
                        title="Remove beat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="font-mono text-[9px] text-text-muted uppercase tracking-wider mt-0.5">
                      {item.beat.genre} · {item.beat.bpm} BPM
                    </p>

                    {/* License selector and price row */}
                    <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-border-subtle/50">
                      <select
                        value={item.licenseType}
                        onChange={(e) =>
                          updateCartItemLicense(
                            item.beat.id,
                            item.licenseType,
                            e.target.value as LicenseType
                          )
                        }
                        className="bg-bg-surface border border-border-subtle text-[11px] font-syne text-text-secondary rounded px-2 py-0.5 cursor-pointer outline-none focus:border-border-focus"
                      >
                        {item.beat.nonExclusiveEnabled && (
                          <option value="non-exclusive">Non-Exclusive</option>
                        )}
                        {item.beat.exclusiveEnabled && !item.beat.exclusiveSold && (
                          <option value="exclusive">Exclusive</option>
                        )}
                      </select>

                      <span className="font-mono text-[12px] font-bold text-text-primary">
                        ${itemPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {itemCount > 0 && (
          <div className="border-t border-border-default bg-bg-surface px-6 py-5 flex flex-col gap-4">
            {/* Promo / Bulk Discount Dynamic Banner */}
            {(activeBulkRule || nextBulkRule) && (
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-3 text-[11px] leading-normal text-text-secondary">
                {activeBulkRule ? (
                  nextBulkRule ? (
                    <div className="flex justify-between items-center text-success-text font-medium">
                      <span>Bulk Discount Applied: {bulkPercent}% OFF</span>
                      <span className="text-accent">
                        Add {beatsNeeded} more to get {nextBulkRule.discountPercent}% OFF!
                      </span>
                    </div>
                  ) : (
                    <div className="text-success-text font-medium">
                      Bulk Discount Applied: {bulkPercent}% OFF! (Maximum Tier)
                    </div>
                  )
                ) : nextBulkRule ? (
                  <div className="flex justify-between items-center">
                    <span>
                      Buy {nextBulkRule.minQuantity}+ beats: <strong>{nextBulkRule.discountPercent}% OFF</strong>
                    </span>
                    <span className="text-accent font-medium">
                      Add {beatsNeeded} more {beatsNeeded === 1 ? "beat" : "beats"}
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Promo Code Input or Applied Badge */}
            <div className="pt-1 border-t border-border-subtle/50">
              {checkout.discountApplied ? (
                <div className="flex items-center justify-between bg-bg-elevated border border-accent/40 rounded-lg px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-text-primary">
                    <Tag className="w-3.5 h-3.5 text-accent" />
                    <span className="font-mono font-bold tracking-wider">{checkout.discountCode}</span>
                    <span className="text-success-text font-medium">
                      ({checkout.discountPercentage}% OFF)
                    </span>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="text-text-muted hover:text-danger-text p-1 transition-colors cursor-pointer"
                    title="Remove coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full bg-bg-elevated border border-border-strong rounded-md h-8 pl-8 pr-2 font-mono text-xs uppercase placeholder:normal-case placeholder-text-muted focus:border-accent focus:outline-none text-text-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingPromo || !promoInput.trim()}
                    className="btn-secondary h-8 px-3 text-xs font-syne uppercase font-medium disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    {isApplyingPromo ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                  </button>
                </form>
              )}
            </div>

            {/* Calculations */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[12px] text-text-secondary">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>

              {bulkDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-[12px] text-success-text font-medium">
                  <span>Bulk Discount (-{bulkPercent}%)</span>
                  <span className="font-mono">-${bulkDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              {promoDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-[12px] text-success-text font-medium">
                  <span>Promo Code ({checkout.discountCode})</span>
                  <span className="font-mono">-${promoDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              {stackConflict === "bulk_won" && (
                <p className="text-[10px] text-text-muted italic text-right">
                  Bulk discount savings exceed promo code (non-stackable)
                </p>
              )}

              {stackConflict === "code_won" && (
                <p className="text-[10px] text-text-muted italic text-right">
                  Promo code savings exceed bulk discount (non-stackable)
                </p>
              )}

              <div className="flex justify-between items-center text-[14px] text-text-primary font-bold pt-2 border-t border-dashed border-border-subtle">
                <span>Total</span>
                <span className="font-mono text-[16px] text-text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            {isProducer ? (
              <button
                disabled
                className="btn-secondary h-11 w-full flex items-center justify-center gap-2 text-[12px] uppercase font-syne font-medium cursor-not-allowed opacity-60"
                title="Producers cannot purchase beats"
              >
                PRODUCER ACCOUNT
              </button>
            ) : (
              <button
                onClick={handleCheckoutClick}
                className="btn-primary h-11 w-full flex items-center justify-center gap-2 text-[12px] uppercase font-syne font-medium shadow-sm"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
