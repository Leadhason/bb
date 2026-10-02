"use client";

import { useState } from "react";
import { updateStoreSettings, StoreSettings } from "./actions";

interface StoreSettingsFormProps {
  initialData: StoreSettings;
}

export default function StoreSettingsForm({
  initialData,
}: StoreSettingsFormProps) {
  const [formData, setFormData] = useState({
    youtubeUrl: initialData.youtubeUrl || "",
    instagramUrl: initialData.instagramUrl || "",
    contactEmail: initialData.contactEmail || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.youtubeUrl && !isValidUrl(formData.youtubeUrl)) {
      newErrors.youtubeUrl = "Invalid YouTube URL";
    }

    if (formData.instagramUrl && !isValidUrl(formData.instagramUrl)) {
      newErrors.instagramUrl = "Invalid Instagram URL";
    }

    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      newErrors.contactEmail = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await updateStoreSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error) {
      console.error("Failed to update settings:", error);
      setSaveError("Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
          <span className="font-semibold">✓</span> Settings updated and synced with the storefront!
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {saveError}
        </div>
      )}

      {/* Social Links & Contact */}
      <div>
        <h3 className="font-semibold text-text-primary mb-4">Social Links & Contact</h3>

        <div className="space-y-4">
          {/* YouTube */}
          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium mb-2">
              YouTube URL
            </label>
            <input
              type="text"
              id="youtubeUrl"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/@channel"
              className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-muted ${
                errors.youtubeUrl ? "border-red-500" : "border-border-default"
              }`}
            />
            {errors.youtubeUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.youtubeUrl}</p>
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

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="support@example.com"
              className={`w-full px-4 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-muted ${
                errors.contactEmail ? "border-red-500" : "border-border-default"
              }`}
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-500 mt-1">{errors.contactEmail}</p>
            )}
          </div>
        </div>
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
