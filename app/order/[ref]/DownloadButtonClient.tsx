"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DownloadButtonClientProps {
  orderRef: string;
  isEnabled: boolean;
}

export default function DownloadButtonClient({ orderRef, isEnabled }: DownloadButtonClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDownload = () => {
    if (!isEnabled || loading) return;
    setLoading(true);

    try {
      // Redirect to the API route which handles attempt incrementing and redirects to Supabase Signed URL.
      // Because the endpoint redirects to a file URL with attachment disposition, 
      // the browser handles this as a file download without unloading or navigating away from this page.
      window.location.href = `/api/orders/${orderRef}/download`;

      // Wait 3 seconds for the download to initiate, then refresh the page state 
      // so the Server Component pulls the updated download attempts from the DB.
      setTimeout(() => {
        router.refresh();
        setLoading(false);
      }, 3000);
    } catch (error) {
      console.error("Download failed to initiate:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!isEnabled || loading}
      className="btn-primary h-12 w-full max-w-[360px] flex items-center justify-center gap-2.5 text-[12px] uppercase font-syne font-medium transition-transform active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-accent-fg" />
          Requesting master WAV...
        </>
      ) : (
        <>
          <Download className="w-4.5 h-4.5 text-accent-fg" />
          Download WAV Master
        </>
      )}
    </button>
  );
}
