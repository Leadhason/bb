"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

interface OrderFiltersProps {
  beats: Array<{ id: string; title: string }>;
  currentFilters: {
    beat?: string;
    licenseType?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function OrderFilters({ beats, currentFilters }: OrderFiltersProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState(currentFilters.beat || "");
  const [selectedLicense, setSelectedLicense] = useState(currentFilters.licenseType || "");
  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (selectedBeat) params.append("beat", selectedBeat);
    if (selectedLicense) params.append("licenseType", selectedLicense);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    router.push(`/admin/orders${queryString ? "?" + queryString : ""}`);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedBeat("");
    setSelectedLicense("");
    setStartDate("");
    setEndDate("");
    router.push("/admin/orders");
    setShowFilters(false);
  };

  const hasActiveFilters =
    selectedBeat || selectedLicense || startDate || endDate;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Toggle */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border-default rounded-md hover:border-border-strong transition-colors font-syne text-sm font-medium text-text-primary"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-accent text-white rounded text-xs font-bold">
              {[selectedBeat, selectedLicense, startDate, endDate].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-xs font-syne font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-4">
          {/* Beat Filter */}
          <div>
            <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
              Beat
            </label>
            <select
              value={selectedBeat}
              onChange={(e) => setSelectedBeat(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-syne text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
            >
              <option value="">All beats</option>
              {beats.map((beat) => (
                <option key={beat.id} value={beat.id}>
                  {beat.title}
                </option>
              ))}
            </select>
          </div>

          {/* License Type Filter */}
          <div>
            <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
              License Type
            </label>
            <select
              value={selectedLicense}
              onChange={(e) => setSelectedLicense(e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-syne text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
            >
              <option value="">All types</option>
              <option value="NON_EXCLUSIVE">Non-Exclusive</option>
              <option value="EXCLUSIVE">Exclusive</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-syne text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
              />
            </div>
            <div>
              <label className="block font-syne font-medium text-xs text-text-secondary uppercase tracking-wider mb-2">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-bg-elevated border border-border-subtle rounded-md px-3 py-2 font-syne text-sm text-text-primary focus:outline-none focus:border-border-strong transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 bg-accent hover:bg-opacity-90 text-white font-syne font-medium text-sm py-2 rounded-md transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 bg-bg-elevated hover:bg-bg-hover border border-border-default text-text-primary font-syne font-medium text-sm py-2 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
