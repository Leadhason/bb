"use client";

import { useState } from "react";
import { updateStoreSettings, StoreSettings } from "./actions";

interface StoreSettingsFormProps {
  initialData: StoreSettings;
  beats: Array<{ id: string; title: string }>;
}

export default function StoreSettingsForm({
  initialData,
  beats,
}: StoreSettingsFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name,
    bio: initialData.bio,
    profileImageUrl: initialData.profileImageUrl || "",
    twitterUrl: initialData.twitterUrl || "",
    instagramUrl: initialData.instagramUrl || "",
    tiktokUrl: initialData.tiktokUrl || "",
    discordUrl: initialData.discordUrl || "",
    featuredBeatIds: initialData.featuredBeatIds,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      if (checkbox.checked) {
        setFormData({
          ...formData,
          featuredBeatIds: [...formData.featuredBeatIds, value],
        });
      } else {
        setFormData({
          ...formData,
          featuredBeatIds: formData.featuredBeatIds.filter((id) => id !== value),
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Store name is required";
    }

    if (formData.twitterUrl && !isValidUrl(formData.twitterUrl)) {
      newErrors.twitterUrl = "Invalid Twitter URL";
    }

    if (formData.instagramUrl && !isValidUrl(formData.instagramUrl)) {
      newErrors.instagramUrl = "Invalid Instagram URL";
    }

    if (formData.tiktokUrl && !isValidUrl(formData.tiktokUrl)) {
      newErrors.tiktokUrl = "Invalid TikTok URL";
    }

    if (formData.discordUrl && !isValidUrl(formData.discordUrl)) {
      newErrors.discordUrl = "Invalid Discord URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await updateStoreSettings(formData);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings:", error);
      alert("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Store Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Store Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="My Beat Store"
          className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-muted ${
            errors.name ? "border-red-500" : "border-border-default"
          }`}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-2">
          Producer Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell customers about yourself and your music..."
          rows={4}
          className="w-full px-4 py-2 border border-border-default rounded-lg bg-surface text-text-primary placeholder-text-muted"
        />
        <p className="text-xs text-text-muted mt-1">
          {formData.bio.length}/500 characters
        </p>
      </div>

      {/* Profile Image URL */}
      <div>
        <label htmlFor="profileImageUrl" className="block text-sm font-medium mb-2">
          Profile Image URL
        </label>
        <input
          type="text"
          id="profileImageUrl"
          name="profileImageUrl"
          value={formData.profileImageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border border-border-default rounded-lg bg-surface text-text-primary placeholder-text-muted"
        />
        <p className="text-xs text-text-muted mt-1">
          Upload to Supabase first, then paste URL here
        </p>
      </div>

      {/* Social Links */}
      <div className="border-t border-border-subtle pt-6">
        <h3 className="font-semibold text-text-primary mb-4">Social Links</h3>

        <div className="space-y-4">
          {/* Twitter */}
          <div>
            <label htmlFor="twitterUrl" className="block text-sm font-medium mb-2">
              Twitter/X URL
            </label>
            <input
              type="text"
              id="twitterUrl"
              name="twitterUrl"
              value={formData.twitterUrl}
              onChange={handleChange}
              placeholder="https://twitter.com/username"
              className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-muted ${
                errors.twitterUrl ? "border-red-500" : "border-border-default"
              }`}
            />
            {errors.twitterUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.twitterUrl}</p>
            )}
          </div>

          {/* Instagram */}
          <div>
            <label htmlFor="instagramUrl" className="block text-sm font-medium mb-2">
              Instagram URL
            </label>
            <input
              type="text"
              id="instagramUrl"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleChange}
              placeholder="https://instagram.com/username"
              className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-muted ${
                errors.instagramUrl ? "border-red-500" : "border-border-default"
              }`}
            />
            {errors.instagramUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.instagramUrl}</p>
            )}
          </div>

          {/* TikTok */}
          <div>
            <label htmlFor="tiktokUrl" className="block text-sm font-medium mb-2">
              TikTok URL
            </label>
            <input
              type="text"
              id="tiktokUrl"
              name="tiktokUrl"
              value={formData.tiktokUrl}
              onChange={handleChange}
              placeholder="https://tiktok.com/@username"
              className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-muted ${
                errors.tiktokUrl ? "border-red-500" : "border-border-default"
              }`}
            />
            {errors.tiktokUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.tiktokUrl}</p>
            )}
          </div>

          {/* Discord */}
          <div>
            <label htmlFor="discordUrl" className="block text-sm font-medium mb-2">
              Discord URL
            </label>
            <input
              type="text"
              id="discordUrl"
              name="discordUrl"
              value={formData.discordUrl}
              onChange={handleChange}
              placeholder="https://discord.gg/invitecode"
              className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-muted ${
                errors.discordUrl ? "border-red-500" : "border-border-default"
              }`}
            />
            {errors.discordUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.discordUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Featured Beats */}
      <div className="border-t border-border-subtle pt-6">
        <h3 className="font-semibold text-text-primary mb-4">
          Featured Beats (Select up to 5)
        </h3>

        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {beats.map((beat) => (
            <label key={beat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featuredBeatIds"
                value={beat.id}
                checked={formData.featuredBeatIds.includes(beat.id)}
                onChange={handleChange}
                disabled={
                  formData.featuredBeatIds.length >= 5 &&
                  !formData.featuredBeatIds.includes(beat.id)
                }
                className="w-4 h-4 rounded accent-accent"
              />
              <span className="text-sm text-text-primary truncate">
                {beat.title}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-2">
          {formData.featuredBeatIds.length}/5 selected
        </p>
      </div>

      {/* Submit Button */}
      <div className="border-t border-border-subtle pt-6 flex justify-end gap-3">
        <button
          type="button"
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </form>
  );
}
