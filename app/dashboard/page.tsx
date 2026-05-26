"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { 
  Download, 
  Disc, 
  User, 
  Settings, 
  ShieldCheck, 
  Music, 
  Loader2, 
  AlertCircle, 
  ShoppingBag 
} from "lucide-react";
import Link from "next/link";

interface PurchasedBeat {
  id: string;
  title: string;
  genre: string;
  licenseType: "Non-Exclusive" | "Exclusive";
  purchaseDate: string;
  coverColor: string;
  orderRef: string;
}

export default function Dashboard() {
  const { showToast } = useStore();
  const { isSignedIn, isLoaded, user } = useUser();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Mock purchased beats list
  const mockPurchased: PurchasedBeat[] = [
    {
      id: "purch-1",
      title: "Ghost Town",
      genre: "UK Drill",
      licenseType: "Non-Exclusive",
      purchaseDate: "2026-05-20",
      coverColor: "from-zinc-900 to-black border-zinc-800",
      orderRef: "ORD-849204"
    },
    {
      id: "purch-2",
      title: "Spitfire",
      genre: "Trap",
      licenseType: "Exclusive",
      purchaseDate: "2026-05-14",
      coverColor: "from-amber-950/30 to-black border-amber-950/40",
      orderRef: "ORD-930492"
    }
  ];

  // Auto fill profile values when Clerk user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      setProfileName(user.fullName || "");
      setProfileEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, user]);

  // If loading user session state
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="font-syne text-[13px]">Verifying account authentication session...</span>
      </div>
    );
  }

  // Gate page if unauthenticated
  if (!isSignedIn) {
    return (
      <div className="max-w-[400px] mx-auto text-center py-20 bg-bg-surface border border-border-default rounded-xl px-8 mt-12 shadow-sm animate-fadeIn">
        <AlertCircle className="w-10 h-10 text-danger-text mx-auto mb-4" />
        <h2 className="font-syne font-bold text-[20px] text-text-primary mb-2">
          Authentication Required
        </h2>
        <p className="text-[12px] text-text-secondary mb-6 leading-relaxed">
          Please log in to your account to access purchase downloads, contract agreements, and personal details.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/login" className="btn-primary py-2 text-[12px] uppercase font-syne font-medium text-center">
            Sign In
          </Link>
          <Link href="/" className="btn-ghost py-2 text-[12px] text-text-muted hover:text-text-primary text-center">
            Back to Beat Store
          </Link>
        </div>
      </div>
    );
  }

  // Handle re-download simulation
  const handleReDownload = (beat: PurchasedBeat) => {
    setDownloadingId(beat.id);
    showToast(`Generating signed URL for: ${beat.title}...`, "neutral");

    setTimeout(() => {
      setDownloadingId(null);
      showToast(`WAV master loops downloaded successfully!`, "success");
      
      // trigger a browser download download
      const link = document.createElement("a");
      link.href = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      link.setAttribute("download", `${beat.title}_WAV_MASTER.wav`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2000);
  };

  // Handle settings update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    setTimeout(() => {
      setSavingProfile(false);
      showToast("Profile details updated successfully!", "success");
    }, 1500);
  };

  return (
    <div className="w-full max-w-[800px] mx-auto pt-6 pb-12 animate-fadeIn flex flex-col gap-10">
      
      {/* Dashboard Header */}
      <div className="border-b border-border-subtle pb-6 flex justify-between items-end">
        <div>
          <h1 className="font-syne font-bold text-[28px] text-text-primary uppercase tracking-wider">
            My Purchases
          </h1>
          <p className="font-syne text-[13px] text-text-secondary mt-1">
            {mockPurchased.length} Beats Purchased safely
          </p>
        </div>
        <div className="font-mono text-[11px] bg-bg-surface border border-border-default text-success-text px-3 py-1 rounded-md flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          ACCOUNT AUTHENTICATED
        </div>
      </div>

      {/* Purchases List */}
      <div className="flex flex-col gap-4">
        {mockPurchased.length > 0 ? (
          mockPurchased.map((purch) => (
            <div 
              key={purch.id}
              className="bg-bg-surface border border-border-default rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-border-strong transition-colors shadow-sm"
            >
              {/* Cover info */}
              <div className="flex gap-4 items-center">
                <div 
                  className={`w-11 h-11 rounded-md bg-gradient-to-br ${purch.coverColor} border border-border-default flex-shrink-0 flex items-center justify-center`}
                >
                  <Disc className="w-5 h-5 text-text-secondary/50 animate-[spin_10s_linear_infinite]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-syne font-semibold text-[14px] text-text-primary">
                      {purch.title}
                    </h3>
                    <span className="badge badge-success text-[9px] uppercase font-syne py-0.5 leading-none">
                      {purch.licenseType}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-text-muted mt-1 uppercase tracking-wider flex items-center gap-2">
                    <span>{purch.orderRef}</span>
                    <span>·</span>
                    <span>Bought on {purch.purchaseDate}</span>
                  </div>
                </div>
              </div>

              {/* Action downloads */}
              <div className="flex items-center gap-2 ml-15 sm:ml-0">
                <button
                  onClick={() => handleReDownload(purch)}
                  disabled={downloadingId !== null}
                  className="btn-secondary h-9 px-4 text-[11px] uppercase font-syne font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingId === purch.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Re-download WAV
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-bg-surface border border-border-default rounded-lg">
            <ShoppingBag className="w-8 h-8 text-text-disabled mx-auto mb-3" />
            <p className="font-syne text-[13px] text-text-secondary">No purchases found on this account yet.</p>
            <Link href="/" className="btn-primary mt-4 inline-block text-[11px] py-1.5 px-4 font-syne uppercase">
              Browse Storefront Catalogue
            </Link>
          </div>
        )}
      </div>

      {/* Account Settings Section */}
      <div className="border-t border-border-subtle pt-10 flex flex-col gap-5">
        <h2 className="font-syne font-bold text-[18px] text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4.5 h-4.5 text-text-secondary" />
          Account details
        </h2>

        <form onSubmit={handleSaveProfile} className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="input h-10 bg-bg-elevated"
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                disabled
                value={profileEmail}
                className="input h-10 bg-bg-elevated opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border-subtle mt-2 flex-wrap gap-4">
            <SignOutButton>
              <button 
                type="button"
                className="btn-ghost text-[12px] text-danger-text hover:bg-danger-bg px-4 py-2 border border-danger-text/20 rounded-md transition-colors"
              >
                Log out of account
              </button>
            </SignOutButton>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary h-10 px-6 text-[12px] uppercase font-syne font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
