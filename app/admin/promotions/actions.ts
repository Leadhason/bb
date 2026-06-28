"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Discount Codes

export interface DiscountCodeWithStats {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: Date | null;
  active: boolean;
  createdAt?: Date;
}

export async function getDiscountCodes(): Promise<DiscountCodeWithStats[]> {
  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return codes.map((code) => ({
    ...code,
    value: Number(code.value),
  }));
}

export async function getDiscountCodeById(id: string): Promise<DiscountCodeWithStats | null> {
  const code = await prisma.discountCode.findUnique({
    where: { id },
  });

  if (!code) return null;

  return {
    ...code,
    value: Number(code.value),
  };
}

export async function createDiscountCode(data: {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  usageLimit?: number;
  expiresAt?: Date;
}) {
  const existingCode = await prisma.discountCode.findUnique({
    where: { code: data.code.toUpperCase() },
  });

  if (existingCode) {
    throw new Error("Discount code already exists");
  }

  const newCode = await prisma.discountCode.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      usageLimit: data.usageLimit || null,
      usageCount: 0,
      expiresAt: data.expiresAt || null,
      active: true,
    },
  });

  revalidatePath("/admin/promotions/discount-codes");

  return {
    ...newCode,
    value: Number(newCode.value),
  };
}

export async function updateDiscountCode(
  id: string,
  data: Partial<{
    code: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    usageLimit: number | null;
    expiresAt: Date | null;
    active: boolean;
  }>
) {
  if (data.code) {
    const existingCode = await prisma.discountCode.findFirst({
      where: {
        code: data.code.toUpperCase(),
        NOT: { id },
      },
    });

    if (existingCode) {
      throw new Error("Discount code already exists");
    }
  }

  const updated = await prisma.discountCode.update({
    where: { id },
    data: {
      code: data.code ? data.code.toUpperCase() : undefined,
      type: data.type,
      value: data.value,
      usageLimit: data.usageLimit,
      expiresAt: data.expiresAt,
      active: data.active,
    },
  });

  revalidatePath("/admin/promotions/discount-codes");

  return {
    ...updated,
    value: Number(updated.value),
  };
}

export async function deleteDiscountCode(id: string) {
  await prisma.discountCode.delete({
    where: { id },
  });

  revalidatePath("/admin/promotions/discount-codes");
}

export async function toggleDiscountCodeActive(id: string, active: boolean) {
  await prisma.discountCode.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/admin/promotions/discount-codes");
}

// Bulk Discount Rules

export interface BulkDiscountRuleWithStats {
  id: string;
  minQuantity: number;
  discountPercent: number;
  stackable: boolean;
  active: boolean;
  createdAt?: Date;
}

export async function getBulkDiscountRules(): Promise<BulkDiscountRuleWithStats[]> {
  const rules = await prisma.bulkDiscountRule.findMany({
    orderBy: { minQuantity: "asc" },
  });

  return rules.map((rule) => ({
    ...rule,
    discountPercent: Number(rule.discountPercent),
  }));
}

export async function getBulkDiscountRuleById(id: string): Promise<BulkDiscountRuleWithStats | null> {
  const rule = await prisma.bulkDiscountRule.findUnique({
    where: { id },
  });

  if (!rule) return null;

  return {
    ...rule,
    discountPercent: Number(rule.discountPercent),
  };
}

export async function createBulkDiscountRule(data: {
  minQuantity: number;
  discountPercent: number;
  stackable: boolean;
}) {
  const newRule = await prisma.bulkDiscountRule.create({
    data: {
      minQuantity: data.minQuantity,
      discountPercent: data.discountPercent,
      stackable: data.stackable,
      active: true,
    },
  });

  revalidatePath("/admin/promotions/bulk-discounts");

  return {
    ...newRule,
    discountPercent: Number(newRule.discountPercent),
  };
}

export async function updateBulkDiscountRule(
  id: string,
  data: Partial<{
    minQuantity: number;
    discountPercent: number;
    stackable: boolean;
    active: boolean;
  }>
) {
  const updated = await prisma.bulkDiscountRule.update({
    where: { id },
    data: {
      minQuantity: data.minQuantity,
      discountPercent: data.discountPercent,
      stackable: data.stackable,
      active: data.active,
    },
  });

  revalidatePath("/admin/promotions/bulk-discounts");

  return {
    ...updated,
    discountPercent: Number(updated.discountPercent),
  };
}

export async function deleteBulkDiscountRule(id: string) {
  await prisma.bulkDiscountRule.delete({
    where: { id },
  });

  revalidatePath("/admin/promotions/bulk-discounts");
}

export async function toggleBulkDiscountRuleActive(id: string, active: boolean) {
  await prisma.bulkDiscountRule.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/admin/promotions/bulk-discounts");
}

export async function validateDiscountCodeAction(code: string) {
  try {
    const cleanCode = code.trim().toUpperCase();
    const discount = await prisma.discountCode.findUnique({
      where: { code: cleanCode },
    });

    if (!discount) {
      return { success: false, error: "Invalid discount code" };
    }

    if (!discount.active) {
      return { success: false, error: "Discount code is inactive" };
    }

    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return { success: false, error: "Discount code has expired" };
    }

    if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
      return { success: false, error: "Discount code usage limit reached" };
    }

    return {
      success: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: Number(discount.value),
      },
    };
  } catch (error) {
    console.error("Error validating discount code:", error);
    return { success: false, error: "Failed to validate discount code" };
  }
}

export async function getActiveBulkDiscountRules() {
  try {
    const rules = await prisma.bulkDiscountRule.findMany({
      where: { active: true },
      orderBy: { minQuantity: "desc" },
    });
    return rules.map((rule) => ({
      ...rule,
      discountPercent: Number(rule.discountPercent),
    }));
  } catch (error) {
    console.error("Error fetching active bulk rules:", error);
    return [];
  }
}

