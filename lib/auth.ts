import { currentUser } from "@clerk/nextjs/server";

/**
 * Get the producer's Clerk ID from environment
 */
function getProducerClerkId(): string {
  const producerId = process.env.NEXT_PUBLIC_PRODUCER_CLERK_ID || process.env.PRODUCER_CLERK_ID;
  if (!producerId) {
    throw new Error(
      "PRODUCER_CLERK_ID environment variable not set. Please configure the producer's Clerk ID."
    );
  }
  return producerId;
}

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

  const producerClerkId = getProducerClerkId();
  return user.id === producerClerkId;
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
