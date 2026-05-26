import React from "react";
import Link from "next/link";
import { getOrders } from "./actions";
import prisma from "@/lib/prisma";
import { Package, Eye, ChevronRight, AlertCircle } from "lucide-react";
import { OrderFilters } from "./OrderFilters";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    beat?: string;
    licenseType?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const params = await searchParams;

  // Parse filter parameters
  const filters: any = {};
  if (params.beat) filters.beatId = params.beat;
  if (params.licenseType) filters.licenseType = params.licenseType;
  if (params.startDate) filters.startDate = new Date(params.startDate);
  if (params.endDate) {
    const endDate = new Date(params.endDate);
    endDate.setHours(23, 59, 59, 999); // Include entire day
    filters.endDate = endDate;
  }

  // Fetch orders with applied filters
  const orders = await getOrders(filters);

  // Fetch all beats for filter dropdown
  const beats = await prisma.beat.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Format date helper
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "Orders" },
      ]} />
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-text-secondary" />
          <h1 className="font-syne font-bold text-3xl text-text-primary uppercase tracking-wide">
            Orders
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          {orders.length} {orders.length === 1 ? "order" : "orders"} found
        </p>
      </div>

      {/* Filters */}
      <OrderFilters beats={beats} currentFilters={params} />

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="font-syne font-medium text-text-secondary mb-1">No orders found</p>
          <p className="text-xs text-text-muted">
            Orders will appear here once customers complete purchases.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Beat
                </th>
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  License
                </th>
                <th className="text-right py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-center py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Downloads
                </th>
                <th className="text-left py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right py-3 px-4 font-syne font-semibold text-xs text-text-secondary uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border-subtle hover:bg-bg-hover transition-colors"
                >
                  {/* Order Reference */}
                  <td className="py-3 px-4">
                    <code className="font-dm-mono text-xs text-text-primary bg-bg-elevated px-2 py-1 rounded">
                      {order.reference}
                    </code>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-syne font-medium text-sm text-text-primary">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-text-muted">{order.customer.email}</p>
                    </div>
                  </td>

                  {/* Beat */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={order.beat.coverUrl}
                        alt={order.beat.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <p className="font-syne text-sm text-text-primary">{order.beat.title}</p>
                    </div>
                  </td>

                  {/* License Type */}
                  <td className="py-3 px-4">
                    <span
                      className={`font-syne text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${
                        order.licenseType === "EXCLUSIVE"
                          ? "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)]"
                          : "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]"
                      }`}
                    >
                      {order.licenseType === "EXCLUSIVE" ? "Exclusive" : "Non-Ex"}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 text-right">
                    <p className="font-dm-mono font-medium text-sm text-text-primary">
                      ${order.amountUsd.toFixed(2)}
                    </p>
                  </td>

                  {/* Download Attempts */}
                  <td className="py-3 px-4 text-center">
                    <span className="font-dm-mono text-xs text-text-secondary">
                      {order.downloadAttempts}/3
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4">
                    <p className="text-xs text-text-secondary">{formatDate(order.createdAt)}</p>
                  </td>

                  {/* View Details */}
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs text-accent hover:text-text-primary transition-colors font-syne font-medium"
                    >
                      View
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
