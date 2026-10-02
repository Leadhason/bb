"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, LayoutDashboard, ShoppingCart, Tag, Settings, Menu, X, ChevronLeft, ChevronRight, ExternalLink, Sun, Moon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useStore } from "../../context/StoreContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useStore();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

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
            <button
              onClick={toggleTheme}
              className="btn-icon cursor-pointer"
              title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-text-secondary hover:text-text-primary" />
              ) : (
                <Moon className="w-4 h-4 text-text-secondary hover:text-text-primary" />
              )}
            </button>
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

      {/* Sidebar (Desktop only - Collapsible, Unscrollable, h-screen) */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden bg-bg-surface border-r border-border-default transition-all duration-300 z-30 select-none ${
          isCollapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Top Header / Branding & Collapse Toggle */}
        <div
          className={`h-16 flex items-center border-b border-border-default shrink-0 px-4 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <Link
              href="/admin"
              className="font-syne font-bold text-sm text-text-primary tracking-widest uppercase truncate"
            >
              ADMIN
            </Link>
          )}

          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items (Not scrollable) */}
        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                title={isCollapsed ? link.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-syne font-medium rounded-md transition-colors ${
                  isCollapsed ? "justify-center px-0" : ""
                } ${
                  isActive
                    ? "bg-bg-elevated text-text-primary border-r-2 border-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Pinned Section */}
        <div className="p-3 border-t border-border-default shrink-0 flex flex-col gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 py-2 text-xs font-syne font-medium rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer ${
              isCollapsed ? "justify-center px-0" : "px-3 w-full"
            }`}
            title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 shrink-0 text-text-secondary hover:text-text-primary" />
            ) : (
              <Moon className="w-4 h-4 shrink-0 text-text-secondary hover:text-text-primary" />
            )}
            {!isCollapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          <div
            className={`flex items-center gap-3 ${
              isCollapsed ? "justify-center" : "px-3"
            }`}
          >
            <UserButton />
            {!isCollapsed && (
              <span className="font-syne text-xs font-medium text-text-secondary truncate">
                Producer
              </span>
            )}
          </div>

          <div>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title={isCollapsed ? "View Storefront" : undefined}
              className={`flex items-center justify-center gap-2 py-2 bg-bg-elevated hover:bg-bg-hover text-text-primary font-syne text-xs rounded-md border border-border-strong transition-colors ${
                isCollapsed ? "px-0" : "w-full px-2"
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span>View Store</span>}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}