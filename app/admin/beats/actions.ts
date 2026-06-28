"use server";

import prisma from "../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleBeatPublish(beatId: string, isPublished: boolean) {
  try {
    await prisma.beat.update({
      where: { id: beatId },
      data: { published: isPublished },
    });

    revalidatePath("/admin/beats");
    return { success: true };
  } catch (error) {
    console.error("Error updating beat:", error);
    return { success: false, error: "Failed to update beat" };
  }
}

export async function deleteBeat(beatId: string) {
  try {
    // Check if the beat has any orders
    const orderCount = await prisma.order.count({
      where: { beatId },
    });

    if (orderCount > 0) {
      return {
        success: false,
        error: "This beat has existing customer orders and cannot be permanently deleted. Please unpublish it to hide it from the storefront."
      };
    }

    await prisma.beat.delete({
      where: { id: beatId },
    });

    revalidatePath("/admin/beats");
    return { success: true };
  } catch (error) {
    console.error("Error deleting beat:", error);
    return { success: false, error: "Failed to delete beat" };
  }
}

export async function updateBeat(
  beatId: string,
  data: {
    title?: string;
    bpm?: number;
    key?: string;
    genre?: string;
    tags?: string[];
    nonExclusiveEnabled?: boolean;
    nonExclusivePrice?: number;
    nonExclusiveCap?: number | null;
    exclusiveEnabled?: boolean;
    exclusivePrice?: number;
    published?: boolean;
  }
) {
  try {
    const beat = await prisma.beat.update({
      where: { id: beatId },
      data,
    });

    revalidatePath("/admin/beats");
    revalidatePath("/admin/beats/[id]");
    return { success: true, beat };
  } catch (error) {
    console.error("Error updating beat:", error);
    return { success: false, error: "Failed to update beat" };
  }
}

export async function deleteUnpublishedBeats() {
  try {
    // Find all unpublished beats with their order counts
    const unpublishedBeats = await prisma.beat.findMany({
      where: { published: false },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    // Separate those with and without orders
    const beatsToDelete = unpublishedBeats.filter(b => b._count.orders === 0);
    const beatsToKeep = unpublishedBeats.filter(b => b._count.orders > 0);

    if (beatsToDelete.length === 0) {
      if (beatsToKeep.length > 0) {
        return {
          success: false,
          error: "No drafts were deleted. All current drafts have existing customer orders and must be kept."
        };
      }
      return { success: true }; // Nothing to delete
    }

    await prisma.beat.deleteMany({
      where: {
        id: { in: beatsToDelete.map(b => b.id) }
      }
    });

    revalidatePath("/admin/beats");

    if (beatsToKeep.length > 0) {
      return {
        success: true,
        message: `Deleted ${beatsToDelete.length} draft beats. ${beatsToKeep.length} drafts could not be deleted because they have customer orders.`
      };
    }

    return { success: true, message: `Successfully deleted all ${beatsToDelete.length} draft beats.` };
  } catch (error) {
    console.error("Error deleting unpublished beats:", error);
    return { success: false, error: "Failed to delete unpublished beats" };
  }
}
