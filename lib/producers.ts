/**
 * Utility functions for producer authentication and identification.
 * Supports multiple producer Clerk IDs configured via environment variables.
 */

export function getProducerClerkIds(): string[] {
  const envSources = [
    process.env.NEXT_PUBLIC_PRODUCER_CLERK_IDS,
    process.env.PRODUCER_CLERK_IDS,
    process.env.NEXT_PUBLIC_PRODUCER_CLERK_ID,
    process.env.PRODUCER_CLERK_ID,
  ];

  const idsSet = new Set<string>();

  for (const source of envSources) {
    if (!source) continue;
    const items = source.split(",");
    for (const item of items) {
      const clean = item.trim().replace(/^["']|["']$/g, "").trim();
      if (clean) {
        idsSet.add(clean);
      }
    }
  }

  return Array.from(idsSet);
}

export function isProducerId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const producerIds = getProducerClerkIds();
  return producerIds.includes(userId);
}

export function getProducerClerkId(): string {
  const ids = getProducerClerkIds();
  if (ids.length === 0) {
    throw new Error(
      "PRODUCER_CLERK_IDS environment variable not set. Please configure the producer's Clerk ID(s)."
    );
  }
  return ids[0];
}
