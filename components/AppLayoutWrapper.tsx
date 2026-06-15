"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "./Navbar";
import Player from "./Player";
import CartDrawer from "./CartDrawer";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith("/admin");

  if (isAdminPath) {
    return (
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6">
        {children}
      </main>
      
      {/* Storefront Global Footer */}
      <footer className="w-full border-t border-border-subtle bg-bg-surface pt-10 pb-[120px] mt-12 transition-colors duration-150">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <span className="font-syne font-bold text-[14px] tracking-[0.12em] text-text-primary">BLINGSBEATS</span>
            <p className="text-[11px] text-text-secondary">Premium Trap and UK Drill instrumental licensing store.</p>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-text-secondary font-syne flex-wrap justify-center">
            <Link href="/" className="hover:text-text-primary transition-colors">Beats</Link>
            <Link href="/licensing" className="hover:text-text-primary transition-colors">Licensing</Link>
            <Link href="/contact" className="hover:text-text-primary transition-colors">Contact</Link>
            <Link href="/resend-link" className="hover:text-text-primary transition-colors">Recover Links</Link>
          </div>
          <div className="text-[11px] text-text-muted">
            &copy; {new Date().getFullYear()} BlingsBeats. All rights reserved.
          </div>
        </div>
      </footer>

      <Player />
      <CartDrawer />
    </>
  );
}
