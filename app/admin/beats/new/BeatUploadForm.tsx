"use client";

import React, { useState } from "react";
import { uploadBeatAction } from "./actions";
import { useStore } from "../../../../context/StoreContext";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function BeatUploadForm() {
  const { showToast } = useStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    bpm: "",
    key: "",
    genre: "",
    tags: "",
    nonExclusivePrice: "29.99",
    nonExclusiveCap: "",
    exclusivePrice: "199.99"
  });

  const [toggles, setToggles] = useState({
    isGiveaway: false,
    nonExclusiveEnabled: true,
    exclusiveEnabled: true,
    published: true,
  });

  // Basic file state (for actual file uploads to Supabase, we would handle logic with Supabase Storage)
  // For the moment, we only accept text inputs or simple files.
  // We'll set these up to capture the File object.
  const [files, setFiles] = useState<{
    cover: File | null;
    mp3: File | null;
    wav: File | null;
  }>({
    cover: null,
    mp3: null,
    wav: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: keyof typeof toggles) => {
    if (name === "isGiveaway") {
      setToggles(prev => ({
        ...prev,
        isGiveaway: !prev.isGiveaway,
        nonExclusiveEnabled: !prev.isGiveaway,
        exclusiveEnabled: false,
      }));
      setFormData(prev => ({
        ...prev,
        nonExclusivePrice: !toggles.isGiveaway ? "0" : "29.99",
        exclusivePrice: !toggles.isGiveaway ? "0" : "199.99",
      }));
    } else {
      setToggles(prev => ({ ...prev, [name]: !prev[name] }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setFiles(prev => ({ ...prev, [type]: fileList[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!files.cover || !files.mp3 || !files.wav) {
        throw new Error("Please select all required files (Cover, MP3, WAV).");
      }

      showToast("Uploading files to Supabase...", "success");

      // 1. Upload Cover Art
      const coverPath = `${Date.now()}-${files.cover.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const { error: coverError } = await supabase.storage.from("covers").upload(coverPath, files.cover);
      if (coverError) throw new Error(`Cover upload failed: ${coverError.message}`);
      const { data: { publicUrl: coverUrl } } = supabase.storage.from("covers").getPublicUrl(coverPath);

      // 2. Upload Watermarked MP3
      const mp3Path = `${Date.now()}-${files.mp3.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const { error: mp3Error } = await supabase.storage.from("watermarked-mp3s").upload(mp3Path, files.mp3);
      if (mp3Error) throw new Error(`MP3 upload failed: ${mp3Error.message}`);
      const { data: { publicUrl: mp3Url } } = supabase.storage.from("watermarked-mp3s").getPublicUrl(mp3Path);

      // 3. Upload Clean WAV (Private)
      const wavPath = `${Date.now()}-${files.wav.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const { error: wavError } = await supabase.storage.from("clean-wavs").upload(wavPath, files.wav);
      if (wavError) throw new Error(`WAV upload failed: ${wavError.message}`);
      const wavUrl = wavPath; // We store the internal path because we generate signed URLs later

      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
      Object.entries(toggles).forEach(([key, value]) => submitData.append(key, String(value)));
      
      // Handle giveaway pricing
      if (toggles.isGiveaway) {
        submitData.set("nonExclusivePrice", "0");
        submitData.set("exclusivePrice", "0");
        submitData.set("nonExclusiveEnabled", "true");
        submitData.set("exclusiveEnabled", "false");
      }
      
      submitData.append("coverUrl", coverUrl);
      submitData.append("mp3Url", mp3Url);
      submitData.append("wavUrl", wavUrl);

      showToast("Saving metadata to database...", "success");
      const result = await uploadBeatAction(submitData);

      if (result.success) {
        showToast("Beat uploaded successfully!", "success");
        router.push("/admin"); // Or directly to dashboard
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to upload beat", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-bg-surface p-6 rounded-xl border border-border-default">
      
      {/* File Uploads */}
      <div className="space-y-4">
        <h2 className="font-syne font-semibold text-lg border-b border-border-subtle pb-2">Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Cover Art (Square)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cover")} className="text-sm file:bg-bg-elevated file:border-border-strong file:border file:rounded-md file:px-3 file:py-1.5 file:text-text-primary file:font-mono file:text-xs" required />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Watermarked MP3</label>
            <input type="file" accept="audio/mpeg" onChange={(e) => handleFileChange(e, "mp3")} className="text-sm file:bg-bg-elevated file:border-border-strong file:border file:rounded-md file:px-3 file:py-1.5 file:text-text-primary file:font-mono file:text-xs" required />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Clean WAV</label>
            <input type="file" accept="audio/wav" onChange={(e) => handleFileChange(e, "wav")} className="text-sm file:bg-bg-elevated file:border-border-strong file:border file:rounded-md file:px-3 file:py-1.5 file:text-text-primary file:font-mono file:text-xs" required />
          </div>
        </div>
      </div>

      {/* Basic Metadata */}
      <div className="space-y-4">
        <h2 className="font-syne font-semibold text-lg border-b border-border-subtle pb-2">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-bg-elevated border border-border-strong rounded-md h-10 px-3 font-syne text-sm focus:border-accent focus:outline-none" placeholder="e.g. DARK KNIGHT" />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted">BPM *</label>
            <input type="number" name="bpm" value={formData.bpm} onChange={handleChange} required className="w-full bg-bg-elevated border border-border-strong rounded-md h-10 px-3 font-mono text-sm focus:border-accent focus:outline-none" placeholder="140" />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Key *</label>
            <input type="text" name="key" value={formData.key} onChange={handleChange} required className="w-full bg-bg-elevated border border-border-strong rounded-md h-10 px-3 font-mono text-sm focus:border-accent focus:outline-none" placeholder="C# Min" />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Genre *</label>
            <input type="text" name="genre" value={formData.genre} onChange={handleChange} required className="w-full bg-bg-elevated border border-border-strong rounded-md h-10 px-3 font-syne text-sm focus:border-accent focus:outline-none" placeholder="UK Drill" />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Tags (comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-bg-elevated border border-border-strong rounded-md h-10 px-3 font-syne text-sm focus:border-accent focus:outline-none" placeholder="dark, aggressive, slide" />
          </div>
        </div>
      </div>

      {/* Licensing & Pricing */}
      <div className="space-y-4">
        <h2 className="font-syne font-semibold text-lg border-b border-border-subtle pb-2">Licensing</h2>

        {/* Giveaway Toggle */}
        <div className="border border-border-subtle p-4 rounded-lg bg-bg-elevated bg-opacity-50">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-syne font-medium text-sm">Free Beat (Giveaway)</span>
              <p className="font-syne text-xs text-text-muted mt-1">Customers receive the WAV without payment</p>
            </div>
            <button type="button" onClick={() => handleToggle("isGiveaway")} className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${toggles.isGiveaway ? "bg-badge-success-bg border-badge-success-text border" : "bg-bg-elevated border-border-strong border"}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${toggles.isGiveaway ? "translate-x-4 mix-blend-difference" : "translate-x-0 bg-text-muted"}`} />
            </button>
          </div>
        </div>

        {!toggles.isGiveaway && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Non-Exclusive */}
            <div className="space-y-4 border border-border-subtle p-4 rounded-lg bg-bg-base">
              <div className="flex items-center justify-between">
                <span className="font-syne font-medium text-sm">Non-Exclusive</span>
                <button type="button" onClick={() => handleToggle("nonExclusiveEnabled")} className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${toggles.nonExclusiveEnabled ? "bg-badge-success-bg border-badge-success-text border" : "bg-bg-elevated border-border-strong border"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${toggles.nonExclusiveEnabled ? "translate-x-4 mix-blend-difference" : "translate-x-0 bg-text-muted"}`} />
                </button>
              </div>
              {toggles.nonExclusiveEnabled && (
                <>
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Price (USD)</label>
                    <input type="number" step="0.01" name="nonExclusivePrice" value={formData.nonExclusivePrice} onChange={handleChange} required={toggles.nonExclusiveEnabled} className="w-full bg-bg-surface border border-border-strong rounded-md h-10 px-3 font-mono text-sm focus:border-accent focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Sales Cap (Optional)</label>
                    <input type="number" name="nonExclusiveCap" value={formData.nonExclusiveCap} onChange={handleChange} className="w-full bg-bg-surface border border-border-strong rounded-md h-10 px-3 font-mono text-sm focus:border-accent focus:outline-none" placeholder="Leave empty for unlimited" />
                  </div>
                </>
              )}
            </div>

            {/* Exclusive */}
            <div className="space-y-4 border border-border-subtle p-4 rounded-lg bg-bg-base">
              <div className="flex items-center justify-between">
                <span className="font-syne font-medium text-sm">Exclusive</span>
                <button type="button" onClick={() => handleToggle("exclusiveEnabled")} className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${toggles.exclusiveEnabled ? "bg-badge-success-bg border-badge-success-text border" : "bg-bg-elevated border-border-strong border"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${toggles.exclusiveEnabled ? "translate-x-4 mix-blend-difference" : "translate-x-0 bg-text-muted"}`} />
                </button>
              </div>
              {toggles.exclusiveEnabled && (
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase tracking-wider text-text-muted">Price (USD)</label>
                  <input type="number" step="0.01" name="exclusivePrice" value={formData.exclusivePrice} onChange={handleChange} required={toggles.exclusiveEnabled} className="w-full bg-bg-surface border border-border-strong rounded-md h-10 px-3 font-mono text-sm focus:border-accent focus:outline-none" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border-default border-dashed">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={toggles.published} onChange={() => handleToggle("published")} className="w-4 h-4 rounded border-border-strong bg-bg-elevated accent-accent cursor-pointer group-hover:border-accent transition-colors" />
          <span className="font-syne text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Publish immediately</span>
        </label>
        
        <button type="submit" disabled={isLoading} className="btn-primary h-11 px-8 rounded-md font-medium text-sm flex items-center gap-2 disabled:opacity-50">
          {isLoading ? (
            <span className="animate-pulse">Uploading...</span>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Save & Upload
            </>
          )}
        </button>
      </div>
    </form>
  );
}