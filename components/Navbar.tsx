"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "../context/StoreContext";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Sun, Moon, Menu, X, Music, Disc } from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme, isProducer } = useStore();
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "Beats", href: "/" },
    { name: "Licensing", href: "/licensing" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-[60px] bg-bg-base border-b border-border-subtle transition-colors duration-150">
      <div className="max-w-[1200px] h-full mx-auto px-6 flex items-center justify-between">
        {/* Store Brand Name */}
        <Link 
          href="/" 
          className="font-syne font-bold text-[16px] tracking-[0.12em] text-text-primary flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <Disc className="w-5 h-5 animate-[spin_6s_linear_infinite]" />
          BLINGSBEATS
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-syne text-[13px] transition-colors py-1 ${
                  isActive
                    ? "text-text-primary border-b border-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-text-secondary hover:text-text-primary" />
            ) : (
              <Moon className="w-4 h-4 text-text-secondary hover:text-text-primary" />
            )}
          </button>

          {/* Authentication states */}
          <div className="hidden sm:flex items-center gap-2">
            {isSignedIn ? (
              <>
                {isProducer ? (
                  <Link
                    href="/admin"
                    className={`btn-secondary text-[12px] py-1.5 px-3 border border-border-strong rounded-md hover:border-border-focus transition-all ${
                      pathname.startsWith("/admin") ? "text-text-primary border-text-primary" : ""
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className={`btn-secondary text-[12px] py-1.5 px-3 border border-border-strong rounded-md hover:border-border-focus transition-all ${
                      pathname === "/dashboard" ? "text-text-primary border-text-primary" : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                <SignOutButton>
                  <button className="btn-ghost text-[12px] py-1.5 px-3 text-text-muted hover:text-text-primary">
                    Log out
                  </button>
                </SignOutButton>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary py-1.5 px-4 text-[12px]">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary py-1.5 px-4 text-[12px]">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon md:hidden flex"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[60px] left-0 w-full bg-bg-surface border-b border-border-default px-6 py-6 flex flex-col gap-6 animate-fadeIn z-40 shadow-xl">
          <nav className="flex flex-col gap-4">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  onClick={() => setMobileMenuOpen(false)}
                  href={link.href}
                  className={`font-syne text-[14px] ${
                    isActive ? "text-text-primary font-medium" : "text-text-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <hr className="border-border-subtle" />

          {/* Mobile Auth options */}
          <div className="flex flex-col sm:hidden gap-3">
            {isSignedIn ? (
              <>
                <div className="text-[12px] text-text-muted px-1">
                  Logged in as <span className="text-text-secondary font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                {isProducer ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary text-center py-2 text-[13px] w-full"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary text-center py-2 text-[13px] w-full"
                  >
                    My Dashboard
                  </Link>
                )}
                <SignOutButton>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-ghost text-center py-2 text-[13px] text-text-secondary w-full border border-border-strong hover:bg-bg-hover"
                  >
                    Log out
                  </button>
                </SignOutButton>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary flex-1 text-center py-2 text-[13px]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary flex-1 text-center py-2 text-[13px]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
