import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import { StoreProvider } from "../context/StoreContext";
import AppLayoutWrapper from "../components/AppLayoutWrapper";
import ToastManager from "../components/ToastManager";

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
        className="h-full antialiased"
        suppressHydrationWarning
      >
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
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
            <AppLayoutWrapper>
              {children}
            </AppLayoutWrapper>
            <ToastManager />
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
