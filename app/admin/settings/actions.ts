"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface StoreSettings {
  id: string;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  contactEmail: string | null;
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  let store = await prisma.store.findFirst({
    select: {
      id: true,
      youtubeUrl: true,
      instagramUrl: true,
      contactEmail: true,
    },
  });

  // Create default store if none exists
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: "My Beat Store",
        bio: "",
        youtubeUrl: null,
        instagramUrl: null,
        contactEmail: null,
        featuredBeatIds: [],
      },
      select: {
        id: true,
        youtubeUrl: true,
        instagramUrl: true,
        contactEmail: true,
      },
    });
  }

  return store;
}

export async function updateStoreSettings(data: Partial<StoreSettings>) {
  let store = await prisma.store.findFirst();

  if (!store) {
    store = await prisma.store.create({
      data: {
        name: "My Beat Store",
        bio: "",
        youtubeUrl: data.youtubeUrl || null,
        instagramUrl: data.instagramUrl || null,
        contactEmail: data.contactEmail || null,
        featuredBeatIds: [],
      },
    });
  } else {
    store = await prisma.store.update({
      where: { id: store.id },
      data: {
        youtubeUrl: data.youtubeUrl,
        instagramUrl: data.instagramUrl,
        contactEmail: data.contactEmail,
      },
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/contact");
  return store;
}
