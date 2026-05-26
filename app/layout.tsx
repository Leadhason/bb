import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import { StoreProvider } from "../context/StoreContext";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import ToastManager from "../components/ToastManager";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "BlingsBeats",
  description: "Browse, stream, and purchase licenses for premium Drill and Trap beats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${syne.variable} ${dmMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <Script
            id="theme-script"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var saved = localStorage.getItem('beat-store-theme') || 'dark';
                    document.documentElement.setAttribute('data-theme', saved);
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="min-h-full flex flex-col bg-bg-base text-text-primary">
          <StoreProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 pb-[92px]">
              {children}
            </main>
            <Player />
            <ToastManager />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
