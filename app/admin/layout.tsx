import React from "react";
import Link from "next/link";
import { Music, LayoutDashboard, ShoppingCart, Tag, Settings, LogOut } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Authorization is handled by proxy middleware

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-surface border-r border-border-default flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border-default">
          <Link href="/admin" className="font-syne font-bold text-lg text-text-primary tracking-widest uppercase">
            ADMIN
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-syne font-medium rounded-md bg-bg-elevated text-text-primary">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/admin/beats" className="flex items-center gap-3 px-3 py-2 text-sm font-syne font-medium rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
            <Music className="w-4 h-4" /> Beats
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 text-sm font-syne font-medium rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
            <ShoppingCart className="w-4 h-4" /> Orders
          </Link>
          <Link href="/admin/promotions" className="flex items-center gap-3 px-3 py-2 text-sm font-syne font-medium rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
            <Tag className="w-4 h-4" /> Promotions
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-syne font-medium rounded-md hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-border-default">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="font-syne text-sm font-medium text-text-secondary">Producer</span>
          </div>
          <div className="mt-4">
            <Link href="/" className="flex items-center justify-center gap-2 w-full py-2 bg-bg-elevated hover:bg-bg-hover text-text-primary font-syne text-xs rounded-md border border-border-strong transition-colors">
              View Storefront
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}