"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface StoreSettings {
  id: string;
  name: string;
  bio: string;
  profileImageUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  discordUrl: string | null;
  featuredBeatIds: string[];
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  let store = await prisma.store.findFirst();

  // Create default store if none exists
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: "My Beat Store",
        bio: "",
        profileImageUrl: null,
        twitterUrl: null,
        instagramUrl: null,
        tiktokUrl: null,
        discordUrl: null,
        featuredBeatIds: [],
      },
    });
  }

  return store;
}

export async function updateStoreSettings(data: Partial<StoreSettings>) {
  let store = await prisma.store.findFirst();

  if (!store) {
    // Create if doesn't exist
    store = await prisma.store.create({
      data: {
        name: data.name || "My Beat Store",
        bio: data.bio || "",
        profileImageUrl: data.profileImageUrl || null,
        twitterUrl: data.twitterUrl || null,
        instagramUrl: data.instagramUrl || null,
        tiktokUrl: data.tiktokUrl || null,
        discordUrl: data.discordUrl || null,
        featuredBeatIds: data.featuredBeatIds || [],
      },
    });
  } else {
    // Update existing
    store = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: data.name,
        bio: data.bio,
        profileImageUrl: data.profileImageUrl,
        twitterUrl: data.twitterUrl,
        instagramUrl: data.instagramUrl,
        tiktokUrl: data.tiktokUrl,
        discordUrl: data.discordUrl,
        featuredBeatIds: data.featuredBeatIds,
      },
    });
  }

  revalidatePath("/admin/settings");
  return store;
}
