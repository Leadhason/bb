"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Info, ShieldCheck, Music, Ban, HelpCircle } from "lucide-react";

export default function LicensingInfo() {
  const tiers = [
    {
      name: "Non-Exclusive Loop",
      price: "$29.99 - $39.99",
      bestFor: "Perfect for independent artists, mixtapes, Spotify singles, and YouTube visualisers.",
      features: [
        "High-Quality stereo WAV + MP3 preview masters",
        "Up to 50,000 streams on digital streaming platforms",
        "Up to 100,000 video monetised views",
        "Beat remains in catalogue for other buyers",
        "100% royalty-free profit splits on small distributions",
      ],
      negatives: [
        "Producer maintains copyright ownership",
        "Subject to streaming/reproduction caps",
        "Other artists can release tracks on the same instrumental",
      ],
      popular: false,
    },
    {
      name: "Exclusive Rights",
      price: "$149.99 - $299.99",
      bestFor: "Best for professional labels, album releases, major commercial syncs, and sole ownership.",
      features: [
        "Uncompressed 24-bit WAV stems + MIDI arrangements",
        "Unlimited streaming and commercial reproduction",
        "Unlimited monetised video view distributions",
        "Beat removed from storefront immediately upon checkout",
        "Sole contract assignment and legal transfer deed",
      ],
      negatives: [],
      popular: true,
    },
  ];

  return (
    <div className="w-full max-w-[900px] mx-auto pt-6 pb-16 animate-fadeIn">
      {/* Back link */}
      <Link 
        href="/" 
        className="btn-ghost inline-flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-primary mb-8 pl-0"
      >
        <ArrowLeft className="w-4.5 h-4.5" />
        Back to Storefront
      </Link>

      {/* Header */}
      <div className="border-b border-border-subtle pb-6 mb-10">
        <h1 className="font-syne font-bold text-[32px] text-text-primary uppercase tracking-wider">
          Licensing Tiers
        </h1>
        <p className="font-syne text-[14px] text-text-secondary mt-1">
          Simple, plain-English contracts. No hidden royalties, no surprise fee audits.
        </p>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {tiers.map((tier) => (
          <div 
            key={tier.name}
            className={`bg-bg-surface border rounded-xl p-6 md:p-8 flex flex-col justify-between transition-all relative ${
              tier.popular 
                ? "border-2 border-text-primary shadow-md" 
                : "border-border-default hover:border-border-strong shadow-sm"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-6 bg-text-primary text-bg-base font-syne font-bold text-[9px] px-3 py-1 rounded-[var(--radius-full)] tracking-widest uppercase">
                Sole Ownership
              </span>
            )}

            <div>
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="font-syne font-bold text-[20px] text-text-primary uppercase tracking-wide">
                  {tier.name}
                </h2>
              </div>

              <div className="font-mono text-[22px] font-bold text-text-primary mb-4">
                {tier.price}
              </div>

              <p className="text-[12px] text-text-secondary mb-6 leading-relaxed">
                {tier.bestFor}
              </p>

              <hr className="border-border-subtle mb-6" />

              {/* Positive features */}
              <div className="flex flex-col gap-3 mb-6">
                <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block mb-1">What you receive:</span>
                {tier.features.map((feat) => (
                  <div key={feat} className="flex gap-2.5 items-start">
                    <Check className="w-4 h-4 text-success-text flex-shrink-0 mt-0.5" />
                    <span className="text-[12px] text-text-secondary leading-normal">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Limitation features */}
              {tier.negatives.length > 0 && (
                <div className="flex flex-col gap-3 mt-4">
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-wider block mb-1">Key limits:</span>
                  {tier.negatives.map((neg) => (
                    <div key={neg} className="flex gap-2.5 items-start">
                      <Ban className="w-3.5 h-3.5 text-danger-text flex-shrink-0 mt-0.5" />
                      <span className="text-[12px] text-text-secondary/75 leading-normal">{neg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border-subtle">
              <Link 
                href="/" 
                className={`w-full py-2.5 text-[12px] uppercase font-syne font-medium tracking-wider text-center block rounded-md transition-all ${
                  tier.popular ? "btn-primary" : "btn-secondary"
                }`}
              >
                Browse instrumental catalog
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Banner */}
      <div className="bg-bg-elevated border border-border-default rounded-xl p-6">
        <h3 className="font-syne font-semibold text-[15px] text-text-primary uppercase tracking-wide flex items-center gap-2 mb-3">
          <HelpCircle className="w-4.5 h-4.5 text-text-secondary" />
          Frequently asked contract questions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h4 className="font-syne font-semibold text-[13px] text-text-primary mb-1">
              Can I upgrade to an Exclusive license later?
            </h4>
            <p className="text-[12px] text-text-secondary leading-relaxed">
              Yes, absolutely! If you previously purchased a Non-Exclusive license and the exclusive contract has not yet been sold, you can upgrade by paying the price difference. Contact support with your ORD code.
            </p>
          </div>
          <div>
            <h4 className="font-syne font-semibold text-[13px] text-text-primary mb-1">
              Do my licenses expire?
            </h4>
            <p className="text-[12px] text-text-secondary leading-relaxed">
              No. Once purchased, both non-exclusive distribution capabilities and exclusive copyrights are granted permanently. However, non-exclusive licenses expire once their stream reproduction caps (50k streams) are reached.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
