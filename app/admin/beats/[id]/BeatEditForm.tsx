"use client";

import React, { useState } from "react";
import { updateBeat } from "../actions";
import { useRouter } from "next/navigation";
import { useStore } from "../../../../context/StoreContext";
import Link from "next/link";
import type { Beat } from "@prisma/client";

export default function BeatEditForm({ beat }: { beat: Beat }) {
  const router = useRouter();
  const { showToast } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: beat.title,
    bpm: beat.bpm.toString(),
    key: beat.key,
    genre: beat.genre,
    tags: beat.tags.join(", "),
    isGiveaway: beat.nonExclusivePrice.toNumber() === 0 && beat.exclusivePrice.toNumber() === 0,
    nonExclusiveEnabled: beat.nonExclusiveEnabled,
    nonExclusivePrice: beat.nonExclusivePrice.toString(),
    nonExclusiveCap: beat.nonExclusiveCap?.toString() || "",
    exclusiveEnabled: beat.exclusiveEnabled,
    exclusivePrice: beat.exclusivePrice.toString(),
    published: beat.published,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleToggle = (name: keyof typeof formData) => {
    if (name === "isGiveaway") {
      setFormData((prev) => ({
        ...prev,
        isGiveaway: !prev.isGiveaway,
        nonExclusivePrice: !prev.isGiveaway ? "0" : prev.nonExclusivePrice,
        exclusivePrice: !prev.isGiveaway ? "0" : prev.exclusivePrice,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: !prev[name],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateBeat(beat.id, {
        title: formData.title,
        bpm: parseInt(formData.bpm, 10),
        key: formData.key,
        genre: formData.genre,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        nonExclusiveEnabled: formData.isGiveaway || formData.nonExclusiveEnabled,
        nonExclusivePrice: formData.isGiveaway ? 0 : parseFloat(formData.nonExclusivePrice),
        nonExclusiveCap: formData.nonExclusiveCap ? parseInt(formData.nonExclusiveCap, 10) : null,
        exclusiveEnabled: formData.isGiveaway ? false : formData.exclusiveEnabled,
        exclusivePrice: formData.isGiveaway ? 0 : parseFloat(formData.exclusivePrice),
        published: formData.published,
      });

      if (result.success) {
        showToast("Beat updated successfully", "success");
        router.push("/admin/beats");
      } else {
        showToast(result.error || "Failed to update beat", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const genres = ["UK Drill", "Trap", "Hip Hop"];
  const keys = ["A Minor", "C Minor", "D# Minor", "E Minor", "F Minor", "G Minor"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-bg-surface border border-border-default rounded-xl p-6 space-y-4">
        <h2 className="font-syne font-semibold text-lg text-text-primary">Basic Information</h2>

        <div>
          <label className="block font-syne text-sm font-medium text-text-secondary mb-2">
            Beat Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 font-syne text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus"
            placeholder="e.g., Ghost Town"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-syne text-sm font-medium text-text-secondary mb-2">
              BPM *
            </label>
            <input
              type="number"
              name="bpm"
              value={formData.bpm}
              onChange={handleChange}
              required
              min="60"
              max="200"
              className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-border-focus"
              placeholder="142"
            />
          </div>

          <div>
            <label className="block font-syne text-sm font-medium text-text-secondary mb-2">
              Key *
            </label>
            <select
              name="key"
              value={formData.key}
              onChange={handleChange}
              required
              className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 font-syne text-sm text-text-primary focus:outline-none focus:border-border-focus"
            >
              {keys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-syne text-sm font-medium text-text-secondary mb-2">
              Genre *
            </label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              required
              className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 font-syne text-sm text-text-primary focus:outline-none focus:border-border-focus"
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-syne text-sm font-medium text-text-secondary mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 font-syne text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus"
            placeholder="Dark, Aggressive, Melodic"
          />
        </div>
      </div>

      {/* Licensing */}
      <div className="bg-bg-surface border border-border-default rounded-xl p-6 space-y-4">
        <h2 className="font-syne font-semibold text-lg text-text-primary">Licensing</h2>

        {/* Giveaway Toggle */}
        <div className="border border-border-subtle rounded-lg p-4 bg-bg-elevated bg-opacity-50">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-syne font-medium text-text-primary">Free Beat (Giveaway)</label>
              <p className="font-syne text-xs text-text-muted mt-1">
                When enabled, this beat is free. Customers receive the WAV without payment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("isGiveaway")}
              className={`px-3 py-1 rounded text-xs font-mono uppercase ${
                formData.isGiveaway
                  ? "bg-badge-success-bg text-badge-success-text"
                  : "bg-badge-neutral-bg text-badge-neutral-text"
              }`}
            >
              {formData.isGiveaway ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>

        {!formData.isGiveaway && (
          <>
            {/* Non-Exclusive */}
            <div className="border border-border-subtle rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-syne font-medium text-text-primary">Non-Exclusive License</label>
                <button
                  type="button"
                  onClick={() => handleToggle("nonExclusiveEnabled")}
                  className={`px-3 py-1 rounded text-xs font-mono uppercase ${
                    formData.nonExclusiveEnabled
                      ? "bg-badge-success-bg text-badge-success-text"
                      : "bg-badge-neutral-bg text-badge-neutral-text"
                  }`}
                >
                  {formData.nonExclusiveEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              {formData.nonExclusiveEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-syne text-sm font-medium text-text-secondary mb-2">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      name="nonExclusivePrice"
                      value={formData.nonExclusivePrice}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      required={formData.nonExclusiveEnabled}
                      className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-border-focus"
                      placeholder="29.99"
                    />
                  </div>

                  <div>
                    <label className="block font-syne text-sm font-medium text-text-secondary mb-2">
                      Sales Cap (optional)
                    </label>
                    <input
                      type="number"
                      name="nonExclusiveCap"
                      value={formData.nonExclusiveCap}
                      onChange={handleChange}
                      min="0"
                      className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-border-focus"
                      placeholder="Leave blank for no limit"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Exclusive */}
            <div className="border border-border-subtle rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-syne font-medium text-text-primary">Exclusive License</label>
                <button
                  type="button"
                  onClick={() => handleToggle("exclusiveEnabled")}
                  className={`px-3 py-1 rounded text-xs font-mono uppercase ${
                    formData.exclusiveEnabled
                      ? "bg-badge-success-bg text-badge-success-text"
                      : "bg-badge-neutral-bg text-badge-neutral-text"
                  }`}
                >
                  {formData.exclusiveEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              {formData.exclusiveEnabled && (
                <div>
                  <label className="block font-syne text-sm font-medium text-text-secondary mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="exclusivePrice"
                    value={formData.exclusivePrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required={formData.exclusiveEnabled}
                    className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-border-focus"
                    placeholder="199.99"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Publication */}
      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-syne font-medium text-text-primary">Publish to Storefront</h3>
            <p className="font-syne text-sm text-text-muted mt-1">
              {formData.published
                ? "This beat is visible to customers"
                : "This beat is hidden from the storefront"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle("published")}
            className={`px-4 py-2 rounded text-sm font-mono uppercase ${
              formData.published
                ? "bg-badge-success-bg text-badge-success-text"
                : "bg-badge-warning-bg text-badge-warning-text"
            }`}
          >
            {formData.published ? "Published" : "Draft"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/beats"
          className="btn-secondary h-10 px-5 text-sm uppercase font-syne font-medium"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary h-10 px-5 text-sm uppercase font-syne font-medium disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
