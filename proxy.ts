import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
    const producerClerkId =
      process.env.NEXT_PUBLIC_PRODUCER_CLERK_ID ||
      process.env.PRODUCER_CLERK_ID;

    // Admin route: only producer can access
    if (isAdminRoute(req)) {
      if (!producerClerkId) {
        console.warn("⚠️  PRODUCER_CLERK_ID not set. All authenticated users can access admin.");
        return;
      }

      if (!userId || userId !== producerClerkId) {
        return Response.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Dashboard route: customers only (producers cannot access)
    if (isDashboardRoute(req)) {
      if (producerClerkId && userId === producerClerkId) {
        // Producer trying to access customer dashboard
        return Response.redirect(new URL("/admin", req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/(admin|dashboard)(.*)"],
};