"use client";

import React, { useState, useEffect, useRef } from "react";
import { uploadBeatAction } from "./actions";
import { useStore } from "../../../../context/StoreContext";
import { Upload, Image as ImageIcon, Music, Lock, FileAudio, X } from "lucide-react";
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

  const [files, setFiles] = useState<{
    cover: File | null;
    mp3: File | null;
    wav: File | null;
  }>({
    cover: null,
    mp3: null,
    wav: null
  });

  const [previews, setPreviews] = useState<{
    cover: string | null;
    mp3: string | null;
    wav: string | null;
  }>({
    cover: null,
    mp3: null,
    wav: null
  });

  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  useEffect(() => {
    return () => {
      if (previewsRef.current.cover) URL.revokeObjectURL(previewsRef.current.cover);
      if (previewsRef.current.mp3) URL.revokeObjectURL(previewsRef.current.mp3);
      if (previewsRef.current.wav) URL.revokeObjectURL(previewsRef.current.wav);
    };
  }, []);

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
      const file = fileList[0];
      setFiles(prev => ({ ...prev, [type]: file }));

      if (previews[type]) {
        URL.revokeObjectURL(previews[type]!);
      }

      setPreviews(prev => ({
        ...prev,
        [type]: URL.createObjectURL(file)
      }));
    }
  };

  const handleRemoveFile = (type: keyof typeof files) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    if (previews[type]) {
      URL.revokeObjectURL(previews[type]!);
    }
    setPreviews(prev => ({ ...prev, [type]: null }));
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

      const tagsArray = formData.tags
        ? formData.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
        : [];

      const isGiveaway = toggles.isGiveaway;

      const payload = {
        title: formData.title,
        bpm: parseInt(formData.bpm, 10) || 0,
        key: formData.key,
        genre: formData.genre,
        tags: tagsArray,
        coverUrl,
        mp3Url,
        wavUrl,
        nonExclusiveEnabled: isGiveaway ? true : toggles.nonExclusiveEnabled,
        nonExclusivePrice: isGiveaway ? 0 : parseFloat(formData.nonExclusivePrice) || 0,
        nonExclusiveCap: (!isGiveaway && formData.nonExclusiveCap) ? parseInt(formData.nonExclusiveCap, 10) : null,
        exclusiveEnabled: isGiveaway ? false : toggles.exclusiveEnabled,
        exclusivePrice: isGiveaway ? 0 : parseFloat(formData.exclusivePrice) || 0,
        published: toggles.published,
      };

      showToast("Saving metadata to database...", "success");
      const result = await uploadBeatAction(payload);

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
          
          {/* Cover Art Slot */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted block">Cover Art (Square) *</label>
            {!files.cover ? (
              <div className="relative border border-dashed border-border-strong rounded-xl aspect-square flex flex-col items-center justify-center p-4 hover:border-border-focus transition-all group cursor-pointer bg-bg-elevated/10">
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cover")} className="absolute inset-0 opacity-0 cursor-pointer z-10" required />
                <ImageIcon className="w-8 h-8 text-text-muted group-hover:text-text-secondary transition-colors mb-2" />
                <span className="font-syne text-xs text-text-secondary font-medium">Select Image</span>
                <span className="font-mono text-[9px] text-text-muted mt-1 uppercase">JPG, PNG up to 5MB</span>
              </div>
            ) : (
              <div className="relative border border-border-strong rounded-xl aspect-square overflow-hidden group bg-bg-elevated/10">
                <img src={previews.cover!} alt="Cover preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-3 transition-opacity duration-200">
                  <span className="font-syne text-xs text-white font-medium text-center truncate w-full mb-3 px-2">{files.cover.name}</span>
                  <button type="button" onClick={() => handleRemoveFile("cover")} className="flex items-center justify-center gap-1.5 py-1.5 px-4 text-xs text-badge-danger-text border border-badge-danger-text/20 bg-badge-danger-bg hover:bg-badge-danger-bg/80 transition-colors font-syne font-medium rounded-md">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Watermarked MP3 Slot */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted block">Watermarked MP3 Preview *</label>
            {!files.mp3 ? (
              <div className="relative border border-dashed border-border-strong rounded-xl flex flex-col items-center justify-center p-6 aspect-square hover:border-border-focus transition-all group cursor-pointer bg-bg-elevated/10">
                <input type="file" accept="audio/mpeg" onChange={(e) => handleFileChange(e, "mp3")} className="absolute inset-0 opacity-0 cursor-pointer z-10" required />
                <Music className="w-8 h-8 text-text-muted group-hover:text-text-secondary transition-colors mb-2" />
                <span className="font-syne text-xs text-text-secondary font-medium">Select MP3</span>
                <span className="font-mono text-[9px] text-text-muted mt-1 uppercase">MP3 format only</span>
              </div>
            ) : (
              <div className="border border-border-strong rounded-xl p-5 bg-bg-elevated/20 flex flex-col justify-between aspect-square">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-bg-elevated border border-border-strong rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileAudio className="w-5 h-5 text-text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-syne text-xs font-semibold text-text-primary truncate">{files.mp3.name}</p>
                      <p className="font-mono text-[10px] text-text-muted mt-0.5">{(files.mp3.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleRemoveFile("mp3")} className="btn-icon !w-7 !h-7 text-text-muted hover:text-badge-danger-text hover:border-badge-danger-text/20 transition-colors" title="Remove File">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-auto">
                  <p className="font-mono text-[10px] text-text-muted mb-2 uppercase tracking-wide">Audio Preview:</p>
                  <audio src={previews.mp3!} controls className="w-full h-8 opacity-90 filter invert dark:invert-0" />
                </div>
              </div>
            )}
          </div>

          {/* Clean WAV Slot */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-text-muted block">Clean WAV (Private) *</label>
            {!files.wav ? (
              <div className="relative border border-dashed border-border-strong rounded-xl flex flex-col items-center justify-center p-6 aspect-square hover:border-border-focus transition-all group cursor-pointer bg-bg-elevated/10">
                <input type="file" accept="audio/wav" onChange={(e) => handleFileChange(e, "wav")} className="absolute inset-0 opacity-0 cursor-pointer z-10" required />
                <Lock className="w-8 h-8 text-text-muted group-hover:text-text-secondary transition-colors mb-2" />
                <span className="font-syne text-xs text-text-secondary font-medium">Select Master WAV</span>
                <span className="font-mono text-[9px] text-text-muted mt-1 uppercase">Private & Secured</span>
              </div>
            ) : (
              <div className="border border-border-strong rounded-xl p-5 bg-bg-elevated/20 flex flex-col justify-between aspect-square">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-bg-elevated border border-border-strong rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileAudio className="w-5 h-5 text-text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-syne text-xs font-semibold text-text-primary truncate">{files.wav.name}</p>
                      <p className="font-mono text-[10px] text-text-muted mt-0.5">{(files.wav.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleRemoveFile("wav")} className="btn-icon !w-7 !h-7 text-text-muted hover:text-badge-danger-text hover:border-badge-danger-text/20 transition-colors" title="Remove File">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-auto flex items-center gap-2 bg-badge-success-bg/10 border border-badge-success-text/20 rounded-lg px-3 py-2 text-badge-success-text">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="font-syne text-[10px] uppercase font-bold tracking-wider">Private Staged</span>
                </div>
              </div>
            )}
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