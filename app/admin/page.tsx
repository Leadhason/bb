import React from "react";
import prisma from "../../lib/prisma";
import Link from "next/link";
import { ArrowRight, Music, ShoppingCart, Tag, Settings, ExternalLink, DollarSign, TrendingUp, Zap } from "lucide-react";
import RevenueChart from "./RevenueChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Fetch all completed orders with beats and customer profiles
  const orders = await prisma.order.findMany({
    include: {
      beat: true,
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 2. Fetch total and published beats
  const totalBeats = await prisma.beat.count();
  const publishedBeats = await prisma.beat.count({ where: { published: true } });

  // 3. Fetch top beats with their orders for the Beat Performance table
  const beatsWithOrders = await prisma.beat.findMany({
    include: {
      orders: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  // 4. Calculate Financial & License Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amountUsd), 0);
  const totalOrders = orders.length;
  const nonExclCount = orders.filter((o) => o.licenseType === "NON_EXCLUSIVE").length;
  const exclCount = orders.filter((o) => o.licenseType === "EXCLUSIVE").length;

  // Monthly Revenue Calculation (Jan - Dec of current year)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTotals: number[] = new Array(12).fill(0);

  for (const order of orders) {
    const orderDate = new Date(order.createdAt);
    if (orderDate.getFullYear() === currentYear) {
      monthlyTotals[orderDate.getMonth()] += Number(order.amountUsd);
    }
  }

  const thisMonthRevenue = monthlyTotals[currentMonthIdx];
  const lastMonthIdx = (currentMonthIdx + 11) % 12;
  const lastMonthRevenue = monthlyTotals[lastMonthIdx];

  let growthText = "0% vs last month";
  let isPositiveGrowth = true;
  if (lastMonthRevenue > 0) {
    const pct = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    growthText = `${pct >= 0 ? "↑" : "↓"} ${Math.abs(Math.round(pct))}% vs last month`;
    isPositiveGrowth = pct >= 0;
  } else if (thisMonthRevenue > 0) {
    growthText = "↑ 100% vs last month";
    isPositiveGrowth = true;
  }

  const monthlyData = monthNames.map((month, idx) => ({
    month,
    revenue: monthlyTotals[idx],
    isCurrent: idx === currentMonthIdx,
  }));

  // 5. Previews & Conversion Rates calculated directly from real database preview records
  const beatPerformance = beatsWithOrders.map((beat) => {
    const purchases = beat.orders.length;
    const nonExclSold = beat.orders.filter((o) => o.licenseType === "NON_EXCLUSIVE").length;
    const exclSold = beat.orders.filter((o) => o.licenseType === "EXCLUSIVE").length;
    const previews = Math.max(purchases, Number((beat as any).previewCount || 0));
    const conversion = previews > 0 ? ((purchases / previews) * 100).toFixed(1) : (purchases > 0 ? "100.0" : "0.0");

    return {
      id: beat.id,
      title: beat.title,
      genre: beat.genre,
      bpm: beat.bpm,
      previews,
      purchases,
      conversion,
      nonExclSold,
      exclSold,
    };
  });

  const totalPreviews = beatPerformance.reduce((sum, b) => sum + b.previews, 0);
  const avgConversion = totalPreviews > 0 ? ((totalOrders / totalPreviews) * 100).toFixed(1) : "0.0";

  // 6. Recent Orders (Last 10)
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Overview</h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            Store performance, revenue analytics, and recent transactions
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/beats/new"
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Music className="w-3.5 h-3.5" />
            Upload Beat
          </Link>
          <Link
            href="/admin/orders"
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Orders
          </Link>
        </div>
      </div>

      {/* 1. Metric Cards Row with Colored Borders and Vibrant Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Revenue (Green Border & Icon) */}
        <div className="bg-bg-elevated border border-green-500/40 hover:border-green-500/70 rounded-lg p-4 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-text-muted uppercase tracking-[0.08em] font-medium">
              Total Revenue
            </span>
            <div className="w-7 h-7 rounded bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <DollarSign className="w-3.5 h-3.5 text-green-400" />
            </div>
          </div>
          <div className="text-[22px] font-medium text-text-primary font-mono">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-text-muted mt-1">
            All time
          </div>
        </div>

        {/* Card 2: This Month (Teal Border & Icon) */}
        <div className="bg-bg-elevated border border-teal-500/40 hover:border-teal-500/70 rounded-lg p-4 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-text-muted uppercase tracking-[0.08em] font-medium">
              This Month
            </span>
            <div className="w-7 h-7 rounded bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            </div>
          </div>
          <div className="text-[22px] font-medium text-text-primary font-mono">
            ${thisMonthRevenue.toFixed(2)}
          </div>
          <div
            className={`text-[11px] font-mono mt-1 ${
              isPositiveGrowth ? "text-badge-success-text" : "text-badge-danger-text"
            }`}
          >
            {growthText}
          </div>
        </div>

        {/* Card 3: Licenses Sold (Sky Blue Border & Icon) */}
        <div className="bg-bg-elevated border border-sky-500/40 hover:border-sky-500/70 rounded-lg p-4 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-text-muted uppercase tracking-[0.08em] font-medium">
              Licenses Sold
            </span>
            <div className="w-7 h-7 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShoppingCart className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>
          <div className="text-[22px] font-medium text-text-primary font-mono">
            {totalOrders}
          </div>
          <div className="text-[11px] text-text-muted mt-1 font-mono">
            {nonExclCount} non-excl · {exclCount} excl
          </div>
        </div>

        {/* Card 4: Avg. Conversion (Amber Gold Border & Icon) */}
        <div className="bg-bg-elevated border border-amber-500/40 hover:border-amber-500/70 rounded-lg p-4 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-text-muted uppercase tracking-[0.08em] font-medium">
              Avg. Conversion
            </span>
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <div className="text-[22px] font-medium text-text-primary font-mono">
            {avgConversion}%
          </div>
          <div className="text-[11px] text-text-muted mt-1">
            Preview → purchase
          </div>
        </div>
      </div>

      {/* 2. Monthly Revenue Chart & License Split Component */}
      <RevenueChart
        monthlyData={monthlyData}
        nonExclCount={nonExclCount}
        exclCount={exclCount}
        totalOrders={totalOrders}
      />

      {/* 3. Beat Performance Table */}
      <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="font-medium text-[13px] text-text-secondary uppercase tracking-wider">
            Beat Performance
          </h3>
          <Link
            href="/admin/beats"
            className="text-[12px] text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 font-mono"
          >
            View all beats →
          </Link>
        </div>

        {beatPerformance.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-xs">
            No beats in catalogue yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated/40">
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider">
                    Beat Title
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider font-mono text-right">
                    Previews
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider font-mono text-right">
                    Purchases
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider font-mono text-right">
                    Conversion
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider font-mono text-right">
                    Non-Excl Sold
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider font-mono text-right">
                    Excl Sold
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {beatPerformance.map((beat) => (
                  <tr key={beat.id} className="hover:bg-bg-hover transition-colors">
                    <td className="py-3 px-4 font-medium text-text-primary">
                      <Link href={`/admin/beats/${beat.id}`} className="hover:underline">
                        {beat.title}
                      </Link>
                      <span className="text-[11px] text-text-muted font-mono ml-2 font-normal">
                        ({beat.genre} · {beat.bpm} BPM)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary text-right">
                      {beat.previews}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-primary font-medium text-right">
                      {beat.purchases}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary text-right">
                      {beat.conversion}%
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary text-right">
                      {beat.nonExclSold}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary text-right">
                      {beat.exclSold > 0 ? (
                        <span className="text-badge-danger-text font-bold">1 (Sold)</span>
                      ) : (
                        "0"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Recent Orders Table */}
      <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="font-medium text-[13px] text-text-secondary uppercase tracking-wider">
            Recent Orders
          </h3>
          <Link
            href="/admin/orders"
            className="text-[12px] text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 font-mono"
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-xs">
            No orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated/40">
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider font-mono">
                    Order Ref
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider">
                    Beat
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider">
                    License
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider text-right font-mono">
                    Amount
                  </th>
                  <th className="py-2.5 px-4 font-normal text-text-muted text-[11px] uppercase tracking-wider font-mono text-right">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentOrders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={order.id} className="hover:bg-bg-hover transition-colors">
                      {/* Order Ref */}
                      <td className="py-3 px-4 font-mono text-[12px] text-text-muted">
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-text-primary underline">
                          {order.reference}
                        </Link>
                      </td>

                      {/* Customer Email */}
                      <td className="py-3 px-4 text-text-secondary truncate max-w-[200px]">
                        {order.customer.email}
                      </td>

                      {/* Beat */}
                      <td className="py-3 px-4 text-text-primary font-medium">
                        {order.beat.title}
                      </td>

                      {/* License Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`badge ${
                            order.licenseType === "EXCLUSIVE"
                              ? "badge-neutral"
                              : "badge-success"
                          }`}
                        >
                          {order.licenseType === "EXCLUSIVE" ? "Exclusive" : "Non-Exclusive"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-mono font-medium text-text-primary text-right">
                        ${Number(order.amountUsd).toFixed(2)}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-[12px] text-text-muted text-right">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}