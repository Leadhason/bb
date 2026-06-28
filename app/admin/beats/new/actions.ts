"use server";

import prisma from "../../../../lib/prisma";
import { revalidatePath } from "next/cache";

interface UploadBeatInput {
  title: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  coverUrl: string;
  mp3Url: string;
  wavUrl: string;
  nonExclusiveEnabled: boolean;
  nonExclusivePrice: number;
  nonExclusiveCap: number | null;
  exclusiveEnabled: boolean;
  exclusivePrice: number;
  published: boolean;
}

export async function uploadBeatAction(data: UploadBeatInput) {
  try {
    const {
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
    } = data;

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
    revalidatePath("/admin/beats");
    
    return { success: true, beatId: beat.id };

  } catch (error: any) {
    console.error("Error creating beat:", error);
    return { success: false, error: "Database error: Could not create beat." };
  }
}