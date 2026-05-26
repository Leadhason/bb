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
