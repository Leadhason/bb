import React from "react";
import prisma from "../lib/prisma";
import BeatCatalogue from "../components/BeatCatalogue";
import BeatDetailModal from "../components/BeatDetailModal";
import CheckoutModal from "../components/CheckoutModal";
import { Music, AlertCircle, ShoppingBag, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

export default async function Home() {

  const beats = await prisma.beat.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 12, // Only fetch first batch for initial load
  });

  // Data needs to be serialized for Client Components
  const serializedBeats = beats.map((b: typeof beats[0]) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    nonExclusivePrice: Number(b.nonExclusivePrice),
    exclusivePrice: Number(b.exclusivePrice),
    coverColor: "from-neutral-800 to-neutral-900" // We can generate or store this dynamically later
  }));

  return (
    <div className="flex flex-col gap-12 w-full pb-10">
      
      {/* 1. Main Beat Catalogue Catalog Area */}
      <section className="w-full">
        <BeatCatalogue beats={serializedBeats} />
      </section>

      {/* 2. Educational Pitch & Trust Banners */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border-default pt-12 select-none">
        
        {/* Pitch 1 */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 hover:border-border-default transition-colors">
          <div className="w-9 h-9 rounded-md bg-bg-elevated flex items-center justify-center mb-3">
            <Music className="w-4 h-4 text-text-secondary" />
          </div>
          <h3 className="font-syne font-semibold text-[14px] text-text-primary uppercase tracking-wider mb-2">
            Royalty-Free Previews
          </h3>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            All loop previews are watermarked to protect original production. Download free previews to record test vocals.
          </p>
        </div>

        {/* Pitch 2 */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 hover:border-border-default transition-colors">
          <div className="w-9 h-9 rounded-md bg-bg-elevated flex items-center justify-center mb-3">
            <ShieldCheck className="w-4 h-4 text-text-secondary" />
          </div>
          <h3 className="font-syne font-semibold text-[14px] text-text-primary uppercase tracking-wider mb-2">
            Secure Delivery
          </h3>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Instant high-quality WAV files, MP3 stems, and exclusive copyright contracts delivered to your inbox post-payment.
          </p>
        </div>

        {/* Pitch 3 */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 hover:border-border-default transition-colors">
          <div className="w-9 h-9 rounded-md bg-bg-elevated flex items-center justify-center mb-3">
            <ShoppingBag className="w-4 h-4 text-text-secondary" />
          </div>
          <h3 className="font-syne font-semibold text-[14px] text-text-primary uppercase tracking-wider mb-2">
            Flexible Licensing
          </h3>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Choose between standard Non-Exclusive streams, or buy sole Exclusive rights to take the beat off the market.
          </p>
        </div>

      </section>

      {/* 3. Footer Help Area / Lost Links recovery */}
      <section id="contact" className="bg-bg-surface border border-border-default rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 mt-6">
        <div>
          <h3 className="font-syne font-bold text-[18px] text-text-primary uppercase tracking-wider">
            Lost your download link?
          </h3>
          <p className="text-[12px] text-text-secondary mt-1.5 max-w-[480px] leading-relaxed">
            Did your email link expire or get buried in spam? We offer automatic retrieval options. Enter your email and reference to recover them.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link 
            href="/resend-link" 
            className="btn-secondary h-10 px-5 text-[12px] uppercase font-syne font-medium flex items-center justify-center gap-1.5 flex-1 md:flex-none"
          >
            <Mail className="w-4 h-4" />
            Recover Link
          </Link>
          <Link 
            href="/licensing" 
            className="btn-primary h-10 px-5 text-[12px] uppercase font-syne font-medium flex items-center justify-center gap-1.5 flex-1 md:flex-none"
          >
            <AlertCircle className="w-4 h-4 text-accent-fg" />
            View Pricing Tiers
          </Link>
        </div>
      </section>

      {/* 4. Active Overlays State Gate */}
      <BeatDetailModal />
      <CheckoutModal />

    </div>
  );
}
