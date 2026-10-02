"use client";

import React, { useState } from "react";
import { TrendingUp, Sparkles } from "lucide-react";

export interface MonthData {
  month: string;
  revenue: number;
  isCurrent: boolean;
}

interface RevenueChartProps {
  monthlyData: MonthData[];
  nonExclCount: number;
  exclCount: number;
  totalOrders: number;
}

export default function RevenueChart({
  monthlyData,
  nonExclCount,
  exclCount,
  totalOrders,
}: RevenueChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<MonthData | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Determine max revenue for scaling chart bars
  const maxRevenue = Math.max(1, ...monthlyData.map((d) => d.revenue));
  const yearTotal = monthlyData.reduce((sum, d) => sum + d.revenue, 0);

  const nonExclPct = totalOrders > 0 ? Math.round((nonExclCount / totalOrders) * 100) : 0;
  const exclPct = totalOrders > 0 ? Math.round((exclCount / totalOrders) * 100) : 0;

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <h3 className="font-semibold text-sm text-text-primary uppercase tracking-wider">
              Monthly Revenue Performance
            </h3>
          </div>
          <p className="font-mono text-[11px] text-text-muted mt-1 flex items-center gap-1.5">
            <span>Year-to-date sales:</span>
            <span className="text-green-400 font-bold font-mono">${yearTotal.toFixed(2)} USD</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono mr-2">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              Past Months
            </span>
            <span className="flex items-center gap-1.5 text-text-secondary">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
              Current Month
            </span>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-bg-elevated border border-border-strong text-text-primary text-[12px] font-mono rounded px-3 py-1.5 outline-none cursor-pointer hover:border-green-500 transition-colors"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Main Chart Grid: 12-Month Bar Chart + License Split */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-end">
        {/* 12-Month Solid Color Bars */}
        <div className="w-full">
          {/* Hover Value Banner / Indicator */}
          <div className="h-7 mb-2 flex items-center">
            {hoveredMonth ? (
              <span
                className={`font-mono text-[12px] text-text-primary bg-bg-elevated border px-3 py-1 rounded-md shadow-lg flex items-center gap-2 animate-fadeIn ${
                  hoveredMonth.isCurrent ? "border-green-500" : "border-red-500"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    hoveredMonth.isCurrent ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-text-muted">{hoveredMonth.month}:</span>
                <span
                  className={`font-bold ${
                    hoveredMonth.isCurrent ? "text-green-400" : "text-red-400"
                  }`}
                >
                  ${hoveredMonth.revenue.toFixed(2)} USD
                </span>
                {hoveredMonth.isCurrent && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-green-500/20 text-green-400 border border-green-500/40">
                    Current
                  </span>
                )}
              </span>
            ) : (
              <span className="font-mono text-[11px] text-text-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-green-400" />
                Hover over any month to view exact revenue earnings
              </span>
            )}
          </div>

          {/* Bar Chart Canvas with Solid Fills */}
          <div className="flex items-end gap-2 sm:gap-3.5 h-44 pt-6 px-1 border-b border-border-subtle bg-bg-elevated/20 rounded-t-lg">
            {monthlyData.map((item) => {
              const heightPercent = item.revenue > 0 
                ? Math.max(12, Math.round((item.revenue / maxRevenue) * 100))
                : 4;

              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  onMouseEnter={() => setHoveredMonth(item)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Floating Tooltip */}
                  {hoveredMonth?.month === item.month && (
                    <div
                      className={`absolute -top-9 bg-neutral-900 border text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded shadow-xl pointer-events-none whitespace-nowrap z-20 animate-slideUp ${
                        item.isCurrent ? "border-green-500" : "border-red-500"
                      }`}
                    >
                      ${item.revenue.toFixed(0)}
                    </div>
                  )}

                  {/* The Solid Color Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-sm transition-all duration-200 group-hover:brightness-110 ${
                      item.isCurrent
                        ? "bg-green-500 hover:bg-green-400"
                        : item.revenue > 0
                        ? "bg-blue-500 hover:bg-blue-400"
                        : "bg-bg-elevated/80 group-hover:bg-bg-overlay"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Month Labels */}
          <div className="flex justify-between gap-2 sm:gap-3.5 mt-2.5 px-1">
            {monthlyData.map((item) => (
              <div
                key={item.month}
                className={`flex-1 text-center font-mono text-[11px] transition-colors ${
                  item.isCurrent 
                    ? "text-green-400 font-bold" 
                    : item.revenue > 0 
                    ? "text-red-400 font-medium" 
                    : "text-text-muted"
                }`}
              >
                {item.month}
              </div>
            ))}
          </div>
        </div>

        {/* License Split Section (Solid Green & Red) */}
        <div className="bg-bg-elevated/60 border border-border-default rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-xs text-text-primary uppercase tracking-wider">
                License Split
              </h4>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>

            {/* Non-Exclusive Progress Bar (Solid Green) */}
            <div className="mb-5">
              <div className="flex justify-between text-[11px] font-mono mb-2">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Non-Exclusive
                </span>
                <span className="text-green-400 font-bold">{nonExclCount} ({nonExclPct}%)</span>
              </div>
              <div className="h-2.5 w-full bg-bg-surface rounded-full overflow-hidden p-0.5 border border-border-subtle">
                <div
                  style={{ width: `${nonExclPct}%` }}
                  className="h-full bg-green-500 transition-all duration-300 rounded-full"
                />
              </div>
            </div>

            {/* Exclusive Progress Bar (Solid Red) */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-2">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Exclusive
                </span>
                <span className="text-red-400 font-bold">{exclCount} ({exclPct}%)</span>
              </div>
              <div className="h-2.5 w-full bg-bg-surface rounded-full overflow-hidden p-0.5 border border-border-subtle">
                <div
                  style={{ width: `${exclPct}%` }}
                  className="h-full bg-red-500 transition-all duration-300 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-5 border-t border-border-subtle text-[11px] font-mono flex justify-between items-center">
            <span className="text-text-muted">Total Units Sold:</span>
            <span className="text-text-primary font-bold text-sm bg-bg-surface px-2.5 py-0.5 rounded border border-border-subtle">
              {totalOrders} units
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
