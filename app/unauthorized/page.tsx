import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-lg bg-badge-danger-bg flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-badge-danger-text" />
          </div>
        </div>

        <h1 className="font-syne font-bold text-3xl text-text-primary mb-2 tracking-widest uppercase">
          Access Denied
        </h1>

        <p className="text-text-secondary mb-6">
          You do not have permission to access the admin dashboard. This area is restricted to the producer only.
        </p>

        <Link
          href="/"
          className="btn-primary h-10 px-5 text-sm uppercase font-syne font-medium inline-flex items-center justify-center"
        >
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
