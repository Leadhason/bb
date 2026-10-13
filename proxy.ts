import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getProducerClerkIds, isProducerId } from "./lib/producers";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();                    // ✅ protect() is on the helper

    const { userId } = await auth();         // ✅ userId comes from calling auth()
    const producerClerkIds = getProducerClerkIds();

    // Admin route: only producer can access
    if (isAdminRoute(req)) {
      if (producerClerkIds.length === 0) {
        console.warn("⚠️  PRODUCER_CLERK_IDS not set. All authenticated users can access admin.");
        return;
      }

      if (!userId || !isProducerId(userId)) {
        return Response.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Dashboard route: customers only (producers cannot access)
    if (isDashboardRoute(req)) {
      if (isProducerId(userId)) {
        // Producer trying to access customer dashboard
        return Response.redirect(new URL("/admin", req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    // Protect admin and customer dashboard pages
    "/(admin|dashboard)(.*)",
    // Process API routes so auth() detects clerkMiddleware
    "/api/(.*)",
  ],
};