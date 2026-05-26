import React from "react";
import Link from "next/link";
import { getOrderById } from "../actions";
import { ChevronLeft, Package, AlertCircle, Clock, Download, Disc } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLinkExpired = new Date(order.linkExpiresAt) < new Date();
  const daysUntilExpiry = Math.ceil(
    (new Date(order.linkExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Orders", href: "/admin/orders" },
        { label: order.orderReference },
      ]} />
      {/* Header with Back Button */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-accent hover:text-text-primary transition-colors font-syne font-medium text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-text-secondary" />
          <h1 className="font-syne font-bold text-3xl text-text-primary uppercase tracking-wide">
            Order Details
          </h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Order & Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Info Card */}
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <h2 className="font-syne font-semibold text-sm text-text-secondary uppercase tracking-wider mb-4">
              Order Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Order Reference</p>
                  <code className="font-dm-mono text-lg font-bold text-text-primary">
                    {order.reference}
                  </code>
                </div>
                <span
                  className={`font-syne text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider ${
                    order.licenseType === "EXCLUSIVE"
                      ? "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)]"
                      : "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                  }`}
                >
                  {order.licenseType === "EXCLUSIVE" ? "Exclusive License" : "Non-Exclusive License"}
                </span>
              </div>

              <div className="pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Paystack Reference</p>
                <code className="font-dm-mono text-sm text-text-primary">
                  {order.paystackReference}
                </code>
              </div>

              <div className="pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Order Date</p>
                <p className="text-sm text-text-primary">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <h2 className="font-syne font-semibold text-sm text-text-secondary uppercase tracking-wider mb-4">
              Customer Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Name</p>
                <p className="text-sm font-syne font-medium text-text-primary">
                  {order.customer.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Email</p>
                <a
                  href={`mailto:${order.customer.email}`}
                  className="text-sm text-accent hover:text-text-primary transition-colors font-dm-mono"
                >
                  {order.customer.email}
                </a>
              </div>
            </div>
          </div>

          {/* Beat Info Card */}
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
            <h2 className="font-syne font-semibold text-sm text-text-secondary uppercase tracking-wider mb-4">
              Beat Purchased
            </h2>
            <div className="flex gap-4">
              <img
                src={order.beat.coverUrl}
                alt={order.beat.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Title</p>
                <p className="text-sm font-syne font-medium text-text-primary mb-3">
                  {order.beat.title}
                </p>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">License Type</p>
                <p className="text-sm text-text-primary font-syne font-medium">
                  {order.licenseType === "EXCLUSIVE"
                    ? "Exclusive License"
                    : "Non-Exclusive License"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Amount & Download Status */}
        <div className="space-y-6">
          
          {/* Amount Card */}
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Amount Paid</p>
            <p className="font-dm-mono text-3xl font-bold text-accent mb-1">
              ${order.amountUsd.toFixed(2)}
            </p>
            <p className="text-xs text-text-secondary">USD</p>
          </div>

          {/* Download Status Card */}
          <div
            className={`rounded-lg p-6 border ${
              isLinkExpired
                ? "bg-[var(--badge-danger-bg)] border-[var(--badge-danger-text)] bg-opacity-10"
                : "bg-bg-surface border-border-subtle"
            }`}
          >
            <div className="flex items-start gap-2 mb-4">
              <Download className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" />
              <h3 className="font-syne font-semibold text-sm text-text-primary uppercase tracking-wider">
                Download Status
              </h3>
            </div>

            <div className="space-y-4">
              {/* Attempts Counter */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
                  Attempts Remaining
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        order.downloadAttempts >= 3
                          ? "bg-[var(--badge-danger-bg)]"
                          : "bg-[var(--badge-success-bg)]"
                      }`}
                      style={{
                        width: `${((3 - order.downloadAttempts) / 3) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-dm-mono font-bold text-sm text-text-primary">
                    {Math.max(0, 3 - order.downloadAttempts)}/3
                  </span>
                </div>
              </div>

              {/* Expiry Status */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
                  Link Expiry
                </p>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-syne font-medium text-text-primary">
                      {formatDate(order.linkExpiresAt)}
                    </p>
                    <p
                      className={`text-xs mt-1 font-medium ${
                        isLinkExpired
                          ? "text-[var(--badge-danger-text)]"
                          : daysUntilExpiry <= 1
                          ? "text-[var(--badge-warning-text)]"
                          : "text-[var(--badge-success-text)]"
                      }`}
                    >
                      {isLinkExpired
                        ? "Link expired"
                        : daysUntilExpiry === 0
                        ? "Expires today"
                        : daysUntilExpiry === 1
                        ? "Expires tomorrow"
                        : `${daysUntilExpiry} days remaining`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Exhausted Alert */}
              {order.downloadAttempts >= 3 && (
                <div className="mt-4 p-3 bg-[var(--badge-danger-bg)] bg-opacity-20 border border-[var(--badge-danger-text)] rounded-md">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-[var(--badge-danger-text)] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--badge-danger-text)] font-medium">
                      Download limit exhausted. Customer can request a new link via resend page.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
