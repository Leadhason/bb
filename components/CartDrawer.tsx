"use client";

import React, { useEffect } from "react";
import { useStore, LicenseType, Beat } from "../context/StoreContext";
import { X, Trash2, ShoppingBag, Disc, ArrowRight, Music } from "lucide-react";

export default function CartDrawer() {
  const {
    cartItems,
    removeFromCart,
    updateCartItemLicense,
    isCartOpen,
    setIsCartOpen,
    openCheckout,
    isProducer,
  } = useStore();

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

  // Calculate pricing
  const subtotal = cartItems.reduce((sum, item) => {
    const price =
      item.licenseType === "non-exclusive"
        ? item.beat.nonExclusivePrice
        : item.beat.exclusivePrice;
    return sum + price;
  }, 0);

  // Bulk discount calculation
  const itemCount = cartItems.length;
  let bulkDiscountPercentage = 0;
  if (itemCount === 2) {
    bulkDiscountPercentage = 10;
  } else if (itemCount >= 3) {
    bulkDiscountPercentage = 20;
  }

  const bulkDiscountAmount = (subtotal * bulkDiscountPercentage) / 100;
  const total = subtotal - bulkDiscountAmount;

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
            {/* Promo / Bulk Discount Banner */}
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-3 text-[11px] leading-normal text-text-secondary">
              {itemCount === 1 ? (
                <div className="flex justify-between items-center">
                  <span>Buy 2 beats: <strong>10% off</strong></span>
                  <span className="text-text-muted">Add 1 more beat</span>
                </div>
              ) : itemCount === 2 ? (
                <div className="flex justify-between items-center text-success-text font-medium">
                  <span>Bulk Discount Applied: 10% OFF</span>
                  <span>Add 1 more to get 20%!</span>
                </div>
              ) : (
                <div className="text-success-text font-medium">
                  Bulk Discount Applied: 20% OFF! (Maximum Tier)
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[12px] text-text-secondary">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>

              {bulkDiscountPercentage > 0 && (
                <div className="flex justify-between items-center text-[12px] text-success-text font-medium">
                  <span>Bulk Discount (-{bulkDiscountPercentage}%)</span>
                  <span className="font-mono">-${bulkDiscountAmount.toFixed(2)}</span>
                </div>
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
