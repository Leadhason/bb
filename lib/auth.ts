import { currentUser } from "@clerk/nextjs/server";
import {
  getProducerClerkIds,
  isProducerId,
  getProducerClerkId,
} from "./producers";

export { getProducerClerkIds, isProducerId, getProducerClerkId };

/**
 * Check if current user is authenticated
 */
export async function isAuthenticated() {
  const user = await currentUser();
  return !!user;
}

/**
 * Check if current user is the producer/admin
 */
export async function isProducer() {
  const user = await currentUser();
  if (!user) return false;

  return isProducerId(user.id);
}

/**
 * Get current user or throw error if not authenticated
 */
export async function getCurrentUser() {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}

/**
 * Require producer access or redirect
 */
export async function requireProducer() {
  const user = await currentUser();
  if (!user) {
    return { success: false, redirect: "/login" };
  }

  const isProducerUser = await isProducer();
  if (!isProducerUser) {
    return { success: false, redirect: "/unauthorized" };
  }

  return { success: true, user };
}
