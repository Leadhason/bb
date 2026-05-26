"use server";

import prisma from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function uploadBeatAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const bpm = parseInt(formData.get("bpm") as string, 10);
    const key = formData.get("key") as string;
    const genre = formData.get("genre") as string;
    
    // Parse comma separated tags
    const tagsString = formData.get("tags") as string;
    const tags = tagsString ? tagsString.split(",").map((tag: string) => tag.trim()).filter(Boolean) : [];

    const coverUrl = formData.get("coverUrl") as string;
    const mp3Url = formData.get("mp3Url") as string;
    const wavUrl = formData.get("wavUrl") as string;

    const nonExclusiveEnabled = formData.get("nonExclusiveEnabled") === "true";
    const nonExclusivePrice = parseFloat(formData.get("nonExclusivePrice") as string) || 0;
    
    const rawNonExclusiveCap = formData.get("nonExclusiveCap") as string;
    const nonExclusiveCap = rawNonExclusiveCap ? parseInt(rawNonExclusiveCap, 10) : null;

    const exclusiveEnabled = formData.get("exclusiveEnabled") === "true";
    const exclusivePrice = parseFloat(formData.get("exclusivePrice") as string) || 0;

    const published = formData.get("published") === "true";

    // Create the beat in the database
    const beat = await prisma.beat.create({
      data: {
        title,
        bpm,
        key,
        genre,
        tags,
        coverUrl,
        mp3Url,
        wavUrl,
        nonExclusiveEnabled,
        nonExclusivePrice,
        nonExclusiveCap,
        exclusiveEnabled,
        exclusivePrice,
        published,
      }
    });

    revalidatePath("/");
    
    return { success: true, beatId: beat.id };

  } catch (error: any) {
    console.error("Error creating beat:", error);
    return { success: false, error: "Database error: Could not create beat." };
  }
}