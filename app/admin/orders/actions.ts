"use server";

import prisma from "@/lib/prisma";

export interface OrderWithDetails {
  id: string;
  reference: string;
  customerId: string;
  beatId: string;
  licenseType: "NON_EXCLUSIVE" | "EXCLUSIVE";
  amountUsd: number;
  paystackReference: string;
  downloadAttempts: number;
  linkExpiresAt: Date;
  createdAt: Date;
  customer: {
    id: string;
    email: string;
    name: string;
  };
  beat: {
    id: string;
    title: string;
    coverUrl: string;
  };
}

export async function getOrders(filters?: {
  beatId?: string;
  licenseType?: "NON_EXCLUSIVE" | "EXCLUSIVE";
  startDate?: Date;
  endDate?: Date;
}): Promise<OrderWithDetails[]> {
  const where: any = {};

  if (filters?.beatId) {
    where.beatId = filters.beatId;
  }

  if (filters?.licenseType) {
    where.licenseType = filters.licenseType;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      beat: {
        select: {
          id: true,
          title: true,
          coverUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map((order) => ({
    ...order,
    amountUsd: Number(order.amountUsd),
  }));
}

export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      beat: true,
    },
  });

  if (!order) return null;

  return {
    ...order,
    amountUsd: Number(order.amountUsd),
  };
}

export async function getOrderStats() {
  const totalOrders = await prisma.order.count();
  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      amountUsd: true,
    },
  });

  const licenseBreakdown = await prisma.order.groupBy({
    by: ["licenseType"],
    _count: true,
  });

  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: { email: true, name: true },
      },
      beat: {
        select: { title: true },
      },
    },
  });

  return {
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.amountUsd || 0),
    licenseBreakdown,
    recentOrders: recentOrders.map((order) => ({
      ...order,
      amountUsd: Number(order.amountUsd),
    })),
  };
}
