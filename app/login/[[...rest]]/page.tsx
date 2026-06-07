"use client";

import React from "react";
import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-syne font-bold text-3xl text-text-primary tracking-widest uppercase">
            Producer Login
          </h1>                                                                                                                                                                                                            
          <p className="font-syne text-sm text-text-muted mt-2">
            Access your admin dashboard to manage beats and orders
          </p>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-xl p-8">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-bg-elevated border border-border-strong text-text-primary hover:bg-bg-hover",
                formButtonPrimary: "bg-accent text-accent-fg hover:bg-accent-hover",
                footerActionLink: "text-accent hover:text-accent-hover",
                dividerLine: "bg-border-default",
                dividerText: "text-text-muted",
                formFieldInput: "bg-bg-base border border-border-default text-text-primary placeholder-text-muted",
                formFieldLabel: "text-text-secondary font-syne",
                formResendCodeLink: "text-accent hover:text-accent-hover",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
