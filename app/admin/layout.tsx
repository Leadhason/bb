"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, LayoutDashboard, ShoppingCart, Tag, Settings, Menu, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Beats", href: "/admin/beats", icon: Music },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Promotions", href: "/admin/promotions", icon: Tag },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-base flex flex-col lg:flex-row">
      
      {/* Mobile top bar + hamburger navigation container */}
      <div className="sticky top-0 w-full lg:hidden flex flex-col z-40 bg-bg-base">
        {/* Mobile warning banner */}
        <div className="bg-warning-bg text-warning-text px-4 py-2 text-[11px] font-syne text-center border-b border-border-subtle">
          ⚠️ For the best admin experience, use a desktop browser.
        </div>

        {/* Mobile Top Header */}
        <div className="bg-bg-surface border-b border-border-default px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-syne font-bold text-sm text-text-primary tracking-widest uppercase">
            ADMIN
          </Link>
          
          <div className="flex items-center gap-3">
            <UserButton />
            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              className="btn-icon cursor-pointer"
              aria-label="Toggle admin navigation"
            >
              {adminMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {adminMenuOpen && (
          <div className="absolute top-full left-0 w-full h-[calc(100vh-100%)] bg-bg-surface flex flex-col items-center justify-center gap-8 shadow-xl animate-fadeIn z-40 overflow-y-auto px-6 py-10">
            <nav className="flex flex-col items-center gap-6">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setAdminMenuOpen(false)}
                    className={`flex items-center gap-3 font-syne text-[20px] font-semibold tracking-wider transition-colors ${
                      isActive 
                        ? "text-text-primary" 
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-text-secondary" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            
            <hr className="w-24 border-border-subtle" />
            
            <div className="w-full max-w-[280px]">
              <Link 
                href="/" 
                onClick={() => setAdminMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-bg-elevated hover:bg-bg-hover text-text-primary font-syne text-sm font-semibold rounded-md border border-border-strong transition-colors"
              >
                View Storefront
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar (Desktop only) */}
      <aside className="hidden lg:flex w-64 bg-bg-surface border-r border-border-default flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border-default">
          <Link href="/admin" className="font-syne font-bold text-lg text-text-primary tracking-widest uppercase">
            ADMIN
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-syne font-medium rounded-md transition-colors ${
                  isActive 
                    ? "bg-bg-elevated text-text-primary" 
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-default flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="font-syne text-sm font-medium text-text-secondary">Producer</span>
          </div>
          <div className="mt-2">
            <Link href="/" className="flex items-center justify-center gap-2 w-full py-2 bg-bg-elevated hover:bg-bg-hover text-text-primary font-syne text-xs rounded-md border border-border-strong transition-colors">
              View Storefront
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}