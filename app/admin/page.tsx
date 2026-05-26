import React from "react";
import prisma from "../../lib/prisma";
import Link from "next/link";
import { Music, ArrowRight, TrendingUp, DollarSign, ShoppingCart, Tag, Settings } from "lucide-react";

export default async function AdminDashboardPage() {
  // Authorization is handled by layout middleware
  
  // Fetch some summary stats
  const totalBeats = await prisma.beat.count();
  const publishedBeats = await prisma.beat.count({ where: { published: true } });
  
  // Later we can add total orders and revenue here
  const totalRevenue = 0; // placeholder
  const totalOrders = 0; // placeholder
  
  const recentBeats = await prisma.beat.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-syne text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="font-mono text-sm text-text-muted mt-2">Overview of your beat store performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border-default rounded-xl p-5">
          <div className="flex items-center gap-3 text-text-secondary mb-3">
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="font-syne font-medium text-sm">Total Revenue</span>
          </div>
          <div className="font-mono text-3xl text-text-primary">${totalRevenue.toFixed(2)}</div>
        </div>
        
        <div className="bg-bg-surface border border-border-default rounded-xl p-5">
          <div className="flex items-center gap-3 text-text-secondary mb-3">
            <TrendingUp className="w-5 h-5 text-accent" />
            <span className="font-syne font-medium text-sm">Total Orders</span>
          </div>
          <div className="font-mono text-3xl text-text-primary">{totalOrders}</div>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-xl p-5">
          <div className="flex items-center gap-3 text-text-secondary mb-3">
            <Music className="w-5 h-5 text-accent" />
            <span className="font-syne font-medium text-sm">Total Beats</span>
          </div>
          <div className="font-mono text-3xl text-text-primary">{totalBeats}</div>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-xl p-5">
          <div className="flex items-center gap-3 text-text-secondary mb-3">
            <div className="w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
            <span className="font-syne font-medium text-sm">Published</span>
          </div>
          <div className="font-mono text-3xl text-text-primary">{publishedBeats}</div>
        </div>
      </div>

      {/* Recent Beats & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-syne text-xl font-bold text-text-primary">Recent Beats</h2>
            <Link href="/admin/beats" className="font-syne text-sm text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden">
            {recentBeats.length === 0 ? (
              <div className="p-8 text-center text-text-muted font-syne text-sm">
                No beats uploaded yet.
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {recentBeats.map(beat => (
                  <div key={beat.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Using a placeholder gradient for cover since we might not have a valid URL logic if it fails */}
                      <div className="w-12 h-12 rounded-md bg-bg-elevated border border-border-strong flex-shrink-0" />
                      <div>
                        <h4 className="font-syne font-medium text-text-primary">{beat.title}</h4>
                        <p className="font-mono text-xs text-text-muted mt-0.5">{beat.genre} · {beat.bpm} BPM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${beat.published ? 'bg-badge-success-bg text-badge-success-text' : 'bg-badge-neutral-bg text-badge-neutral-text'}`}>
                        {beat.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="font-mono text-sm text-text-primary">
                        ${Number(beat.nonExclusivePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-syne text-xl font-bold text-text-primary">Quick Actions</h2>
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 flex flex-col gap-2">
            <Link href="/admin/beats/new" className="btn-primary h-10 flex items-center justify-center gap-2 rounded-md font-syne text-sm">
              <Music className="w-4 h-4" /> Upload New Beat
            </Link>
            <Link href="/admin/orders" className="btn-secondary h-10 flex items-center justify-center gap-2 rounded-md font-syne text-sm">
              <ShoppingCart className="w-4 h-4" /> View Orders
            </Link>
            <Link href="/admin/promotions" className="btn-secondary h-10 flex items-center justify-center gap-2 rounded-md font-syne text-sm">
              <Tag className="w-4 h-4" /> Manage Promos
            </Link>
            <Link href="/admin/settings" className="btn-secondary h-10 flex items-center justify-center gap-2 rounded-md font-syne text-sm">
              <Settings className="w-4 h-4" /> Store Settings
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}